import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { DemoConfigService } from '../../services/demo-config/demo-config.service';
import {
  catchError,
  combineLatest,
  forkJoin,
  map,
  of,
  switchMap,
  zip
} from 'rxjs';
import {
  AccountBankModel,
  CustomerBankModel,
  CustomersService,
  SymbolPriceBankModel
} from '@cybrid/cybrid-api-bank-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface LoginForm {
  clientId: FormControl<string>;
  clientSecret: FormControl<string>;
  customerGuid: FormControl<string>;
}

export interface DemoCredentials {
  token: string;
  customerGuid: string;
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
    customerGuid: ''
  };

  constructor(
    private http: HttpClient,
    private configService: DemoConfigService,
    private customerService: CustomersService
  ) {
    this.loginForm = new FormGroup<LoginForm>({
      clientId: new FormControl('', { nonNullable: true }),
      clientSecret: new FormControl('', { nonNullable: true }),
      customerGuid: new FormControl('', { nonNullable: true })
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
          return of(err);
        })
      )
      .subscribe((customer: CustomerBankModel) => {
        if (customer.guid) {
          this.demoCredentials.customerGuid = customer.guid;
          this.credentials.next(this.demoCredentials);
          console.log(this.demoCredentials);
        } else console.log('invalid customer');
      });
  }
}
