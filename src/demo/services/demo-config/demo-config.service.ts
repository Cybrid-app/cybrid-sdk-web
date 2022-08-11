import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

// Library
import { ComponentConfig } from '@services';
import { Constants, TestConstants } from '@constants';

@Injectable({
  providedIn: 'root'
})
export class DemoConfigService {
  // config = Constants.DEFAULT_CONFIG;
  config$ = new BehaviorSubject<ComponentConfig>(Constants.DEFAULT_CONFIG);

  constructor(private http: HttpClient) {}

  createToken(clientId?: string, clientSecret?: string): Observable<string> {
    const url = environment.authUrl;
    const body = {
      grant_type: environment.grant_type,
      client_id:
        environment.credentials.clientId !== ''
          ? environment.credentials.clientId
          : clientId,
      client_secret:
        environment.credentials.clientSecret !== ''
          ? environment.credentials.clientSecret
          : clientSecret,
      scope: environment.scope
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions).pipe(
      pluck('access_token'),
      map((token) => token as string)
    );
  }
}
