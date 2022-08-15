import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { BehaviorSubject, map, Observable, pluck } from 'rxjs';

// Library
import { ComponentConfig } from '@services';
import { Constants } from '@constants';

@Injectable({
  providedIn: 'root'
})
export class DemoConfigService {
  config$ = new BehaviorSubject<ComponentConfig>(Constants.DEFAULT_CONFIG);

  constructor(private http: HttpClient) {}

  createToken(clientId?: string, clientSecret?: string): Observable<string> {
    const url = environment.authUrl;
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
      pluck('access_token'),
      map((token) => token as string)
    );
  }
}
