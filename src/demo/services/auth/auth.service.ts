import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

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
import { LocalStorageService } from '../local-storage/local-storage.service';
import { CODE, EventService, LEVEL } from '@services';

// Models
import { BankTokenIdpModel } from '../../models/bankTokenIdpModel.model';

// Library
import { Environment } from '@services';

// Utility
import { environment } from '../../../environments/environment';

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
    private localStorageService: LocalStorageService,
    private eventService: EventService
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
      this.localStorageService.set(key, access_token);
      this.tokens[key] = token;
      return of(access_token);
    } else return throwError(() => new Error());
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
    const expiresIn =
      (<number>decodedToken.exp - <number>decodedToken.iat) * 1000;

    if (this.sessions[key]) this.sessions[key].unsubscribe();

    this.sessions[key] = timer(expiresIn).subscribe(() =>
      this.destroySession()
    );
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
    const bank = this.localStorageService.get('bank');
    const customer = this.localStorageService.get('customer');

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
        this.localStorageService.clear();
      }
    }
  }

  destroySession() {
    Object.values(this.sessions).forEach((session) => session.unsubscribe());
    Object.keys(this.tokens).forEach((token) =>
      this.localStorageService.remove(token)
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
