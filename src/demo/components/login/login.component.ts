import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { catchError, map, of, switchMap } from 'rxjs';

// Client
import {
  CustomerBankModel,
  CustomersService
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { DemoConfigService } from '../../services/demo-config/demo-config.service';

interface LoginForm {
  clientId: FormControl<string>;
  clientSecret: FormControl<string>;
  customerGuid: FormControl<string>;
}

export interface DemoCredentials {
  token: string;
  customer: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @Output() credentials = new EventEmitter<DemoCredentials>();

  loginForm!: FormGroup<LoginForm>;

  demoCredentials: DemoCredentials = {
    token: '',
    customer: ''
  };

  constructor(
    private http: HttpClient,
    private configService: DemoConfigService
  ) {
    this.initLoginForm();
  }

  initLoginForm(): void {
    this.loginForm = new FormGroup<LoginForm>({
      clientId: new FormControl('', {
        validators: [Validators.required, Validators.minLength(42)],
        nonNullable: true
      }),
      clientSecret: new FormControl('', {
        validators: [Validators.required, Validators.minLength(43)],
        nonNullable: true
      }),
      customerGuid: new FormControl('', {
        validators: [Validators.required, Validators.minLength(32)],
        nonNullable: true
      })
    });
  }

  login(): void {
    this.configService
      .createToken(
        this.loginForm.value.clientId,
        this.loginForm.value.clientSecret
      )
      .pipe(
        map((token) => {
          this.demoCredentials.token = token;
          return token;
        }),
        switchMap((token) => {
          const url =
            'https://bank.demo.cybrid.app/api/customers/' +
            this.loginForm.value.customerGuid;
          const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            })
          };
          return this.http.get(url, httpOptions);
        }),
        catchError((err) => {
          console.log(err);
          console.log(err.statusText);

          switch (err.status) {
            case 401: {
              this.loginForm.get('clientId')?.setErrors({ unauthorized: true });
              break;
            }
            case 404: {
              this.loginForm
                .get('customerGuid')
                ?.setErrors({ not_found: true });
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
          this.credentials.next(this.demoCredentials);
        }
      });
  }
}
