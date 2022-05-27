import {
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import { ErrorLog, ErrorService } from './error.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('HttpErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should output http errors through the error Subject()', (done) => {
    const testError: HttpErrorResponse = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request'
    });
    const testErrorLog: ErrorLog = {
      code: testError.status,
      message: testError.message
    };
    service.getError().subscribe((err) => {
      done();
      expect(err).toEqual(testErrorLog);
    });
    service.handleError(testError);
  });

  it('should output application errors through the error Subject()', (done) => {
    const testError: Error = new Error('test');
    const testErrorLog: ErrorLog = {
      code: testError.name,
      message: testError.message
    };
    service.getError().subscribe((err) => {
      done();
      expect(err).toEqual(testErrorLog);
    });
    service.handleError(testError);
  });

  it('should output unknown errors through the error Subject()', (done) => {
    const testError = 'error';
    service.getError().subscribe((err) => {
      done();
      expect(err.data).toEqual(testError);
    });
    service.handleError(testError);
  });

  it('should return http errors as an observable when getError() is called', fakeAsync(() => {
    const testError: HttpErrorResponse = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request'
    });
    const testErrorLog: ErrorLog = {
      code: testError.status,
      message: testError.message
    };
    let error: any = {};
    service.getError().subscribe((err) => {
      error = err;
    });
    service.handleError(testError);
    tick(5000);
    discardPeriodicTasks();
    expect(error).toEqual(testErrorLog);
  }));

  it('should return application errors as an observable when getError() is called', fakeAsync(() => {
    const testError: Error = new Error('test');
    const testErrorLog: ErrorLog = {
      code: testError.name,
      message: testError.message
    };
    let error: any = {};
    service.getError().subscribe((err) => {
      error = err;
    });
    service.handleError(testError);
    tick(5000);
    discardPeriodicTasks();
    expect(error).toEqual(testErrorLog);
  }));
});
