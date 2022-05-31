import { ErrorHandler, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
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
  error: Subject<ErrorLog> = new Subject();
  constructor() {}

  handleError(err: any) {
    if (err instanceof HttpErrorResponse) {
      this.error.next({
        code: err.status,
        message: err.message
      });
    } else if (err instanceof Error) {
      this.error.next({
        code: err.name,
        message: err.message
      });
    } else {
      this.error.next({
        code: 'Error',
        message: 'Unknown error',
        data: err
      });
    }
  }

  getError(): Observable<ErrorLog> {
    return this.error.asObservable();
  }
}
