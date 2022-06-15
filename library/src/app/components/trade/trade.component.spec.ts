import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import { TradeComponent } from './trade.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { AssetPipe } from '../../../../../src/shared/pipes/asset.pipe';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TestConstants } from '../../../../../src/shared/constants/test.constants';
import { AssetService } from '../../../../../src/shared/services/asset/asset.service';
import { PricesService } from '@cybrid/cybrid-api-bank-angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EventService } from '../../../../../src/shared/services/event/event.service';
import { ErrorService } from '../../../../../src/shared/services/error/error.service';
import { ConfigService } from '../../../../../src/shared/services/config/config.service';
import { MatDialog } from '@angular/material/dialog';

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
        { provide: MatDialog, useValue: MockDialogService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: MockQueryParams
          }
        },
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeComponent);
    component = fixture.componentInstance;
    MockAssetService.getAsset.and.returnValue(TestConstants.BTC_ASSET);
    component.getSymbol(); // Set the asset code
    MockAssetService.getAsset.and.returnValue(TestConstants.USD_ASSET);
    component.getSymbol(); // Set the counter asset code
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call init functions in ngOnInit()', () => {
    component.getCustomer = () => undefined;
    component.getSymbol = () => undefined;
    component.getAssets = () => undefined;
    component.initQuoteGroup = () => undefined;
    component.getPrice = () => undefined;
    component.refreshData = () => undefined;
    const getCustomer = spyOn(component, 'getCustomer').and.callThrough();
    const getSymbol = spyOn(component, 'getSymbol').and.callThrough();
    const getAssets = spyOn(component, 'getAssets').and.callThrough();
    const initQuoteGroup = spyOn(component, 'initQuoteGroup').and.callThrough();
    const getPrice = spyOn(component, 'getPrice').and.callThrough();
    const refreshData = spyOn(component, 'refreshData').and.callThrough();
    component.ngOnInit();
    expect(getCustomer).toHaveBeenCalled();
    expect(getSymbol).toHaveBeenCalled();
    expect(getAssets).toHaveBeenCalled();
    expect(initQuoteGroup).toHaveBeenCalled();
    expect(getPrice).toHaveBeenCalled();
    expect(refreshData).toHaveBeenCalled();
  });

  it('should get the customer GUID', () => {
    component.getCustomer();
    expect(MockConfigService.getConfig$).toHaveBeenCalled();
    expect(component.postQuoteBankModel.customer_guid).toEqual('');
  });

  it('should get router parameters', () => {
    MockAssetService.getAsset.and.returnValue(TestConstants.BTC_ASSET);
    component.getSymbol();
    expect(component.counterAsset.code).toEqual('BTC');
    MockAssetService.getAsset.and.returnValue(TestConstants.USD_ASSET);
    component.getSymbol();
    expect(component.counterAsset.code).toEqual('USD');
  });

  it('should get and filter assets', () => {
    const cryptoAssets = [TestConstants.BTC_ASSET, TestConstants.ETH_ASSET];
    const fiatAssets = [TestConstants.USD_ASSET]; // Filtering here for only one fiat
    MockAssetService.getAsset.and.returnValue(TestConstants.USD_ASSET);
    component.getSymbol(); // Set the counter asset code needed in getAssets();
    component.getAssets();
    expect(component.cryptoAssets).toEqual(cryptoAssets);
    expect(component.fiatAssets).toEqual(fiatAssets);
  });

  it('should initialize the quote group', () => {
    const getPriceSpy = spyOn(component, 'getPrice');
    const formatAmountSpy = spyOn(component, 'formatAmount');
    MockAssetService.getAsset.and.returnValue(TestConstants.USD_ASSET);
    component.getSymbol(); // Set the counter asset code needed in getAssets();
    component.initQuoteGroup();
    component.quoteGroup.patchValue({ asset: TestConstants.BTC_ASSET });
    expect(getPriceSpy).toHaveBeenCalled();
    expect(formatAmountSpy).toHaveBeenCalled();
  });

  it('should get prices', () => {
    component.price.buy_price = 1;
    component.price.sell_price = 1;
    component.quoteGroup.patchValue({
      amount: 1,
      asset: TestConstants.BTC_ASSET
    });

    component.getPrice();
    expect(component.display.amount).toEqual(1);
    expect(component.display.value).toEqual(1);

    component.postQuoteBankModel.side = 'sell';
    component.input = 'deliver_amount';
    component.getPrice();
    expect(component.display.amount).toEqual(100);
    expect(component.display.value).toEqual(100);

    MockPricesService.listPrices.and.returnValue(error$);
    component.getPrice();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
  });

  it('should format the amount', () => {
    component.price.buy_price = 1;
    component.price.sell_price = 2;
    let amount = 10;

    // Default: input = receive_amount, side = 'buy'
    component.formatAmount(amount);
    expect(component.postQuoteBankModel.receive_amount).toEqual(1000);

    // input = receive_amount, side = 'sell'
    component.postQuoteBankModel.side = 'sell';
    component.formatAmount(amount);
    expect(component.postQuoteBankModel.receive_amount).toEqual(20);

    // input = deliver_amount, side = 'sell'
    component.input = 'deliver_amount';
    component.formatAmount(amount);
    expect(component.postQuoteBankModel.deliver_amount).toEqual(50000);

    // input = deliver_amount, side = 'buy'
    component.postQuoteBankModel.side = 'buy';
    component.formatAmount(amount);
    expect(component.postQuoteBankModel.deliver_amount).toEqual(1000);

    // Test no parameters deleting amounts
    component.postQuoteBankModel = {
      side: 'buy',
      symbol: 'BTC-USD',
      customer_guid: '',
      deliver_amount: 100,
      receive_amount: 100
    };
    component.formatAmount(undefined);
    expect(component.postQuoteBankModel).toEqual({
      side: 'buy',
      symbol: 'BTC-USD',
      customer_guid: ''
    });
  });

  it('should log an event when it refreshes data', fakeAsync(() => {
    const getPriceSpy = spyOn(component, 'getPrice');
    component.ngOnInit();
    tick(TestConstants.CONFIG.refreshInterval);
    expect(getPriceSpy).toHaveBeenCalledTimes(2);
    discardPeriodicTasks();
  }));

  it('should switch the input between fiat and crypto', () => {
    component.cryptoAssets = [TestConstants.BTC_ASSET, TestConstants.ETH_ASSET];
    component.fiatAssets = [TestConstants.USD_ASSET]; // Filtering here for only one fiat
    component.postQuoteBankModel = {
      side: 'buy',
      symbol: 'BTC-USD',
      customer_guid: '',
      deliver_amount: 100,
      receive_amount: 100
    };

    // Default: input = 'receive_amount', amount = undefined
    component.onSwitchInput();
    expect(component.input).toEqual('deliver_amount');

    // Test input = 'deliver_amount', amount = 10
    component.quoteGroup.patchValue({ amount: 10 });
    component.onSwitchInput();
    expect(component.postQuoteBankModel.deliver_amount).toBeFalsy();
    expect(component.postQuoteBankModel.receive_amount).toEqual(1000);

    // Test input = 'deliver_amount', amount = undefined
    component.input = 'deliver_amount';
    component.quoteGroup.patchValue({ amount: undefined });
    component.onSwitchInput();
    expect(component.input).toEqual('receive_amount');

    // Test input = 'receive_amount', amount = 10
    component.input = 'receive_amount';
    component.quoteGroup.patchValue({ amount: 10 });
    component.onSwitchInput();
    expect(component.input).toEqual('deliver_amount');
    expect(component.postQuoteBankModel.deliver_amount).toEqual(1000);
  });

  it('should switch sides', () => {
    component.postQuoteBankModel = {
      side: 'buy',
      symbol: 'BTC-USD',
      customer_guid: ''
    };
    component.quoteGroup.patchValue({ amount: 10 });

    component.onSwitchSide('Buy');
    expect(component.postQuoteBankModel.side).toEqual('buy');

    component.onSwitchSide('Sell');
    expect(component.postQuoteBankModel.side).toEqual('sell');
  });
});
