import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

// Client
import {
  AccountBankModel,
  AssetBankModel,
  TradeBankModel,
  TradesService
} from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  AccountService,
  AssetService,
  PriceService,
  ConfigService,
  ErrorService,
  EventService,
  RoutingService
} from '@services';

// Components
import { TradingAccountDetailsComponent } from '@components';

// Utility
import { MockAssetFormatPipe, AssetFormatPipe, AssetIconPipe } from '@pipes';
import { Constants, TestConstants } from '@constants';
import { SharedModule } from '../../../../shared/modules/shared.module';

describe('AccountDetailComponent', () => {
  let component: TradingAccountDetailsComponent;
  let fixture: ComponentFixture<TradingAccountDetailsComponent>;

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
    'getConfig$',
    'getComponent$'
  ]);
  let queryParams = of({
    accountGuid: TestConstants.ACCOUNT_GUID
  });
  let MockAccountService = jasmine.createSpyObj('AccountService', [
    'getAccount'
  ]);
  let MockPriceService = jasmine.createSpyObj('PriceService', ['listPrices']);
  let MockTradesService = jasmine.createSpyObj('TradesService', ['listTrades']);
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  const error$ = throwError(() => {
    new Error('Error');
  });

  class MockAssetService {
    constructor() {}
    getAsset(code: string): AssetBankModel {
      if (code == 'BTC') return TestConstants.BTC_ASSET;
      else if (code == 'ETH') return TestConstants.ETH_ASSET;
      else return TestConstants.USD_ASSET;
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TradingAccountDetailsComponent,
        MockAssetFormatPipe,
        AssetIconPipe
      ],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: AssetService, useClass: MockAssetService },
        { provide: AssetFormatPipe, useClass: MockAssetFormatPipe },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: AccountService, useValue: MockAccountService },
        { provide: PriceService, useValue: MockPriceService },
        { provide: TradesService, useValue: MockTradesService },
        { provide: RoutingService, useValue: MockRoutingService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParams
          }
        },
        AssetIconPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockTradesService = TestBed.inject(TradesService);
    MockTradesService.listTrades.and.returnValue(
      of(TestConstants.TRADE_LIST_BANK_MODEL)
    );
    MockAccountService = TestBed.inject(AccountService);
    MockAccountService.getAccount.and.returnValue(
      of(TestConstants.ACCOUNT_BANK_MODEL_BTC)
    );
    MockPriceService = TestBed.inject(PriceService);
    MockPriceService.listPrices.and.returnValue(
      of(TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY)
    );
    MockRoutingService = TestBed.inject(RoutingService);

    fixture = TestBed.createComponent(TradingAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should log an event when the component is initialized', () => {
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  describe('when processing account', () => {
    it('should process account price', () => {
      const processedAccount = component.processAccount(
        TestConstants.ACCOUNT_BANK_MODEL_BTC,
        TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY
      );

      expect(processedAccount.price).toBeDefined();
    });

    it('should process account value', () => {
      const processedAccount = component.processAccount(
        TestConstants.ACCOUNT_BANK_MODEL_BTC,
        TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY
      );

      expect(processedAccount.value).toBeDefined();
    });
  });

  describe('when getting an account', () => {
    it('should get account', () => {
      expect(MockAccountService.getAccount).toHaveBeenCalled();
    });

    it('should get assets', () => {
      component.asset = null;
      component.counterAsset = null;

      component.getAccount();

      expect(component.asset).toBeDefined();
      expect(component.counterAsset).toBeDefined();
    });

    it('should process account', () => {
      const processAccountSpy = spyOn(component, 'processAccount');

      component.getAccount();

      expect(processAccountSpy).toHaveBeenCalled();
    });

    it('should set account', () => {
      const account$spy = spyOn(component.account$, 'next');

      component.getAccount();

      expect(account$spy).toHaveBeenCalled();
    });

    it('should handle get account errors', () => {
      const refreshDataSubSpy = spyOn(component.refreshDataSub, 'unsubscribe');
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');
      MockAccountService.getAccount.and.returnValue(error$);

      component.getAccount();

      expect(refreshDataSubSpy).toHaveBeenCalled();
      expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
    });

    it('should get config', () => {
      expect(MockConfigService.getConfig$).toHaveBeenCalled();
    });

    it('should handle get config errors', () => {
      const refreshDataSubSpy = spyOn(component.refreshDataSub, 'unsubscribe');
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');
      MockConfigService.getConfig$.and.returnValue(error$);

      component.getAccount();

      expect(refreshDataSubSpy).toHaveBeenCalled();
      expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
    });

    it('should get price', () => {
      expect(MockPriceService.listPrices).toHaveBeenCalled();
    });

    it('should handle get price errors', () => {
      const refreshDataSubSpy = spyOn(component.refreshDataSub, 'unsubscribe');
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');
      MockPriceService.listPrices.and.returnValue(error$);

      component.getAccount();

      expect(refreshDataSubSpy).toHaveBeenCalled();
      expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
    });
  });

  describe('when listing trades', () => {
    it('should list trades', () => {
      expect(MockTradesService.listTrades).toHaveBeenCalled();
    });

    it('should handle list trade errors', () => {
      const refreshDataSubSpy = spyOn(component.refreshDataSub, 'unsubscribe');
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');

      MockTradesService.listTrades.and.returnValue(error$);
      component.dataSource.data = TestConstants.TRADE_LIST_BANK_MODEL.objects;
      component.listTrades();

      expect(refreshDataSubSpy).toHaveBeenCalled();
      expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
      expect(component.dataSource.data).toEqual([]);
    });
  });

  it('should refresh data', fakeAsync(() => {
    const getAccountSpy = spyOn(component, 'getAccount');
    const listTradesSpy = spyOn(component, 'listTrades');

    component.refreshData();
    tick(Constants.REFRESH_INTERVAL);

    expect(getAccountSpy).toHaveBeenCalledTimes(2);
    expect(listTradesSpy).toHaveBeenCalledTimes(2);

    discardPeriodicTasks();
  }));

  describe('when sorting accounts', () => {
    it('should sort by transaction', () => {
      let trade: TradeBankModel = TestConstants.TRADE_BANK_MODEL;

      let sort = component.sortingDataAccessor(trade, 'transaction');
      expect(sort).toEqual(<string>trade.created_at);
    });

    it('should sort by balance for side: buy', () => {
      let trade: TradeBankModel = TestConstants.TRADE_BANK_MODEL;

      let sort = component.sortingDataAccessor(trade, 'balance');
      expect(sort).toEqual(<string>trade.receive_amount);
    });

    it('should sort by balance for side: sell', () => {
      let trade: TradeBankModel = { ...TestConstants.TRADE_BANK_MODEL };
      trade.side = 'sell';

      let sort = component.sortingDataAccessor(trade, 'balance');
      expect(sort).toEqual(<string>trade.deliver_amount);
    });
    it('should sort by default', () => {
      let trade: TradeBankModel = TestConstants.TRADE_BANK_MODEL;

      let sort = component.sortingDataAccessor(trade, '');
      expect(sort).toEqual('');
    });
  });

  describe('when paginating', () => {
    it('should update the current page', () => {
      const pageIndex = 1;
      const pageEvent: PageEvent = {
        pageIndex: pageIndex,
        pageSize: component.pageSize,
        length: component.totalRows
      };

      component.pageChange(pageEvent);

      expect(component.currentPage).toBe(pageIndex);
    });

    it('should update the page size', () => {
      const pageSize = 10;
      const pageEvent: PageEvent = {
        pageIndex: 0,
        pageSize: pageSize,
        length: component.totalRows
      };

      component.pageChange(pageEvent);

      expect(component.pageSize).toBe(pageSize);
    });

    it('should list accounts', () => {
      const listTradesSpy = spyOn(component, 'listTrades');

      const pageEvent: PageEvent = {
        pageIndex: component.currentPage,
        pageSize: component.pageSize,
        length: component.totalRows
      };

      component.pageChange(pageEvent);

      expect(listTradesSpy).toHaveBeenCalled();
    });
  });

  it('should sort', () => {
    component.dataSource.sort = null;

    component.sortChange();

    expect(component.dataSource.sort).toBeDefined();
  });

  it('should display the trade summary onRowClick()', () => {
    const dialogSpy = spyOn(component.dialog, 'open');

    component.onRowClick(TestConstants.TRADE_BANK_MODEL);
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should navigate onTrade()', () => {
    component.onTrade();

    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });

  it('should navigate onDepositAddress()', () => {
    component.onDepositAddress();
    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });
});
