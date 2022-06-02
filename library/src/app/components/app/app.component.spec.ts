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
import { AssetService } from '../../../../../src/shared/services/asset/asset.service';
import { AuthService } from '../../../../../src/shared/services/auth/auth.service';
import {
  CODE,
  EventLog,
  EventService,
  LEVEL
} from '../../../../../src/shared/services/event/event.service';
import {
  ErrorLog,
  ErrorService
} from '../../../../../src/shared/services/error/error.service';
import {
  ComponentConfig,
  ConfigService
} from '../../../../../src/shared/services/config/config.service';
import { expect } from '@angular/flex-layout/_private-utils/testing';
import { of, throwError } from 'rxjs';

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
        { provide: ConfigService, useValue: MockConfigService }
      ]
    }).compileComponents();
    MockAuthService = TestBed.inject(AuthService);
    MockAssetService = TestBed.inject(AssetService);
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
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
    const testConfig: ComponentConfig = {
      refreshInterval: 5000,
      locale: 'en-US',
      theme: 'LIGHT'
    };
    component.hostConfig = testConfig;
    tick();
    expect(MockConfigService.setConfig).toHaveBeenCalledWith(testConfig);
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

  it('should log an event and error if it fails to initialize', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const error$ = throwError(() => {
      return new Error('Error');
    });
    MockEventService.handleEvent.and.callThrough();
    MockErrorService.handleError.and.callThrough();
    MockConfigService.getConfig$.and.returnValue(error$);
    MockAssetService.getAssets$.and.returnValue(error$);
    component.ngOnInit();
    fixture.detectChanges();
    expect(MockEventService.handleEvent).toHaveBeenCalledWith(
      LEVEL.FATAL,
      CODE.APPLICATION_ERROR,
      'Fatal error initializing application'
    );
    expect(MockErrorService.handleError).toHaveBeenCalledWith(
      new Error('Fatal error initializing application')
    );
  });

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
