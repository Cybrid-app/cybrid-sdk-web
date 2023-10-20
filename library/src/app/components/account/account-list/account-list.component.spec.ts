import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderFactory } from '../../../modules/library.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

// Services
import {
  AccountService,
  AccountBankModelWithDetails,
  PriceService,
  ConfigService,
  ErrorService,
  EventService,
  RoutingService
} from '@services';

// Components
import { AccountListComponent } from '@components';

// Utility
import { MockAssetFormatPipe, AssetFormatPipe } from '@pipes';
import { Constants, TestConstants } from '@constants';
import { SharedModule } from '../../../../shared/modules/shared.module';
import { AccountBankModel } from '@cybrid/cybrid-api-bank-angular';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;

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
    'listAccounts'
  ]);
  let MockPriceService = jasmine.createSpyObj('PriceService', ['listPrices']);
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  const error$ = throwError(() => {
    new Error('Error');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountListComponent, MockAssetFormatPipe],
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
        { provide: AssetFormatPipe, useClass: MockAssetFormatPipe },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: AccountService, useValue: MockAccountService },
        { provide: PriceService, useValue: MockPriceService },
        { provide: RoutingService, useValue: MockRoutingService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockAccountService = TestBed.inject(AccountService);
    MockPriceService = TestBed.inject(PriceService);
    MockRoutingService = TestBed.inject(RoutingService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockAccountService.listAccounts.and.returnValue(
      of(TestConstants.ACCOUNT_LIST_BANK_MODEL)
    );
    MockPriceService.listPrices.and.returnValue(
      of(TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY)
    );

    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log an event when the component is initialized', () => {
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  describe('when processing accounts', () => {
    it('should process fiat accounts', () => {
      const processedAccounts = component.processAccounts(
        TestConstants.ACCOUNT_LIST_BANK_MODEL,
        TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY
      );

      // USD account
      const fiatAccount = processedAccounts[0];

      expect(fiatAccount.price).toBeUndefined();
      expect(fiatAccount.value).toBe(Number(fiatAccount.platform_available));
    });

    it('should process crypto accounts', () => {
      const processedAccounts = component.processAccounts(
        TestConstants.ACCOUNT_LIST_BANK_MODEL,
        TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY
      );

      // ETH account
      const cryptoAccount = processedAccounts[2];

      expect(cryptoAccount.price).toBeDefined();
      expect(cryptoAccount.value).toBeDefined();
    });
  });

  describe('when listing accounts', () => {
    it('should list accounts', () => {
      expect(MockAccountService.listAccounts).toHaveBeenCalled();
    });

    it('should list prices', () => {
      expect(MockPriceService.listPrices).toHaveBeenCalled();
    });

    it('should set the dataSource', () => {
      const processedAccounts = component.processAccounts(
        TestConstants.ACCOUNT_LIST_BANK_MODEL,
        TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY
      );

      expect(component.dataSource.data).toBe(processedAccounts);
    });

    it('should set the totalRows', () => {
      const totalRows = Number(TestConstants.ACCOUNT_LIST_BANK_MODEL.total);

      expect(component.totalRows).toBe(totalRows);
    });

    it('should handle errors when listing accounts', () => {
      const refreshDataSubSpy = spyOn(component.refreshDataSub, 'unsubscribe');
      const isLoading$Spy = spyOn(component.isLoading$, 'next');

      MockAccountService.listAccounts.and.returnValue(error$);

      component.listAccounts();

      expect(refreshDataSubSpy).toHaveBeenCalled();
      expect(component.getAccountsError).toBeTruthy;
      expect(isLoading$Spy).toHaveBeenCalledWith(false);

      // Reset
      MockAccountService.listAccounts.and.returnValue(
        TestConstants.ACCOUNT_LIST_BANK_MODEL
      );
    });

    it('should handle errors when listing prices', () => {
      const refreshDataSubSpy = spyOn(component.refreshDataSub, 'unsubscribe');
      const isLoading$Spy = spyOn(component.isLoading$, 'next');

      MockPriceService.listPrices.and.returnValue(error$);

      component.listAccounts();

      expect(refreshDataSubSpy).toHaveBeenCalled();
      expect(component.getAccountsError).toBeTruthy;
      expect(isLoading$Spy).toHaveBeenCalledWith(false);

      // Reset
      MockPriceService.listPrices.and.returnValue(
        TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY
      );
    });
  });

  it('should refresh data', fakeAsync(() => {
    const listAccountsSpy = spyOn(component, 'listAccounts');

    component.refreshData();
    tick(Constants.REFRESH_INTERVAL);

    expect(listAccountsSpy).toHaveBeenCalledTimes(2);

    discardPeriodicTasks();
  }));

  describe('when sorting accounts', () => {
    it('should initially sort accounts', () => {
      const sortedAccounts = component.sortAccounts(
        TestConstants.ACCOUNT_LIST_BANK_MODEL
      );

      expect(sortedAccounts.objects[0].type).toBe('fiat');
    });

    it('should sort by account', () => {
      let account: AccountBankModel =
        TestConstants.ACCOUNT_BANK_MODEL_WITH_DETAILS;

      let sort = component.sortingDataAccessor(account, 'account');
      expect(sort).toEqual(<string>account.asset);
    });

    it('should sort by balance', () => {
      let account: AccountBankModelWithDetails =
        TestConstants.ACCOUNT_BANK_MODEL_WITH_DETAILS;

      let sort = component.sortingDataAccessor(account, 'balance');
      expect(sort).toEqual(<number>account.value);
    });
    it('should sort by default', () => {
      let account: AccountBankModelWithDetails =
        TestConstants.ACCOUNT_BANK_MODEL_WITH_DETAILS;
      let sort = component.sortingDataAccessor(account, '');

      expect(sort).toEqual('');
    });
  });

  describe('when paginating', () => {
    beforeEach(() => {
      // Mock listAccounts() to avoid Angular testing error
      component.listAccounts = () => {};
    });

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
      const listAccountsSpy = spyOn(component, 'listAccounts');

      const pageEvent: PageEvent = {
        pageIndex: component.currentPage,
        pageSize: component.pageSize,
        length: component.totalRows
      };

      component.pageChange(pageEvent);

      expect(listAccountsSpy).toHaveBeenCalled();
    });
  });

  it('should sort', () => {
    component.dataSource.sort = null;

    component.sortChange();

    expect(component.dataSource.sort).toBeDefined();
  });

  it('should navigate on row click', () => {
    component.onRowClick(TestConstants.ACCOUNT_BANK_MODEL_BTC);

    // Test default config.routing=true
    expect(MockRoutingService.handleRoute).toHaveBeenCalledWith({
      route: 'account-details',
      origin: 'account-list',
      extras: {
        queryParams: {
          accountGuid: TestConstants.ACCOUNT_GUID
        }
      }
    });
  });
});
