import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  pluck,
  Subject,
  tap
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { ComponentConfig } from '../../../../library/src/shared/services/config/config.service';
import { TestConstants } from '../../../../library/src/shared/constants/test.constants';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  token$ = new Subject<string>();
  invalidCredentials$ = new BehaviorSubject(false);
  defaultConfig = TestConstants.CONFIG;
  config$ = new BehaviorSubject<ComponentConfig>(this.defaultConfig);

  constructor(private http: HttpClient) {
    this.createToken()
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.invalidCredentials$.next(true);
          console.log(error);
          return of(error);
        })
      )
      .subscribe();
  }

  private createToken(): Observable<string> {
    const url = environment.authUrl;
    const body = {
      grant_type: environment.grant_type,
      client_id: environment.credentials.clientId,
      client_secret: environment.credentials.clientSecret,
      scope: environment.scope
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions).pipe(
      pluck('access_token'),
      map((token) => token as string),
      tap((token) => {
        this.token$.next(token);
      })
    );
  }
}
