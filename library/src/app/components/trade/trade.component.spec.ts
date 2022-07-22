import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';

import { of, throwError } from 'rxjs';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../modules/library.module';

// Client
import { PricesService } from '@cybrid/cybrid-api-bank-angular';

// Components
import { TradeComponent, TradeConfirmComponent } from '@components';
import { AssetPipe } from '@pipes';

// Services
import {
  AssetService,
  EventService,
  ErrorService,
  ConfigService,
  QuoteService,
  RoutingService
} from '@services';

// Utility
import { TestConstants } from '@constants';

describe('TradeComponent', () => {
  let component: TradeComponent;
  let fixture: ComponentFixture<TradeComponent>;

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
  let MockPricesService = jasmine.createSpyObj('PricesService', ['listPrices']);
  let MockQueryParams = of({
    symbol_pair: 'BTC-USD'
  });
  let MockDialogService = jasmine.createSpyObj('MockDialogService', ['open']);
  const error$ = throwError(() => {
    new Error('Error');
  });
  let MockQuoteService = jasmine.createSpyObj('QuoteService', ['getQuote']);
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TradeComponent, AssetPipe],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: AssetService, useValue: MockAssetService },
        { provide: PricesService, useValue: MockPricesService },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: QuoteService, useValue: MockQuoteService },
        { provide: MatDialog, useValue: MockDialogService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: MockQueryParams
          }
        },
        { provide: RoutingService, useValue: MockRoutingService },
        AssetPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockAssetService = TestBed.inject(AssetService);
    MockAssetService.getAssets$.and.returnValue(of(TestConstants.ASSETS));
    MockPricesService = TestBed.inject(PricesService);
    MockPricesService.listPrices.and.returnValue(
      of([TestConstants.SYMBOL_PRICE_BANK_MODEL])
    );
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockDialogService = TestBed.inject(MatDialog);
    MockDialogService.open.and.returnValue({
      afterClosed: () =>
        of({
          hasAccepted: true
        })
    });
    MockQuoteService = TestBed.inject(QuoteService);
    MockQuoteService.getQuote.and.returnValue(TestConstants.POST_QUOTE);
    MockRoutingService = TestBed.inject(RoutingService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeComponent);
    component = fixture.componentInstance;
    MockAssetService.getAsset.and.returnValue(TestConstants.BTC_ASSET);
    component.getAssets(); // Set the asset code
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call init functions in ngOnInit()', () => {
    component.getAssets = () => undefined;
    component.initQuoteGroup = () => undefined;
    component.getPrice = () => undefined;
    component.refreshData = () => undefined;
    const getAssets = spyOn(component, 'getAssets').and.callThrough();
    const initQuoteGroup = spyOn(component, 'initQuoteGroup').and.callThrough();
    const getPrice = spyOn(component, 'getPrice').and.callThrough();
    const refreshData = spyOn(component, 'refreshData').and.callThrough();
    component.ngOnInit();
    expect(getAssets).toHaveBeenCalled();
    expect(initQuoteGroup).toHaveBeenCalled();
    expect(getPrice).toHaveBeenCalled();
    expect(refreshData).toHaveBeenCalled();
  });

  it('should get router parameters', () => {
    MockAssetService.getAsset.and.returnValue(TestConstants.BTC_ASSET);
    component.getAssets();
    expect(component.counterAsset.code).toEqual('BTC');
    MockAssetService.getAsset.and.returnValue(TestConstants.USD_ASSET);
    component.getAssets();
    expect(component.counterAsset.code).toEqual('USD');
  });

  it('should get and filter assets', () => {
    const cryptoAssets = [TestConstants.BTC_ASSET, TestConstants.ETH_ASSET];
    const fiatAssets = [TestConstants.USD_ASSET]; // Filtering here for only one fiat
    MockAssetService.getAsset.and.returnValue(TestConstants.USD_ASSET);
    component.getAssets();
    expect(component.cryptoAssets).toEqual(cryptoAssets);
    expect(component.fiatAssets).toEqual(fiatAssets);
  });

  it('should initialize the quote group', () => {
    MockAssetService.getAsset.and.returnValue(TestConstants.BTC_ASSET);
    const getPriceSpy = spyOn(component, 'getPrice');
    component.initQuoteGroup();
    expect(component.asset).toEqual(TestConstants.BTC_ASSET);
    component.quoteGroup.patchValue({
      asset: TestConstants.ETH_ASSET,
      amount: 10
    });
    expect(getPriceSpy).toHaveBeenCalled();
    expect(component.amount).toEqual(10);
  });

  it('should get prices', () => {
    component.price.buy_price = '1';
    component.price.sell_price = '1';
    component.initQuoteGroup();
    component.quoteGroup.patchValue({
      amount: 1,
      asset: TestConstants.BTC_ASSET
    });

    expect(component.display.asset).toEqual(1);
    expect(component.display.counter_asset).toEqual(1);

    component.input = 'counter_asset';
    component.getPrice();
    expect(component.display.asset).toEqual(100000000);

    /*
     * If the input is 'counter_asset' the base value returned from the asset pipe will
     * be of type 'string' to disable scientific notation for api calls
     * */
    expect(component.display.counter_asset).toEqual('100000000');

    component.side = 'sell';
    component.input = 'asset';
    component.getPrice();
    expect(component.display.asset).toEqual(1);
    expect(component.display.counter_asset).toEqual(1);

    component.input = 'counter_asset';
    component.getPrice();
    expect(component.display.asset).toEqual(100000000);
    expect(component.display.counter_asset).toEqual('100000000');

    MockPricesService.listPrices.and.returnValue(error$);
    component.getPrice();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
  });

  it('should refresh data', fakeAsync(() => {
    const getPriceSpy = spyOn(component, 'getPrice');
    component.ngOnInit();
    tick(TestConstants.CONFIG.refreshInterval);
    expect(getPriceSpy).toHaveBeenCalledTimes(2);
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('should switch the input between asset and counter_asset', () => {
    const getPriceSpy = spyOn(component, 'getPrice');
    component.ngOnInit();
    expect(component.input).toEqual('asset'); // Default value
    component.onSwitchInput();
    expect(component.input).toEqual('counter_asset');
    expect(getPriceSpy).toHaveBeenCalled();
    component.onSwitchInput();
    expect(component.input).toEqual('asset');
    expect(getPriceSpy).toHaveBeenCalled();
  });

  it('should switch sides', () => {
    const getPriceSpy = spyOn(component, 'getPrice');
    component.ngOnInit();
    expect(component.side).toEqual('buy'); // Default value
    component.onSwitchSide(1);
    expect(component.side).toEqual('sell');
    expect(getPriceSpy).toHaveBeenCalled();
    component.onSwitchSide(-1);
    expect(component.side).toEqual('buy');
    expect(getPriceSpy).toHaveBeenCalled();
  });

  it('should navigate', () => {
    component.ngOnInit();
    component.onBack();
    expect(MockRoutingService.handleRoute).toHaveBeenCalledWith(
      'price-list',
      'trade'
    );
  });

  it('should call the quote service and build quote onTrade()', () => {
    component.ngOnInit();
    component.onTrade();
    expect(MockQuoteService.getQuote).toHaveBeenCalled();
  });

  it('should open the trade confirm component and pass it a PostQuoteBankModel onTrade()', () => {
    component.ngOnInit();
    component.onTrade();
    expect(MockDialogService.open).toHaveBeenCalledWith(TradeConfirmComponent, {
      data: {
        model: TestConstants.POST_QUOTE,
        asset: component.asset,
        counter_asset: component.counterAsset
      }
    });
  });
});
