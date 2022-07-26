import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';

import { ErrorService } from '@services';
import { ErrorInterceptor } from '@interceptors';

describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let interceptor: ErrorInterceptor;
  const testUrl = '/fakeUrl';
  let MockErrorService = jasmine.createSpyObj('ErrorService', ['handleError']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ErrorInterceptor,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: ErrorService, useValue: MockErrorService }
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    interceptor = TestBed.inject(ErrorInterceptor);
    MockErrorService = TestBed.inject(ErrorService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should log errors with the http error service', () => {
    const msg = 'error';
    httpClient.get(testUrl).subscribe({
      complete: () => {},
      error: () => {
        expect(MockErrorService.handleError).toHaveBeenCalled();
      }
    });
    const req = httpTestingController.expectOne(testUrl);
    req.flush(msg, { status: 400, statusText: 'Bad Request' });
  });
});
