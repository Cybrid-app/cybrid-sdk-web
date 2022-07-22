import { ErrorHandler, Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorLog {
  code: number | string;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService implements ErrorHandler {
  error: ReplaySubject<ErrorLog> = new ReplaySubject(1);
  constructor() {}

  handleError(err: any) {
    if (err instanceof HttpErrorResponse) {
      this.error.next({
        code: err.error.message_code,
        message: err.error.error_message,
        data: err.error
      });
    } else if (err instanceof Error) {
      this.error.next({
        code: err.name,
        message: err.message
      });
    } else {
      this.error.next({
        code: 'Error',
        message: 'Unknown error'
      });
    }
  }

  getError(): Observable<ErrorLog> {
    return this.error.asObservable();
  }
}
