import { fakeAsync, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { ErrorService } from '@services';

describe('HttpErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should output http errors through the error Subject()', fakeAsync(() => {
    const testError: HttpErrorResponse = new HttpErrorResponse({
      error: {
        status: 400,
        message_code: 'test error',
        error_message: 'test error message'
      }
    });

    service.handleError(testError);
    service.getError().subscribe((error) => {
      expect(error).toEqual({
        code: 'test error',
        message: 'test error message',
        data: error.data
      });
    });
  }));

  it('should output application errors through the error Subject()', fakeAsync(() => {
    const testError = new Error('test');
    service.handleError(testError);
    service.getError().subscribe((error) => {
      expect(error).toEqual({
        code: 'Error',
        message: 'test'
      });
    });
  }));

  it('should pass through unknown errors', fakeAsync(() => {
    const testError = 'test';
    service.handleError(testError);
    service.getError().subscribe((error) => {
      expect(error).toEqual({
        code: 'Error',
        message: 'Unknown error',
        data: testError
      });
    });
  }));
});
