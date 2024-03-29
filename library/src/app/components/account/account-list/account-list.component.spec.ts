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
import { MatSort } from '@angular/material/sort';

import { HttpLoaderFactory } from '../../../modules/library.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

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
    'listAllAccounts'
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
    MockPriceService = TestBed.inject(PriceService);
    MockRoutingService = TestBed.inject(RoutingService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockAccountService = TestBed.inject(AccountService);
    MockAccountService.listAllAccounts.and.returnValue(
      of(TestConstants.ACCOUNT_LIST_BANK_MODEL.objects)
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
      const accountList = [...TestConstants.ACCOUNT_LIST_BANK_MODEL.objects];
      const priceList = [...TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY];

      const processedAccounts = component.processAccounts(
        accountList,
        priceList
      );

      // USD account
      const fiatAccount = processedAccounts[0];

      expect(fiatAccount.price).toBeUndefined();
      expect(fiatAccount.value).toBeDefined();
    });

    it('should process crypto accounts', () => {
      const accountList = [...TestConstants.ACCOUNT_LIST_BANK_MODEL.objects];
      const priceList = [...TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY];

      const processedAccounts = component.processAccounts(
        accountList,
        priceList
      );

      // ETH account
      const cryptoAccount = processedAccounts[2];

      expect(cryptoAccount.price).toBeDefined();
      expect(cryptoAccount.value).toBeDefined();
    });
  });

  describe('when listing accounts', () => {
    it('should list accounts', () => {
      expect(MockAccountService.listAllAccounts).toHaveBeenCalled();
    });

    it('should list prices', () => {
      expect(MockPriceService.listPrices).toHaveBeenCalled();
    });

    it('should set the dataSource', () => {
      const accountList = [...TestConstants.ACCOUNT_LIST_BANK_MODEL.objects];
      const priceList = [...TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY];

      const processedAccounts = component.processAccounts(
        accountList,
        priceList
      );

      expect(component.dataSource.data).toEqual(processedAccounts);
    });

    it('should handle errors when listing accounts', () => {
      const refreshDataSubSpy = spyOn(component.refreshDataSub, 'unsubscribe');
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');

      MockAccountService.listAllAccounts.and.returnValue(error$);

      component.listAllAccounts();

      expect(refreshDataSubSpy).toHaveBeenCalled();
      expect(isRecoverable$Spy).toHaveBeenCalled();

      // Reset
      MockAccountService.listAllAccounts.and.returnValue(
        TestConstants.ACCOUNT_LIST_BANK_MODEL
      );
    });

    it('should handle errors when listing prices', () => {
      const refreshDataSubSpy = spyOn(component.refreshDataSub, 'unsubscribe');
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');

      MockPriceService.listPrices.and.returnValue(error$);

      component.listAllAccounts();

      expect(refreshDataSubSpy).toHaveBeenCalled();
      expect(isRecoverable$Spy).toHaveBeenCalled();

      // Reset
      MockPriceService.listPrices.and.returnValue(
        TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY
      );
    });
  });

  it('should refresh data', fakeAsync(() => {
    const listAccountsSpy = spyOn(component, 'listAllAccounts');

    component.refreshData();
    tick(Constants.REFRESH_INTERVAL);

    expect(listAccountsSpy).toHaveBeenCalledTimes(2);

    discardPeriodicTasks();
  }));

  describe('when sorting accounts', () => {
    it('should sort by account', () => {
      let account: AccountBankModelWithDetails = {
        ...TestConstants.ACCOUNT_BANK_MODEL_WITH_DETAILS
      };

      let sort = component.sortingDataAccessor(account, 'account');
      expect(sort).toEqual(<string>account.asset);
    });

    it('should sort by balance', () => {
      let account: AccountBankModelWithDetails = {
        ...TestConstants.ACCOUNT_BANK_MODEL_WITH_DETAILS
      };

      let sort = component.sortingDataAccessor(account, 'balance');
      expect(sort).toEqual(<number>account.value);
    });
    it('should sort by default', () => {
      let account: AccountBankModelWithDetails = {
        ...TestConstants.ACCOUNT_BANK_MODEL_WITH_DETAILS
      };

      let sort = component.sortingDataAccessor(account, '');
      expect(sort).toEqual('');
    });
    it('should update the dataSource', () => {
      const dataSourceSort = component.dataSource.sort;

      component.sortChange();
      expect(dataSourceSort).toBeUndefined();
    });
  });

  it('should navigate on trading account row click', () => {
    component.onRowClick(TestConstants.ACCOUNT_BANK_MODEL_BTC);

    // Test default config.routing=true
    expect(MockRoutingService.handleRoute).toHaveBeenCalledWith({
      route: 'account-details',
      origin: 'account-list',
      extras: {
        queryParams: {
          accountGuid: TestConstants.ACCOUNT_BANK_MODEL_BTC.guid
        }
      }
    });
  });

  it('should navigate on fiat account row click', () => {
    component.onRowClick(TestConstants.ACCOUNT_BANK_MODEL_USD);

    // Test default config.routing=true
    expect(MockRoutingService.handleRoute).toHaveBeenCalledWith({
      route: 'fiat-account-details',
      origin: 'account-list',
      extras: {
        queryParams: {
          accountGuid: TestConstants.ACCOUNT_BANK_MODEL_USD.guid
        }
      }
    });
  });
});
