import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { catchError, map, Observable, of, switchMap } from 'rxjs';

// Client
import { CustomerBankModel } from '@cybrid/cybrid-api-bank-angular';

// Services
import { DemoConfigService } from '../../services/demo-config/demo-config.service';

// Utility
import { environment } from '../../../environments/environment';

interface LoginForm {
  clientId: FormControl<string>;
  clientSecret: FormControl<string>;
  bearerToken: FormControl<string>;
  customerGuid: FormControl<string>;
  environment: FormControl<'demo' | 'staging' | 'sandbox' | 'production'>;
}

export interface DemoCredentials {
  token: string;
  customer: string;
  isPublic: boolean;
  environment: 'demo' | 'staging' | 'sandbox' | 'production';
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @Output() credentials = new EventEmitter<DemoCredentials>();

  bearer = false;
  environment = ['demo', 'staging', 'sandbox', 'production'];
  demoCredentials: DemoCredentials = {
    token: '',
    customer: '',
    isPublic: false,
    environment: 'demo'
  };

  // PUBLIC CREDENTIALS FOR NO-LOGIN DEMO
  readonly publicClientId = environment.credentials.publicClientId;
  readonly publicClientSecret = environment.credentials.publicClientSecret;
  readonly publicCustomerGuid = environment.credentials.publicCustomerGuid;

  loginForm!: FormGroup<LoginForm>;

  constructor(
    private http: HttpClient,
    private configService: DemoConfigService
  ) {}

  ngOnInit() {
    this.initLoginForm();
  }

  initLoginForm(): void {
    // Preset with environment variables for simplified local testing
    this.loginForm = new FormGroup<LoginForm>({
      clientId: new FormControl(environment.credentials.clientId, {
        validators: [Validators.required, Validators.minLength(43)],
        nonNullable: true
      }),
      clientSecret: new FormControl(environment.credentials.clientSecret, {
        validators: [Validators.required, Validators.minLength(43)],
        nonNullable: true
      }),
      bearerToken: new FormControl('', {
        nonNullable: true
      }),
      customerGuid: new FormControl(environment.credentials.customerGuid, {
        validators: [Validators.required, Validators.minLength(32)],
        nonNullable: true
      }),
      environment: new FormControl('demo', { nonNullable: true })
    });

    if (this.loginForm.valid) this.login();
  }

  getBankApiBasePath(env: string): string {
    switch (env) {
      case 'demo': {
        return environment.bankApiCustomerBasePath.demo;
      }
      case 'staging': {
        return environment.bankApiCustomerBasePath.staging;
      }
      case 'sandbox': {
        return environment.bankApiCustomerBasePath.sandbox;
      }
      case 'production': {
        return environment.bankApiCustomerBasePath.production;
      }
      default:
        return environment.bankApiCustomerBasePath.demo;
    }
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

  login(publicUser?: boolean): void {
    const token = (): Observable<string> => {
      // Logs in public user
      if (publicUser) {
        return this.configService.createToken(
          'demo',
          this.publicClientId,
          this.publicClientSecret
        );
      } else {
        // Returns bearer token if input, or calls api with keys
        return this.bearer
          ? of(this.loginForm.controls.bearerToken.value)
          : this.configService
              .createToken(
                this.loginForm.value.environment!,
                this.loginForm.value.clientId,
                this.loginForm.value.clientSecret
              )
              .pipe(
                catchError((err) => {
                  this.loginForm.controls.clientId.setErrors({
                    unauthorized: true
                  });
                  return of(err);
                })
              );
      }
    };

    // Validates customer and sets credentials
    token()
      .pipe(
        map((token) => {
          this.demoCredentials.token = token;
          return token;
        }),
        switchMap((token) => {
          const user = () =>
            publicUser
              ? this.publicCustomerGuid
              : this.loginForm.value.customerGuid;

          const url =
            this.getBankApiBasePath(this.loginForm.controls.environment.value) +
            user();
          const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            })
          };
          return this.http.get(url, httpOptions);
        }),
        catchError((err) => {
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
            case 500: {
              this.loginForm.controls.bearerToken.setErrors({
                unauthorized: true
              });
              break;
            }
            default:
              this.loginForm.setErrors({});
          }
          return of(err);
        })
      )
      .subscribe((customer: CustomerBankModel) => {
        if (customer.guid) {
          this.demoCredentials.customer = customer.guid;
          this.demoCredentials.environment =
            this.loginForm.controls.environment.value;

          publicUser
            ? (this.demoCredentials.isPublic = publicUser)
            : (this.demoCredentials.isPublic = false);

          this.credentials.next(this.demoCredentials);
        }
      });
  }
}
