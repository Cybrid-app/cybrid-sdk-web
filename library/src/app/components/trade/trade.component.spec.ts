import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';

import { of, take } from 'rxjs';

// Services
import {
  ConfigService,
  EventService,
  ErrorService,
  AccountService,
  PriceService,
  QuoteService,
  AssetService
} from '@services';

// Components
import { Price, TradeComponent } from '@components';

// Utility
import { AssetFormatPipe, MockAssetFormatPipe, AssetIconPipe } from '@pipes';
import { TestConstants } from '@constants';

describe('TradeComponent', () => {
  let component: TradeComponent;
  let fixture: ComponentFixture<TradeComponent>;

  let MockEventService = jasmine.createSpyObj('EventService', [
    'getEvent',
    'handleEvent'
  ]);
  let MockErrorService = jasmine.createSpyObj('ErrorService', [
    'getError',
    'handleError'
  ]);
  let MockConfigService = jasmine.createSpyObj('ConfigService', ['getConfig$']);
  let MockAccountService = jasmine.createSpyObj('AccountService', [
    'getAccounts'
  ]);
  let MockPriceService = jasmine.createSpyObj('PriceService', ['listPrices']);
  let MockDialogService = jasmine.createSpyObj('MockDialogService', ['open']);
  let MockQuoteService = jasmine.createSpyObj('QuoteService', ['getQuote']);
  let MockAssetService = jasmine.createSpyObj('AssetService', [
    'getAssets$',
    'getAsset'
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TradeComponent, MockAssetFormatPipe, AssetIconPipe],
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
        { provide: AccountService, useValue: MockAccountService },
        { provide: PriceService, useValue: MockPriceService },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: QuoteService, useValue: MockQuoteService },
        { provide: MatDialog, useValue: MockDialogService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        },
        { provide: AssetFormatPipe, useClass: MockAssetFormatPipe },
        AssetIconPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockAssetService = TestBed.inject(AssetService);
    MockAssetService.getAssets$.and.returnValue(of(TestConstants.ASSETS));
    MockAssetService.getAsset.and.returnValue(of(TestConstants.BTC_ASSET));
    MockAccountService.getAccounts.and.returnValue(
      of(TestConstants.ACCOUNT_LIST_BANK_MODEL.objects)
    );
    MockPriceService = TestBed.inject(PriceService);
    MockPriceService.listPrices.and.returnValue(
      of(TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY)
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

    fixture = TestBed.createComponent(TradeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the account list', () => {
    const accounts$Spy = spyOn(component.accounts$, 'next');

    fixture.detectChanges();

    expect(MockAccountService.getAccounts).toHaveBeenCalled();
    expect(accounts$Spy).toHaveBeenCalled();

    component.accounts$.subscribe((accounts) => expect(accounts).toBeDefined());
  });

  it('should get the price list', () => {
    const priceList$Spy = spyOn(component.priceList$, 'next');
    const evaluatePriceSpy = spyOn(component, 'evaluatePrice');

    fixture.detectChanges();

    expect(MockConfigService.getConfig$).toHaveBeenCalled();
    expect(MockPriceService.listPrices).toHaveBeenCalled();
    expect(priceList$Spy).toHaveBeenCalledWith(
      TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY
    );
    expect(evaluatePriceSpy).toHaveBeenCalled();
  });

  it('should refresh the price list', fakeAsync(() => {
    const priceList$Spy = spyOn(component.priceList$, 'next');
    fixture.detectChanges();

    tick(TestConstants.CONFIG.refreshInterval);

    // Price list is fetched on component init, and again every refresh interval
    expect(priceList$Spy).toHaveBeenCalledTimes(2);

    discardPeriodicTasks();
  }));

  it('should initialize the trade form with routing params', () => {
    component['route'].queryParams = of({ code: 'BTC' });
    fixture.detectChanges();

    const controls = component.tradeFormGroup.controls;

    expect(component.tradeFormGroup).toBeDefined();
    expect(controls.tradingAccount.value).toEqual(
      TestConstants.ACCOUNT_BANK_MODEL_BTC
    );
    expect(controls.fiatAccount.value).toEqual(
      TestConstants.ACCOUNT_BANK_MODEL_USD
    );
    expect(component.tradeFormGroup.controls.amount.value).toBeNull();
  });

  it('should initialize the trade form group with a default', () => {
    fixture.detectChanges();

    const controls = component.tradeFormGroup.controls;

    // Find first account in list
    const selectedAccount =
      TestConstants.ACCOUNT_LIST_BANK_MODEL.objects.filter(
        (accounts) => accounts.type == 'trading'
      )[0];

    expect(component.tradeFormGroup).toBeDefined();
    expect(controls.tradingAccount.value).toEqual(selectedAccount);
    expect(controls.fiatAccount.value).toEqual(
      TestConstants.ACCOUNT_BANK_MODEL_USD
    );
    expect(component.tradeFormGroup.controls.amount.value).toBeNull();
  });

  it('should evaluate the price', () => {
    fixture.detectChanges();

    component.side = 'buy';
    component.input = 'trading';
    component.tradeFormGroup.controls.amount.setValue(1);

    component.price$
      .pipe(take(1))
      .subscribe((price) =>
        expect(price).toEqual({ base: 147050, asset: 1, counterAsset: 147050 })
      );

    component.side = 'buy';
    component.input = 'fiat';
    component.tradeFormGroup.controls.amount.setValue(1);

    component.price$.pipe(take(1)).subscribe((price) =>
      expect(price).toEqual({
        base: 147030,
        asset: 0.0006801333061280011,
        counterAsset: 100
      })
    );

    component.side = 'sell';
    component.input = 'trading';
    component.tradeFormGroup.controls.amount.setValue(1);

    component.price$
      .pipe(take(1))
      .subscribe((price) =>
        expect(price).toEqual({ base: 147030, asset: 1, counterAsset: 147030 })
      );

    component.side = 'sell';
    component.input = 'fiat';
    component.tradeFormGroup.controls.amount.setValue(1);

    component.price$.pipe(take(1)).subscribe((price) =>
      expect(price).toEqual({
        base: 147050,
        asset: 0.0006800408024481469,
        counterAsset: 100
      })
    );
  });

  it('should mask the amount control if input = "trading" and the number is a decimal', fakeAsync(() => {
    fixture.detectChanges();

    component.input = 'fiat';
    component.tradeFormGroup.controls.amount.setValue(123.4567);

    tick();

    expect(component.tradeFormGroup.controls.amount.value).toEqual(123.45);

    discardPeriodicTasks();
  }));

  it('should invalidate the trade form if side: "buy"', () => {
    fixture.detectChanges();

    const setErrorSpy = spyOn(
      component.tradeFormGroup.controls.amount,
      'setErrors'
    );
    const fiatPlatformAvailable = Number(
      component.tradeFormGroup.controls.fiatAccount.value?.platform_available
    );

    const tradingPlatformAvailable = component.getTradingPlatformAvailable(
      TestConstants.CONFIG
    );

    // Set price values to be greater than balances (+1)
    const price: Price = {
      base: 1,
      asset: tradingPlatformAvailable + 1,
      counterAsset: fiatPlatformAvailable + 1
    };

    component.price$.next(price);
    expect(setErrorSpy).toHaveBeenCalledOnceWith({ insufficientFunds: true });
  });

  it('should invalidate the trade form if side:"sell"', () => {
    fixture.detectChanges();

    const setErrorSpy = spyOn(
      component.tradeFormGroup.controls.amount,
      'setErrors'
    );
    const fiatPlatformAvailable = Number(
      component.tradeFormGroup.controls.fiatAccount.value?.platform_available
    );

    const tradingPlatformAvailable = component.getTradingPlatformAvailable(
      TestConstants.CONFIG
    );

    // Set price values to be greater than balances (+1)
    const price: Price = {
      base: 1,
      asset: tradingPlatformAvailable + 1,
      counterAsset: fiatPlatformAvailable + 1
    };

    // Set side to 'sell'
    component.side = 'sell';

    component.price$.next(price);
    expect(setErrorSpy).toHaveBeenCalledOnceWith({ insufficientFunds: true });
  });

  it('should get the tradingPlatformAvailable', () => {
    fixture.detectChanges();

    // Default environment: 'demo'
    expect(component.getTradingPlatformAvailable(TestConstants.CONFIG)).toEqual(
      4997.7367924308
    );

    // Set environment: 'production'
    let productionConfig = { ...TestConstants.CONFIG };
    productionConfig.environment = 'production';

    expect(component.getTradingPlatformAvailable(productionConfig)).toEqual(0);
  });

  it('should switch input', () => {
    fixture.detectChanges();

    const updateValueAndValiditySpy = spyOn(
      component.tradeFormGroup,
      'updateValueAndValidity'
    );

    // Default
    expect(component.input).toEqual('trading');

    // Switch to input: 'fiat'
    component.onSwitchInput();
    expect(component.input).toEqual('fiat');

    // Switch to input: 'trading'
    component.onSwitchInput();
    expect(component.input).toEqual('trading');

    expect(updateValueAndValiditySpy).toHaveBeenCalledTimes(2);
  });

  it('should switch side', () => {
    fixture.detectChanges();

    const updateValueAndValiditySpy = spyOn(
      component.tradeFormGroup,
      'updateValueAndValidity'
    );

    // Default
    expect(component.side).toEqual('buy');

    // Switch to side: 'sell'
    component.onSwitchSide();
    expect(component.side).toEqual('sell');

    // Switch to side: 'buy'
    component.onSwitchSide();
    expect(component.side).toEqual('buy');

    expect(updateValueAndValiditySpy).toHaveBeenCalledTimes(2);
  });

  it('should check if max amount is disabled', () => {
    // Default side: 'buy'
    expect(component.isMaxDisabled()).toBeTrue();

    // Set side: 'sell'
    component.side = 'sell';
    expect(component.isMaxDisabled()).toBeFalse();
  });

  it('should set the max amount', () => {
    fixture.detectChanges();

    const amountControlSpy = spyOn(
      component.tradeFormGroup.controls.amount,
      'setValue'
    );

    // Default side: 'buy'
    component.onSetMax();
    expect(amountControlSpy).toHaveBeenCalled();

    // Set side: 'sell'
    component.side = 'sell';
    component.onSetMax();
    expect(amountControlSpy).toHaveBeenCalledTimes(2);
  });

  it('should call the quote service and build quote onTrade()', () => {
    fixture.detectChanges();

    component.onTrade();
    expect(MockQuoteService.getQuote).toHaveBeenCalled();
  });

  it('should open the TradeConfirmComponent onTrade()', () => {
    fixture.detectChanges();

    component.onTrade();
    expect(MockDialogService.open).toHaveBeenCalled();
  });
});
