import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { catchError, of, Subject, switchMap, tap } from 'rxjs';

// Services
import { AuthService } from '../../services/auth/auth.service';
import { Environment, ErrorService } from '@services';

// Utility
import { environment } from '../../../environments/environment';
import { ConfigService } from '../../services/config/config.service';

interface LoginForm {
  clientId: FormControl<string | null>;
  clientSecret: FormControl<string | null>;
  bearerToken: FormControl<string | null>;
  customerGuid: FormControl<string>;
  environment: FormControl<Environment>;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('loading', { static: false }) loading!: TemplateRef<any>;

  env = environment;
  loginForm!: FormGroup<LoginForm>;

  bearer = false;
  unsubscribe$ = new Subject();

  message = '';
  forgotPasswordLink = this.env.idpBaseUrl.staging;

  constructor(
    private router: Router,
    public authService: AuthService,
    private errorService: ErrorService,
    private configService: ConfigService,
    private dialog: MatDialog
  ) {
    // Redirect if authenticated
    if (this.authService.isAuthenticated.getValue())
      this.router.navigate(['demo/price-list']);
  }

  ngOnInit() {
    this.initLoginForm();
  }

  ngAfterViewInit() {
    // Auto-login from set environment variables
    if (this.loginForm.valid) this.login();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  login(publicLogin?: boolean): void {
    this.message = 'Authenticating bank...';

    const loadingDialog = this.dialog.open(this.loading);
    const controls = this.loginForm.controls;

    const bankToken = () => {
      if (publicLogin) {
        return this.authService.createBankToken(
          'sandbox',
          environment.credentials.publicClientId,
          environment.credentials.publicClientSecret
        );
      } else {
        return controls.bearerToken.value
          ? this.authService.setToken(controls.bearerToken.value)
          : this.authService.createBankToken(
              controls.environment.value,
              <string>controls.clientId.value,
              <string>controls.clientSecret.value
            );
      }
    };

    bankToken()
      .pipe(
        switchMap((token) => {
          this.message = 'Creating customer token...';
          return publicLogin
            ? this.authService.createCustomerToken(
                'sandbox',
                environment.credentials.publicCustomerGuid,
                token
              )
            : this.authService.createCustomerToken(
                controls.environment.value,
                controls.customerGuid.value,
                token
              );
        }),
        tap(() => this.authService.isAuthenticated.next(true)),
        switchMap(() => this.configService.getConfig()),
        tap(() => {
          loadingDialog.close();
        }),
        catchError((err) => {
          loadingDialog.close();
          this.handleLoginFormErrors(err);
          this.errorService.handleError(err);
          return of(err);
        })
      )
      .subscribe(() => this.router.navigate(['demo/price-list']));
  }

  initLoginForm(): void {
    this.loginForm = new FormGroup<LoginForm>({
      clientId: new FormControl(environment.credentials.clientId, {
        validators: [Validators.required, Validators.minLength(43)]
      }),
      clientSecret: new FormControl(environment.credentials.clientSecret, {
        validators: [Validators.required, Validators.minLength(43)]
      }),
      bearerToken: new FormControl(),
      customerGuid: new FormControl(environment.credentials.customerGuid, {
        validators: [Validators.required, Validators.minLength(32)],
        nonNullable: true
      }),
      environment: new FormControl('sandbox', { nonNullable: true })
    });

    this.loginForm.controls.environment.valueChanges.subscribe(() => {
      this.loginForm.controls.clientId.updateValueAndValidity();
      this.loginForm.controls.clientSecret.updateValueAndValidity();
      this.loginForm.controls.bearerToken.updateValueAndValidity();

      this.forgotPasswordLink =
        this.env.idpBaseUrl[this.loginForm.controls.environment.value];
    });
  }

  // Handle input validation between api keys and bearer token
  switchInput() {
    const apiKeyControls = [
      this.loginForm.controls.clientId,
      this.loginForm.controls.clientSecret
    ];
    const apiKeyValidators = [Validators.required, Validators.minLength(43)];
    const bearerToken = this.loginForm.controls.bearerToken;

    // Flip bearer state
    this.bearer = !this.bearer;
    bearerToken.clearValidators();
    bearerToken.updateValueAndValidity();

    apiKeyControls.forEach((control) => {
      control.clearValidators();
      control.updateValueAndValidity();
    });

    if (this.bearer) {
      bearerToken?.setValidators([Validators.required]);
      bearerToken?.updateValueAndValidity();
    } else {
      apiKeyControls.forEach((control) => {
        control.setValidators(apiKeyValidators);
        control.updateValueAndValidity();
      });
    }
  }

  handleLoginFormErrors(err: any): void {
    switch (err.status) {
      case 401: {
        if (this.bearer) {
          this.loginForm.controls.bearerToken.setErrors({
            unauthorized: true
          });
        } else
          this.loginForm.controls.clientId.setErrors({
            unauthorized: true
          });
        break;
      }
      case 404: {
        this.loginForm.controls.customerGuid.setErrors({
          not_found: true
        });
        break;
      }
      case 422: {
        this.loginForm.controls.customerGuid.setErrors({
          not_found: true
        });
        break;
      }
      case 500: {
        this.loginForm.controls.bearerToken.setErrors({
          unauthorized: true
        });
        break;
      }
      default:
        this.loginForm.setErrors({});
    }
  }
}
