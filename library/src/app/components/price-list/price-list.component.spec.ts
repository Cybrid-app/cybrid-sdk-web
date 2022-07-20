import {
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

// Components
import { PriceListComponent } from './price-list.component';
import { PricesService } from '@cybrid/cybrid-api-bank-angular';

// Services
import { AuthService } from '../../../../../src/shared/services/auth/auth.service';
import { EventService } from '../../../../../src/shared/services/event/event.service';
import { ErrorService } from '../../../../../src/shared/services/error/error.service';
import { ConfigService } from '../../../../../src/shared/services/config/config.service';

// Modules
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '../../../../../src/shared/modules/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

// Testing
import { of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AssetService } from '../../../../../src/shared/services/asset/asset.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../modules/library.module';
import { TestConstants } from '../../../../../src/shared/constants/test.constants';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RoutingService } from '../../../../../src/shared/services/routing/routing.service';

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
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        SharedModule,
        ReactiveFormsModule,
        RouterTestingModule,
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
        { provide: ConfigService, useValue: MockConfigService },
        { provide: RoutingService, useValue: MockRoutingService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockAuthService = TestBed.inject(AuthService);
    MockPricesService = TestBed.inject(PricesService);
    MockAssetService = TestBed.inject(AssetService);
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockRoutingService = TestBed.inject(RoutingService);
  });

  it('should create the list component', () => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should call init functions in ngOnInit()', () => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    MockConfigService.getConfig$.and.returnValue(of(true));
    MockAssetService.getAssets$.and.returnValue(of(true));
    component.initFilterForm = () => undefined;
    component.getPrices = () => undefined;
    component.refreshData = () => undefined;
    const filterForm = spyOn(component, 'initFilterForm').and.callThrough();
    const prices = spyOn(component, 'getPrices').and.callThrough();
    const refresh = spyOn(component, 'refreshData').and.callThrough();
    component.ngOnInit();
    fixture.detectChanges();
    expect(filterForm).toHaveBeenCalled();
    expect(prices).toHaveBeenCalled();
    expect(refresh).toHaveBeenCalled();
  });

  it('should log an event when getPrices() is called', () => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    MockPricesService.listPrices.and.returnValue(of([]));
    component.getPrices();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should getPrices() automatically on refreshData() interval', fakeAsync(() => {
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    const getPricesSpy = spyOn(component, 'getPrices');
    const config = TestConstants.CONFIG;
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

  it('should navigate to the trade component on row click', () => {
    MockConfigService.getConfig$.and.returnValue(of({ routing: true }));
    const fixture = TestBed.createComponent(PriceListComponent);
    const component = fixture.componentInstance;
    component.onRowClick(TestConstants.SYMBOL_PRICE);
    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });
});
