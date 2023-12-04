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
  TradesService,
  TransferBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  AccountService,
  AssetService,
  PriceService,
  TransferService,
  ConfigService,
  ErrorService,
  EventService,
  RoutingService
} from '@services';

// Components
import { AccountDetailsComponent } from '@components';

// Utility
import { MockAssetFormatPipe, AssetFormatPipe, AssetIconPipe } from '@pipes';
import { Constants, TestConstants } from '@constants';
import { SharedModule } from '../../../../shared/modules/shared.module';

describe('AccountDetailComponent', () => {
  let component: AccountDetailsComponent;
  let fixture: ComponentFixture<AccountDetailsComponent>;
  var isTradingAccount = true;

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
  let MockTradingQueryParams = of({
    accountGuid: TestConstants.ACCOUNT_GUID,
    accountType: 'trading'
  });
  let MockFiatQueryParams = of({
    accountGuid: TestConstants.ACCOUNT_GUID,
    accountType: 'fiat'
  });
  let MockAccountService = jasmine.createSpyObj('AccountService', [
    'getAccount'
  ]);
  let MockPriceService = jasmine.createSpyObj('PriceService', ['listPrices']);
  let MockTradesService = jasmine.createSpyObj('TradesService', ['listTrades']);
  let MockTransferService = jasmine.createSpyObj('TransferService', [
    'listTransfers'
  ]);
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
        AccountDetailsComponent,
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
        { provide: TransferService, useValue: MockTransferService },
        { provide: RoutingService, useValue: MockRoutingService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: isTradingAccount
              ? MockTradingQueryParams
              : MockFiatQueryParams
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
    MockTransferService = TestBed.inject(TransferService);
    MockTransferService.listTransfers.and.returnValue(
      of(TestConstants.TRANSFER_LIST_BANK_MODEL)
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

    fixture = TestBed.createComponent(AccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should log an event when the component is initialized', () => {
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  describe('isLoadingTransfers', () => {
    it('should init as true', () => {
      component.isLoadingTransfers$.subscribe((value) => {
        expect(value).toBeTruthy();
      });
    });
    it('should be false', () => {
      component.account$.next(TestConstants.ACCOUNT_BANK_MODEL_USD);
      component.transferList$.next(TestConstants.TRANSFER_LIST_BANK_MODEL);
      component.isLoadingTransfers$.subscribe((value) => {
        expect(value).toBeFalsy();
      });
    });
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

  describe('when listing transfers', () => {
    it('should list transfers', () => {
      component.accountType = 'fiat';
      component.refreshData();
      expect(MockTransferService.listTransfers).toHaveBeenCalled();
    });

    it('should handle list transfer errors', () => {
      const refreshDataSubSpy = spyOn(component.refreshDataSub, 'unsubscribe');
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');

      MockTransferService.listTransfers.and.returnValue(error$);
      component.transfersDataSource.data =
        TestConstants.TRANSFER_LIST_BANK_MODEL.objects;
      component.listTransfers();

      expect(refreshDataSubSpy).toHaveBeenCalled();
      expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
      expect(component.transfersDataSource.data).toEqual([]);
    });
  });

  it('should refresh data for accountType trading', fakeAsync(() => {
    const getAccountSpy = spyOn(component, 'getAccount');
    const listTradesSpy = spyOn(component, 'listTrades');

    component.refreshData();
    tick(Constants.REFRESH_INTERVAL);

    expect(getAccountSpy).toHaveBeenCalledTimes(2);
    expect(listTradesSpy).toHaveBeenCalledTimes(2);

    discardPeriodicTasks();
  }));

  it('should refresh data for accountType fiat', fakeAsync(() => {
    const getAccountSpy = spyOn(component, 'getAccount');
    const listTransfersSpy = spyOn(component, 'listTransfers');

    component.accountType = 'fiat';
    component.refreshData();
    tick(Constants.REFRESH_INTERVAL);

    expect(getAccountSpy).toHaveBeenCalledTimes(2);
    expect(listTransfersSpy).toHaveBeenCalledTimes(2);
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

  describe('when sorting transfers', () => {
    it('should sort by transaction', () => {
      let transfer: TransferBankModel = TestConstants.TRANSFER_BANK_MODEL;
      let sort = component.sortingTransfersDataAccessor(
        transfer,
        'transaction'
      );
      expect(sort).toEqual(<string>transfer.created_at);
    });

    it('should sort by balance for side: buy', () => {
      let transfer: TransferBankModel = TestConstants.TRANSFER_BANK_MODEL;
      let sort = component.sortingTransfersDataAccessor(transfer, 'balance');
      expect(sort).toEqual(<string>transfer.estimated_amount);
    });

    it('should sort by default', () => {
      let transfer: TransferBankModel = TestConstants.TRANSFER_BANK_MODEL;
      let sort = component.sortingTransfersDataAccessor(transfer, '');
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

    it('should list transfers', () => {
      component.accountType = 'fiat';
      component.refreshData();
      const listTransfersSpy = spyOn(component, 'listTransfers');
      const pageEvent: PageEvent = {
        pageIndex: component.currentPage,
        pageSize: component.pageSize,
        length: component.totalRows
      };
      component.pageChange(pageEvent);
      expect(listTransfersSpy).toHaveBeenCalled();
    });
  });

  it('should sort', () => {
    component.dataSource.sort = null;

    component.sortChange();

    expect(component.dataSource.sort).toBeDefined();
  });

  it('should sort transfer', () => {
    component.transfersDataSource.sort = null;
    component.sortChange();
    expect(component.transfersDataSource.sort).toBeDefined();
  });

  it('should display the trade summary onRowClick()', () => {
    const dialogSpy = spyOn(component.dialog, 'open');

    component.onRowClick(TestConstants.TRADE_BANK_MODEL);
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should display the transfer summary onTransferClick', () => {
    const dialogSpy = spyOn(component.dialog, 'open');
    component.onTransferClick(TestConstants.TRANSFER_BANK_MODEL);
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should navigate onTrade()', () => {
    component.onTrade();

    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });

  it('getFiatPendingBalance', () => {
    let account: AccountBankModel = TestConstants.ACCOUNT_BANK_MODEL_USD;
    let pendingBalance = component.getFiatPendingBalance(account);
    expect(pendingBalance).toEqual(0);
  });

  it('getTransferIconName for deposit', () => {
    let transferBankModel: TransferBankModel =
      TestConstants.TRANSFER_BANK_MODEL;
    transferBankModel.side = 'deposit';
    let iconName = component.getTransferIconName(transferBankModel);
    expect(iconName).toEqual('cybrid-deposit-icon');
  });

  it('getTransferIconName for withdrawal', () => {
    let transferBankModel: TransferBankModel =
      TestConstants.TRANSFER_BANK_MODEL;
    transferBankModel.side = 'withdrawal';
    let iconName = component.getTransferIconName(transferBankModel);
    expect(iconName).toEqual('cybrid-withdrawal-icon');
  });

  it('getTransferIconName for default', () => {
    let transferBankModel: TransferBankModel =
      TestConstants.TRANSFER_BANK_MODEL;
    transferBankModel.side = undefined;
    let iconName = component.getTransferIconName(transferBankModel);
    expect(iconName).toEqual('');
  });
});
