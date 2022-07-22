import {
  fakeAsync,
  flushMicrotasks,
  TestBed,
  tick
} from '@angular/core/testing';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AssetService } from '../../../shared/services/asset/asset.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import {
  CODE,
  EventLog,
  EventService,
  LEVEL
} from '../../../shared/services/event/event.service';
import {
  ErrorLog,
  ErrorService
} from '../../../shared/services/error/error.service';
import { ConfigService } from '../../../shared/services/config/config.service';
import { of, throwError } from 'rxjs';
import { TestConstants } from '../../../shared/constants/test.constants';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { RoutingService } from '../../../shared/services/routing/routing.service';

describe('AppComponent', () => {
  let MockAuthService = jasmine.createSpyObj('AuthService', [
    'setToken',
    'getToken$'
  ]);
  let MockAssetService = jasmine.createSpyObj('AssetService', [
    'getAsset',
    'getAssets$'
  ]);
  let MockEventService = jasmine.createSpyObj('EventService', [
    'getEvent',
    'handleEvent'
  ]);
  let MockErrorService = jasmine.createSpyObj('ErrorService', [
    'getError',
    'handleError'
  ]);
  let MockConfigService = jasmine.createSpyObj('ConfigService', [
    'setConfig',
    'getConfig$'
  ]);
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  let MockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      declarations: [AppComponent],
      providers: [
        { provide: AssetService, useValue: MockAssetService },
        {
          provide: AuthService,
          useValue: MockAuthService
        },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: RoutingService, useValue: MockRoutingService },
        { provide: Router, useValue: MockRouter }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockAuthService = TestBed.inject(AuthService);
    MockAssetService = TestBed.inject(AssetService);
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockRoutingService = TestBed.inject(RoutingService);
    MockRouter = TestBed.inject(Router);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should set the auth token', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const testToken = '';
    expect(component.auth).toBeUndefined();
    component.auth = testToken;
    tick();
    expect(MockAuthService.setToken).toHaveBeenCalledWith(testToken);
    flushMicrotasks();
  }));

  it('should set the config', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const testConfig = TestConstants.CONFIG;
    component.hostConfig = testConfig;
    tick();
    expect(MockConfigService.setConfig).toHaveBeenCalledWith(testConfig);
  }));

  it('should set the current component', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const currentComponent$Spy = spyOn(component.currentComponent$, 'next');

    // Test default currentComponent
    component.initNavigation();
    tick();
    expect(MockRouter.navigate).toHaveBeenCalled();
    expect(MockRoutingService.handleRoute).toHaveBeenCalled();

    // Set currentComponent
    component.component = 'test';
    tick();
    expect(currentComponent$Spy).toHaveBeenCalledWith('test');
  }));

  it('should call init functions in ngOnInit()', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    MockConfigService.getConfig$.and.returnValue(of(true));
    MockAssetService.getAssets$.and.returnValue(of(true));
    component.initEventService = () => undefined;
    component.initErrorService = () => undefined;
    const eventService = spyOn(component, 'initEventService').and.callThrough();
    const errorService = spyOn(component, 'initErrorService').and.callThrough();
    component.ngOnInit();
    fixture.detectChanges();
    expect(eventService).toHaveBeenCalled();
    expect(errorService).toHaveBeenCalled();
  });

  it('should log an event and error if it fails to initialize', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const error$ = throwError(() => {
      return new Error('Error');
    });
    component.initEventService = () => null;
    component.initErrorService = () => null;
    MockConfigService.getConfig$.and.returnValue(error$);
    MockAssetService.getAssets$.and.returnValue(error$);
    component.ngOnInit();
    tick(100);
    expect(MockEventService.handleEvent).toHaveBeenCalledWith(
      LEVEL.FATAL,
      CODE.APPLICATION_ERROR,
      'Fatal error initializing application'
    );
    expect(MockErrorService.handleError).toHaveBeenCalledWith(
      new Error('Fatal error initializing application')
    );
  }));

  it('should log an event when the event service is initialized', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const eventLog: EventLog = {
      level: LEVEL.INFO,
      code: CODE.SERVICE_INIT,
      message: 'test'
    };
    MockEventService.getEvent.and.returnValue(of(eventLog));
    component.eventLog.subscribe((log) => {
      expect(log).toEqual(eventLog);
    });
    component.initEventService();
  });

  it('should log an event and error when the event service fails to initialize', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const error$ = throwError(() => {
      return new Error('Error');
    });
    MockEventService.getEvent.and.returnValue(error$);
    component.eventLog.subscribe((event) => {
      expect(event.level).toEqual('ERROR');
    });
    component.initEventService();
    expect(MockErrorService.handleError).toHaveBeenCalled();
  });

  it('should log an event when the error service is initialized', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const errorLog: ErrorLog = {
      code: 400,
      message: 'test'
    };
    MockErrorService.getError.and.returnValue(of(errorLog));
    component.errorLog.subscribe((log) => {
      expect(log).toEqual(errorLog);
    });
    component.initErrorService();
  });

  it('should log an event and error when the error service fails to initialize', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const error$ = throwError(() => {
      return new Error('err');
    });
    MockErrorService.getError.and.returnValue(error$);
    component.errorLog.subscribe((error) => {
      expect(error.code).toEqual('Error');
    });
    component.initErrorService();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });
});
