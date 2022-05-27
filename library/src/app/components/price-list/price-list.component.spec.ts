import {
  discardPeriodicTasks,
  fakeAsync,
  flushMicrotasks,
  TestBed,
  tick
} from '@angular/core/testing';

// Components
import { PriceListComponent } from './price-list.component';
import { PricesService } from '@cybrid/cybrid-api-bank-angular';

// Services
import { AuthService } from '../../../../../src/shared/services/auth/auth.service';
import {
  CODE,
  EventLog,
  LEVEL,
  EventService
} from '../../../../../src/shared/services/event/event.service';
import {
  ErrorLog,
  ErrorService
} from '../../../../../src/shared/services/error/error.service';
import {
  ComponentConfig,
  ConfigService
} from '../../../../../src/shared/services/config/config.service';

// Modules
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '../../../../../src/shared/modules/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

// Testing
import { expect } from '@angular/flex-layout/_private-utils/testing';
import { of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AssetService } from '../../../../../src/shared/services/asset/asset.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../modules/library.module';
import { TestConstants } from '../../../../../src/shared/constants/test.constants';

describe('ListComponent', () => {
  let MockAuthService = jasmine.createSpyObj('AuthService', [
    'setToken',
    'getToken$'
  ]);
  let MockAssetService = jasmine.createSpyObj('AssetService', [
    'getAsset',
    'getAssets$'
  ]);
  let MockPricesService = jasmine.createSpyObj('PricesService', ['listPrices']);
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
        SharedModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      declarations: [PriceListComponent],
      providers: [
        { provide: PricesService, useValue: MockPricesService },
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
    MockPricesService = TestBed.inject(PricesService);
    MockAssetService = TestBed.inject(AssetService);
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
  });

  it('should create the list component', () => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should set the auth token', fakeAsync(() => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    const testToken = '';
    expect(component.auth).toBeUndefined();
    component.auth = testToken;
    tick();
    expect(MockAuthService.setToken).toHaveBeenCalledWith(testToken);
    flushMicrotasks();
  }));

  it('should set the config', fakeAsync(() => {
    const fixture = TestBed.createComponent(PriceListComponent);
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
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    MockConfigService.getConfig$.and.returnValue(of(true));
    MockAssetService.getAssets$.and.returnValue(of(true));
    component.initEventService = () => undefined;
    component.initErrorService = () => undefined;
    component.initFilterForm = () => undefined;
    component.getPrices = () => undefined;
    component.refreshData = () => undefined;
    const eventService = spyOn(component, 'initEventService').and.callThrough();
    const errorService = spyOn(component, 'initErrorService').and.callThrough();
    const filterForm = spyOn(component, 'initFilterForm').and.callThrough();
    const prices = spyOn(component, 'getPrices').and.callThrough();
    const refresh = spyOn(component, 'refreshData').and.callThrough();
    component.ngOnInit();
    fixture.detectChanges();
    expect(eventService).toHaveBeenCalled();
    expect(errorService).toHaveBeenCalled();
    expect(filterForm).toHaveBeenCalled();
    expect(prices).toHaveBeenCalled();
    expect(refresh).toHaveBeenCalled();
  });

  it('should log an event and error if it fails to initialize', () => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    const error$ = throwError(() => {
      return new Error('Error');
    });
    MockConfigService.getConfig$.and.returnValue(error$);
    MockAssetService.getAssets$.and.returnValue(error$);
    component.initEventService = () => undefined;
    component.initErrorService = () => undefined;
    component.ngOnInit();
    expect(MockEventService.handleEvent).toHaveBeenCalledWith(
      LEVEL.FATAL,
      CODE.COMPONENT_ERROR,
      'Fatal error initializing price list'
    );
    expect(MockErrorService.handleError).toHaveBeenCalledWith(
      new Error('Fatal error initializing price list')
    );
  });

  it('should log an event when the event service is initialized', () => {
    const fixture = TestBed.createComponent(PriceListComponent);
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
    const fixture = TestBed.createComponent(PriceListComponent);
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
    const fixture = TestBed.createComponent(PriceListComponent);
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
    const fixture = TestBed.createComponent(PriceListComponent);
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

  it('should log an event when getPrices() is called', () => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    MockPricesService.listPrices.and.returnValue(of([]));
    component.getPrices();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should getPrice() when a valid auth token is set', fakeAsync(() => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    const getPricesSpy = spyOn(component, 'getPrices');
    const validToken = TestConstants.JWT;
    component.refreshSub.unsubscribe();
    component.auth = validToken;
    tick();
    expect(getPricesSpy).toHaveBeenCalled();
  }));

  it('should getPrices() automatically on refreshData() interval', fakeAsync(() => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    const getPricesSpy = spyOn(component, 'getPrices');
    const config: ComponentConfig = {
      refreshInterval: 5000,
      locale: 'en-US',
      theme: 'LIGHT'
    };
    MockConfigService.getConfig$.and.returnValue(of(config));
    component.refreshData();
    tick(5000);
    expect(getPricesSpy).toHaveBeenCalledTimes(1);
    tick(5000);
    discardPeriodicTasks();
    expect(getPricesSpy).toHaveBeenCalledTimes(2);
  }));

  it('should unsubscribe from the refresh subscription if getPrices() returns an error', fakeAsync(() => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    const error$ = throwError(() => {
      new Error('Error');
    });
    MockPricesService.listPrices.and.returnValue(error$);
    component.getPrices();
    tick();
    discardPeriodicTasks();
    expect(component.refreshSub.closed).toBeTrue();
  }));

  it('should call refreshData() on successful getPrices() if previously unsubscribed', fakeAsync(() => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    const refreshDataSpy = spyOn(component, 'refreshData');
    MockPricesService.listPrices.and.returnValue(of(''));
    component.refreshSub.unsubscribe();
    component.getPrices();
    tick();
    discardPeriodicTasks();
    expect(refreshDataSpy).toHaveBeenCalled();
  }));

  it('should return true if the filter predicate finds a match for name', () => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    expect(
      component.filterPredicate(TestConstants.SYMBOL_PRICE, 'bitcoin')
    ).toBeTrue();
    expect(
      component.filterPredicate(TestConstants.SYMBOL_PRICE, 'b')
    ).toBeTrue();
  });

  it('should return true if the filter predicate finds a match for code', () => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    expect(
      component.filterPredicate(TestConstants.SYMBOL_PRICE, 'btc')
    ).toBeTrue();
    expect(
      component.filterPredicate(TestConstants.SYMBOL_PRICE, 'b')
    ).toBeTrue();
  });

  it('should return false if the filter predicate doesnt match', () => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    expect(
      component.dataSource.filterPredicate(TestConstants.SYMBOL_PRICE, 'test')
    ).toBeFalse();
  });

  it('should match against the filter input', fakeAsync(() => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    component.initFilterForm();
    expect(component.filterControl.value).toBeNull();
    expect(component.dataSource.filter).toEqual('');
    component.filterControl.setValue('TEST');
    tick();
    component.filterControl.valueChanges.subscribe((value) => {
      expect(value).toEqual('TEST');
      expect(component.dataSource.filter).toEqual('test');
    });
    discardPeriodicTasks();
  }));

  it('should getPrices() and assign them to the table datasource', fakeAsync(() => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    MockPricesService.listPrices.and.returnValue(
      of([TestConstants.SYMBOL_PRICE])
    );
    MockAssetService.getAsset.and.returnValue(TestConstants.BTC_ASSET);
    component.getPrices();
    tick();
    expect(component.dataSource.data).toContain(TestConstants.SYMBOL_PRICE);
  }));

  it('should display getPrices() error in the table', fakeAsync(() => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    const error$ = throwError(() => {
      return new Error('Error');
    });
    MockPricesService.listPrices.and.returnValue(error$);
    component.getPrices();
    tick();
    expect(component.getPricesError).toBeTrue();
  }));
});
