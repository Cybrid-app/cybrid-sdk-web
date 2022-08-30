import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import { AccountDetailsComponent } from '@components';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '../../../shared/modules/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { AssetPipe } from '@pipes';
import { of, throwError } from 'rxjs';
import {
  AccountService,
  AssetService,
  ConfigService,
  ErrorService,
  EventService,
  RoutingService
} from '@services';
import { TestConstants } from '@constants';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TradeBankModel, TradesService } from '@cybrid/cybrid-api-bank-angular';
import { PageEvent } from '@angular/material/paginator';

describe('AccountDetailComponent', () => {
  let component: AccountDetailsComponent;
  let fixture: ComponentFixture<AccountDetailsComponent>;

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
  let MockQueryParams = of({
    accountID: TestConstants.ACCOUNT_GUID
  });
  let MockAssetService = jasmine.createSpyObj('AssetService', ['getAsset']);
  let MockAccountService = jasmine.createSpyObj('AccountService', [
    'getAccountDetails'
  ]);
  let MockTradesService = jasmine.createSpyObj('TradesService', ['listTrades']);
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  const error$ = throwError(() => {
    new Error('Error');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountDetailsComponent, AssetPipe],
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
        { provide: AssetService, useValue: MockAssetService },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: AccountService, useValue: MockAccountService },
        { provide: TradesService, useValue: MockTradesService },
        { provide: RoutingService, useValue: MockRoutingService },
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
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockAssetService = TestBed.inject(AssetService);
    MockAssetService.getAsset.and.returnValue(TestConstants.USD_ASSET);
    MockTradesService = TestBed.inject(TradesService);
    MockTradesService.listTrades.and.returnValue(
      of(TestConstants.TRADE_LIST_BANK_MODEL)
    );
    MockAccountService = TestBed.inject(AccountService);
    MockAccountService.getAccountDetails.and.returnValue(
      of(TestConstants.ACCOUNT_MODEL)
    );
    MockRoutingService = TestBed.inject(RoutingService);

    fixture = TestBed.createComponent(AccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get account', () => {
    component.getAccount();
    expect(component.asset).toEqual(TestConstants.BTC_ASSET);
  });

  it('should handle errors on getAccount()', () => {
    MockAccountService.getAccountDetails.and.returnValue(error$);

    component.getAccount();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
  });

  it('should get trades', () => {
    // Setup accountGuid
    component.getAccount();

    component.getTrades();
    expect(component.dataSource.data).toEqual(
      TestConstants.TRADE_LIST_BANK_MODEL.objects
    );
  });

  it('should hande errors on getTrade()', () => {
    MockTradesService.listTrades.and.returnValue(
      of(TestConstants.TRADE_LIST_BANK_MODEL)
    );

    component.getTrades();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
  });

  it('should get trades on page change', () => {
    const getTradesSpy = spyOn(component, 'getTrades');
    const testPageChange: PageEvent = {
      length: 0,
      pageIndex: 0,
      pageSize: 5
    };

    component.pageChange(testPageChange);
    expect(getTradesSpy).toHaveBeenCalled();
    expect(component.currentPage).toEqual(0);
    expect(component.pageSize).toEqual(5);
    expect(component.totalRows).toEqual(0);
  });

  it('should sort the datasource', () => {
    expect(component.dataSource.sort).toBeUndefined();

    component.sortChange();
    expect(component.dataSource.sort).toEqual(component.sort);

    // Test sorting accessor
    function testSort(trade: TradeBankModel, columnDef: string): string {
      return component.sortingDataAccessor(
        TestConstants.TRADE_BANK_MODEL,
        columnDef
      );
    }
    expect(testSort(TestConstants.TRADE_BANK_MODEL, 'transaction')).toEqual(
      TestConstants.TRADE_BANK_MODEL.created_at as string
    );
    // Buy side
    expect(testSort(TestConstants.TRADE_BANK_MODEL, 'balance')).toEqual(
      TestConstants.TRADE_BANK_MODEL.receive_amount as string
    );
    // Sell side
    const sellTradeModel = TestConstants.TRADE_BANK_MODEL;
    sellTradeModel.side = 'sell';
    expect(testSort(sellTradeModel, 'balance')).toEqual(
      TestConstants.TRADE_BANK_MODEL.deliver_amount as string
    );
    // Default
    expect(testSort(sellTradeModel, 'default')).toEqual('');
  });

  it('should refresh data', fakeAsync(() => {
    const getAccountSpy = spyOn(component, 'getAccount');
    const getTradesSpy = spyOn(component, 'getTrades');

    component.refreshData();
    tick(TestConstants.CONFIG.refreshInterval);

    expect(getAccountSpy).toHaveBeenCalled();
    expect(getTradesSpy).toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('should display the trade summary onRowClick()', () => {
    const dialogSpy = spyOn(component.dialog, 'open');

    component.onRowClick(TestConstants.TRADE_BANK_MODEL);
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should navigate onTrade()', () => {
    component.onTrade();
    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });
});
