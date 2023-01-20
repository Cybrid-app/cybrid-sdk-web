import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderFactory } from '../../../modules/library.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

// Services
import {
  Account,
  AccountService,
  AssetService,
  ConfigService,
  ErrorService,
  EventService,
  RoutingService
} from '@services';

// Components
import { AccountListComponent } from '@components';

// Utility
import { AssetPipe } from '@pipes';
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
  let MockAssetService = jasmine.createSpyObj('AssetService', ['getAsset']);
  let MockAccountService = jasmine.createSpyObj('AccountService', [
    'getPortfolio'
  ]);
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  const error$ = throwError(() => {
    new Error('Error');
  });

  @Pipe({
    name: 'asset'
  })
  class MockAssetPipe implements PipeTransform {
    transform(value: any): any {
      return value;
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountListComponent, MockAssetPipe],
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
        { provide: AssetPipe, useClass: MockAssetPipe },
        { provide: AssetService, useValue: MockAssetService },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: AccountService, useValue: MockAccountService },
        { provide: RoutingService, useValue: MockRoutingService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockAssetService = TestBed.inject(AssetService);
    MockAssetService.getAsset.and.returnValue(TestConstants.USD_ASSET);
    MockAccountService = TestBed.inject(AccountService);
    MockAccountService.getPortfolio.and.returnValue(
      of(TestConstants.ACCOUNT_OVERVIEW)
    );
    MockRoutingService = TestBed.inject(RoutingService);

    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
    component.currentFiat = Constants.USD_ASSET;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log an event when the component is initialized', () => {
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should get accounts', fakeAsync(() => {
    const balance$Spy = spyOn(component.balance$, 'next');
    const fiatAccount$Spy = spyOn(component.fiatAccount$, 'next');

    component.ngOnInit();
    tick();

    expect(MockAccountService.getPortfolio).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(balance$Spy).toHaveBeenCalledWith(
      TestConstants.ACCOUNT_OVERVIEW.balance
    );
    expect(fiatAccount$Spy).toHaveBeenCalledWith(
      TestConstants.ACCOUNT_OVERVIEW.fiatAccount
    );
    expect(component.dataSource.data).toEqual(
      TestConstants.ACCOUNT_OVERVIEW.accounts
    );
    discardPeriodicTasks();
  }));

  it('should handle errors when calling get accounts', () => {
    MockAccountService.getPortfolio.and.returnValue(error$);

    component.ngOnInit();

    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
  });

  it('should refresh the accounts', fakeAsync(() => {
    const getAccountsSpy = spyOn(component, 'getAccounts');

    component.ngOnInit();
    tick(TestConstants.CONFIG.refreshInterval);

    expect(getAccountsSpy).toHaveBeenCalledTimes(2);
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('should sort custom data fields', () => {
    // Get first account ('ETH-USD')
    let account: Account = TestConstants.ACCOUNT_OVERVIEW.accounts[0];

    // Sort by account
    let sort = component.sortingDataAccessor(account, 'asset');
    expect(sort).toEqual(account.account.asset!);

    // Sort by balance
    sort = component.sortingDataAccessor(account, 'balance');
    expect(sort).toEqual(account.value);

    // Sort by !account || !balance
    sort = component.sortingDataAccessor(account, 'test');
    expect(sort).toEqual('');
  });

  it('should navigate on row click', () => {
    component.onRowClick(TestConstants.ACCOUNT_GUID);

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
