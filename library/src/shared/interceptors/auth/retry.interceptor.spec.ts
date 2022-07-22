import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { RetryInterceptor } from './retry.interceptor';
import { EventService } from '../../services/event/event.service';
import { of } from 'rxjs';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let interceptor: RetryInterceptor;
  const testUrl = '/fakeUrl';
  let MockEventService = jasmine.createSpyObj('EventService', ['setLog']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RetryInterceptor,
        { provide: HTTP_INTERCEPTORS, useClass: RetryInterceptor, multi: true },
        { provide: EventService, useValue: MockEventService }
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    interceptor = TestBed.inject(RetryInterceptor);
    MockEventService = TestBed.inject(EventService);
    MockEventService.setLog.and.returnValue(of({}));
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should retry unsuccessful calls (3 times)', () => {
    const msg = 'error';
    httpClient.get(testUrl).subscribe({
      complete: () => {},
      error: (error: HttpErrorResponse) => {
        expect(error.status).toEqual(400);
        expect(error.statusText).toEqual('Bad Request');
      }
    });
    const retry = 3;
    for (let i = 0, c = retry + 1; i < c; i++) {
      const req = httpTestingController.expectOne(testUrl);
      req.flush(msg, { status: 400, statusText: 'Bad Request' });
    }
  });
});
