import {
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import { AuthService } from './auth.service';
import { CODE, EventService, LEVEL } from '../event/event.service';
import { ErrorService } from '../error/error.service';
import { TestConstants } from '../../constants/test.constants';
import * as jwtDecode from 'jwt-decode';
import { JwtPayload } from 'jwt-decode';

describe('AuthService', () => {
  let authService: AuthService;
  let MockEventService = jasmine.createSpyObj(EventService, ['handleEvent']);
  let MockErrorService = jasmine.createSpyObj(ErrorService, ['handleError']);
  const testToken = TestConstants.JWT;
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

  it('should set the token if valid', fakeAsync(() => {
    const handleEventSpy = MockEventService.handleEvent;
    const jwt: JwtPayload = {};
    decode.and.returnValue(jwt);
    authService.setToken(testToken);
    tick(1);
    discardPeriodicTasks();
    expect(handleEventSpy).toHaveBeenCalledWith(
      LEVEL.INFO,
      CODE.AUTH_SET,
      'Setting auth token'
    );
  }));

  it('should log an event and error if the token is invalid', fakeAsync(() => {
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
    authService.setToken(testToken);
    tick();
    discardPeriodicTasks();
    authService.getToken$().subscribe((token) => {
      expect(token).toEqual(testToken);
    });
  }));

  it('should return the most recent token', fakeAsync(() => {
    authService.setToken(testToken);
    tick();
    discardPeriodicTasks();
    const getToken = authService.getToken();
    expect(getToken).toEqual(testToken);
  }));
});
