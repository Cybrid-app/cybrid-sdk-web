import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, timer } from 'rxjs';
import { CODE, EventService, LEVEL } from '../event/event.service';
import { ErrorService } from '../error/error.service';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { Constants } from '../../constants/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // This token parameter is to provide a bindable token to the ApiModule configuration
  token = '';
  token$: ReplaySubject<string> = new ReplaySubject<string>(1);

  constructor(
    private eventService: EventService,
    private errorService: ErrorService
  ) {}

  setToken(token: any): void {
    const decodedToken = this.decodeToken(token);
    if (decodedToken) {
      this.timeSession(decodedToken);
      this.eventService.handleEvent(
        LEVEL.INFO,
        CODE.AUTH_SET,
        'Setting auth token'
      );
      // Set the token for the ApiModule configuration
      this.token = token;
      this.token$.next(token);
    } else {
      this.eventService.handleEvent(
        LEVEL.ERROR,
        CODE.AUTH_ERROR,
        'Invalid authentication token'
      );
      this.errorService.handleError(new Error('Invalid authentication token'));
    }
  }

  getToken(): string {
    // Returns the bearer token string for the ApiModule configuration
    return this.token;
  }

  getToken$(): Observable<string> {
    return this.token$.asObservable();
  }

  decodeToken(token: string): any {
    try {
      return jwt_decode<JwtPayload>(token);
    } catch (err) {
      return null;
    }
  }

  timeSession(token: JwtPayload) {
    const timeLeft = token.exp! - token.iat!;
    const warning = timeLeft - Constants.AUTH_EXPIRATION_WARNING;
    if (timeLeft > 0) {
      timer(timeLeft * 1000).subscribe(() => {
        this.eventService.handleEvent(
          LEVEL.ERROR,
          CODE.AUTH_EXPIRED,
          'Session is expired'
        );
        this.errorService.handleError(new Error('Session is expired'));
      });
      if (warning > 0) {
        timer(warning * 1000).subscribe(() => {
          this.eventService.handleEvent(
            LEVEL.WARNING,
            CODE.AUTH_EXPIRING,
            'Session warning: 2 minutes left'
          );
        });
      }
    }
  }
}
