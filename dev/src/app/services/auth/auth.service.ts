import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';

import {
  BehaviorSubject,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  throwError,
  timer
} from 'rxjs';

import jwt_decode, { JwtPayload } from 'jwt-decode';

import {
  Configuration,
  CustomerTokenIdpModel,
  CustomerTokensService,
  PostCustomerTokenIdpModel
} from '@cybrid/cybrid-api-id-angular';

// Services
import { CODE, EventService, LEVEL, Environment } from '@services';

// Models
import { BankTokenIdpModel } from 'src/demo/models/bankTokenIdpModel.model';

// Utility
import { environment } from 'src/environments/environment';
import { TranslatePipe } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  tokens: { [key: string]: {} } = {};
  sessions: { [key: string]: Subscription } = {};

  private _env!: Environment;
  private _customer!: string;

  isAuthenticated = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private eventService: EventService,
    private snackbar: MatSnackBar,
    private translatePipe: TranslatePipe
  ) {}

  createCustomerToken(
    env: Environment,
    customerGuid: string,
    bankToken: string
  ): Observable<string> {
    this.customer = customerGuid;
    return new CustomerTokensService(
      this.http,
      Object(environment.idpBaseUrl)[env],
      new Configuration({ credentials: { BearerAuth: bankToken } })
    )
      .createCustomerToken({
        customer_guid: customerGuid,
        scopes: Object.values(
          PostCustomerTokenIdpModel.ScopesEnum
        ) as unknown as Set<PostCustomerTokenIdpModel.ScopesEnum>
      })
      .pipe(switchMap((token) => this.setToken(token)));
  }

  createBankToken(
    env: Environment,
    clientId: string,
    clientSecret: string
  ): Observable<string> {
    this.environment = env;
    const url = Object(environment.idpBaseUrl)[env] + '/oauth/token';
    const body = {
      grant_type: environment.grant_type,
      client_id: clientId,
      client_secret: clientSecret,
      scope: environment.scope
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions).pipe(
      map((res) => res as BankTokenIdpModel),
      switchMap((token) => this.setToken(token))
    );
  }

  setToken(
    token: BankTokenIdpModel | CustomerTokenIdpModel | string
  ): Observable<string> {
    const access_token =
      typeof token == 'string' ? token : <string>token.access_token;
    const decodedToken = this.validateToken(access_token);

    if (decodedToken) {
      const key = Object(decodedToken)['sub_type'];

      this.createSession(decodedToken);
      window.localStorage.setItem(key, access_token);
      this.tokens[key] = token;
      return of(access_token);
    } else return throwError(() => new Error('Invalid access token'));
  }

  getToken(sub_type: string): {} | undefined {
    return this.tokens[sub_type];
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt_decode<JwtPayload>(token);
    } catch (err) {
      return null;
    }
  }

  validateToken(token: string): JwtPayload | null {
    const decodedToken = this.decodeToken(token);

    if (decodedToken && decodedToken.exp) {
      return Date.now() < decodedToken.exp * 1000 ? decodedToken : null;
    }

    return null;
  }

  createSession(decodedToken: JwtPayload) {
    const key = Object(decodedToken)['sub_type'];
    const expiresIn = <number>decodedToken.exp * 1000 - Date.now();

    if (this.sessions[key]) this.sessions[key].unsubscribe();

    this.sessions[key] = timer(expiresIn).subscribe(() => {
      this.destroySession();

      this.snackbar.open(this.translatePipe.transform('auth.expired'), 'Ok', {
        duration: 5000
      });
    });
  }

  restoreEnvironment(token: JwtPayload): string | null {
    const aud = <string[]>Object(token)['aud'];
    const sub_type = Object(token)['sub_type'];

    const bankPath = aud.find((a) => a.includes(sub_type));
    const env = bankPath?.split('//')[1].split('.')[1];

    if ((env && env == 'local') || 'staging' || 'sandbox' || 'production') {
      this.environment = <Environment>env;
      return this.environment;
    }
    return null;
  }

  restoreCustomer(token: JwtPayload): string | null {
    if (token.sub) {
      this.customer = token.sub;
      return this.customer;
    }
    return null;
  }

  restoreSession() {
    const bank = window.localStorage.getItem('bank');
    const customer = window.localStorage.getItem('customer');

    if (bank && customer) {
      const decodedBank = this.validateToken(bank);
      const decodedCustomer = this.validateToken(customer);

      if (
        decodedBank &&
        decodedCustomer &&
        this.restoreEnvironment(decodedBank) &&
        this.restoreCustomer(decodedCustomer)
      ) {
        this.tokens['bank'] = bank;
        this.tokens['customer'] = customer;

        this.createSession(decodedBank);
        this.createSession(decodedCustomer);

        this.eventService.handleEvent(
          LEVEL.INFO,
          CODE.AUTH_SET,
          'Session restored'
        );

        this.isAuthenticated.next(true);
      } else {
        window.localStorage.clear();
      }
    }
  }

  destroySession() {
    Object.values(this.sessions).forEach((session) => session.unsubscribe());
    Object.keys(this.tokens).forEach((token) =>
      window.localStorage.removeItem(token)
    );
    this.tokens = {};
    this.sessions = {};

    this.isAuthenticated.next(false);
  }

  get environment(): Environment {
    return this._env;
  }

  set environment(env: Environment) {
    this._env = env;
  }

  get customer(): string {
    return this._customer;
  }

  set customer(customer: string) {
    this._customer = customer;
  }
}
