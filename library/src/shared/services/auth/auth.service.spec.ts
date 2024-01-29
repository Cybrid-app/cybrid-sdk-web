import {
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import {
  AuthService,
  EventService,
  CODE,
  LEVEL,
  ErrorService
} from '@services';

// Utility
import * as jwtDecode from 'jwt-decode';
import { JwtPayload } from 'jwt-decode';
import { TestConstants } from '@constants';

describe('AuthService', () => {
  let authService: AuthService;
  let MockEventService = jasmine.createSpyObj(EventService, ['handleEvent']);
  let MockErrorService = jasmine.createSpyObj(ErrorService, ['handleError']);
  const customerToken = TestConstants.CUSTOMER_JWT;
  const bankToken = TestConstants.BANK_JWT;
  const decode = jasmine.createSpy();
  Object.defineProperty(jwtDecode, 'jwt_decode', {
    value: decode
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService }
      ]
    });
    authService = TestBed.inject(AuthService);
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  it('should initialize the token', () => {
    expect(authService.token).toEqual('');
  });

  describe('when the token is valid', () => {
    it('should set the token', fakeAsync(() => {
      authService.setToken(customerToken);
      tick(1);
      discardPeriodicTasks();
      expect(MockEventService.handleEvent).toHaveBeenCalledWith(
        LEVEL.INFO,
        CODE.AUTH_SET,
        'Setting auth token'
      );
    }));
  });

  describe('when the token is invalid', () => {
    describe('with an invalid token', () => {
      it('should log an event and error', fakeAsync(() => {
        const handleEventSpy = MockEventService.handleEvent;
        const handleErrorSpy = MockErrorService.handleError;
        authService.setToken('test');
        tick();
        discardPeriodicTasks();
        expect(handleEventSpy).toHaveBeenCalledWith(
          LEVEL.ERROR,
          CODE.AUTH_ERROR,
          'Invalid authentication token'
        );
        expect(handleErrorSpy).toHaveBeenCalledWith(
          new Error('Invalid authentication token')
        );
      }));
    });

    describe('with an invalid subject', () => {
      it('should log an event and error', fakeAsync(() => {
        const handleEventSpy = MockEventService.handleEvent;
        const handleErrorSpy = MockErrorService.handleError;
        authService.setToken(bankToken);
        tick();
        discardPeriodicTasks();
        expect(handleEventSpy).toHaveBeenCalledWith(
          LEVEL.ERROR,
          CODE.AUTH_ERROR,
          'Invalid authentication token'
        );
        expect(handleErrorSpy).toHaveBeenCalledWith(
          new Error('Invalid authentication token')
        );
      }));
    });
  });

  it('should log an event and error when the session expires', fakeAsync(() => {
    const handleEventSpy = MockEventService.handleEvent;
    const handleErrorSpy = MockErrorService.handleError;
    const jwtPayload: JwtPayload = {
      iat: 0,
      exp: 120
    };
    authService.timeSession(jwtPayload);
    tick(120 * 1000);
    discardPeriodicTasks();
    expect(handleEventSpy).toHaveBeenCalledWith(
      LEVEL.ERROR,
      CODE.AUTH_EXPIRED,
      'Session is expired'
    );
    expect(handleErrorSpy).toHaveBeenCalledWith(
      new Error('Session is expired')
    );
  }));

  it('should log an event when the session is expiring', fakeAsync(() => {
    const handleEventSpy = MockEventService.handleEvent;
    const jwtPayload: JwtPayload = {
      iat: 0,
      exp: 240
    };
    authService.timeSession(jwtPayload);
    tick(120 * 1000);
    discardPeriodicTasks();
    expect(handleEventSpy).toHaveBeenCalledWith(
      LEVEL.WARNING,
      CODE.AUTH_EXPIRING,
      'Session warning: 2 minutes left'
    );
  }));

  it('should return the most recent token$ as a subscription', fakeAsync(() => {
    authService.setToken(customerToken);
    tick();
    discardPeriodicTasks();
    authService.getToken$().subscribe((token) => {
      expect(token).toEqual(customerToken);
    });
  }));

  it('should return the most recent token', fakeAsync(() => {
    authService.setToken(customerToken);
    tick();
    discardPeriodicTasks();
    const getToken = authService.getToken();
    expect(getToken).toEqual(customerToken);
  }));
});
