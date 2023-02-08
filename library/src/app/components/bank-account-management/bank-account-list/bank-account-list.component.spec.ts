import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';
import {
  ExternalBankAccountListBankModel,
  ExternalBankAccountsService
} from '@cybrid/cybrid-api-bank-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { Observable, of, throwError } from 'rxjs';

// Services
import { ConfigService, RoutingService } from '@services';

// Components
import { BankAccountListComponent } from '@components';

// Models
import { ExternalBankAccountBankModel } from '@cybrid/cybrid-api-bank-angular/model/externalBankAccount';

// Utility
import { Constants, TestConstants } from '@constants';
import { SharedModule } from '../../../../shared/modules/shared.module';

describe('BankAccountListComponent', () => {
  let component: BankAccountListComponent;
  let fixture: ComponentFixture<BankAccountListComponent>;

  let MockConfigService = jasmine.createSpyObj('ConfigService', {
    getConfig$: of(TestConstants.CONFIG)
  });
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  let MockExternalBankAccountService = jasmine.createSpyObj(
    'ExternalBankAccountsService',
    {
      listExternalBankAccounts: of(
        TestConstants.EXTERNAL_BANK_ACCOUNT_LIST_BANK_MODEL
      )
    }
  );
  let MockDialog = jasmine.createSpyObj('Dialog', ['open']);

  const error$ = throwError(() => {
    new Error('Error');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankAccountListComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        MatDialogModule,
        SharedModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: RoutingService, useValue: MockRoutingService },
        { provide: ConfigService, useValue: MockConfigService },
        {
          provide: ExternalBankAccountsService,
          useValue: MockExternalBankAccountService
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialog, useValue: MockDialog }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockRoutingService = TestBed.inject(RoutingService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockExternalBankAccountService = TestBed.inject(
      ExternalBankAccountsService
    );
    MockDialog.open.and.returnValue({ afterClosed: () => of(true) });

    fixture = TestBed.createComponent(BankAccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    MockExternalBankAccountService.listExternalBankAccounts.calls.reset();
    MockExternalBankAccountService.listExternalBankAccounts.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_LIST_BANK_MODEL)
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sort the datasource', () => {
    component.listExternalBankAccounts();
    component.sortChange();

    expect(component.dataSource.sort).toEqual(component.sort);

    let account: ExternalBankAccountBankModel =
      TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL;

    // Sort by account
    let accountSort = component.sortingDataAccessor(account, 'account');
    expect(accountSort).toEqual(account.plaid_account_name!);

    // Default
    let defaultSort = component.sortingDataAccessor(account, '');
    expect(defaultSort).toEqual('');
  });

  it('should page through external bank accounts', () => {
    let externalBankAccountList = {
      ...TestConstants.EXTERNAL_BANK_ACCOUNT_LIST_BANK_MODEL
    };
    externalBankAccountList.objects = [];

    // Fill objects with default amount per page
    for (let i = 0; i < 10; i++) {
      externalBankAccountList.objects.push(
        TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL
      );
    }

    MockExternalBankAccountService.listExternalBankAccounts.and.returnValue(
      of(externalBankAccountList)
    );

    component.listExternalBankAccounts();
    expect(
      component.pageExternalAccounts(externalBankAccountList)
    ).toBeInstanceOf(Observable<ExternalBankAccountListBankModel>);
  });

  it('should navigate to bank-connect onAddAccount()', () => {
    component.listExternalBankAccounts();
    component.onAddAccount();
    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });

  it('should handle errors on listExternalBankAccounts()', () => {
    const refreshDataSubSpy = spyOn(component.refreshDataSub, 'unsubscribe');
    const isLoadingSpy = spyOn(component.isLoading$, 'next');
    MockExternalBankAccountService.listExternalBankAccounts.and.returnValue(
      error$
    );

    component.listExternalBankAccounts();
    expect(refreshDataSubSpy).toHaveBeenCalled();
    expect(component.listExternalBankAccountsError).toBeTrue();
    expect(component.dataSource.data).toEqual([]);
    expect(isLoadingSpy).toHaveBeenCalled();
  });

  it('should refresh the external bank account list', fakeAsync(() => {
    const listExternalBankAccountsSpy = spyOn(
      component,
      'listExternalBankAccounts'
    );

    component.refreshData();
    tick(Constants.REFRESH_INTERVAL);
    expect(listExternalBankAccountsSpy).toHaveBeenCalled();

    discardPeriodicTasks();
  }));

  it('should open the bank-account-details dialog onAccountSelect()', () => {
    component.onAccountSelect(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL);
    expect(MockDialog.open).toHaveBeenCalled();
  });

  it('should list external bank accounts if the bank-account-details dialog returns true', () => {
    const listExternalBankAccountsSpy = spyOn(
      component,
      'listExternalBankAccounts'
    );

    component.onAccountSelect(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL);
    expect(listExternalBankAccountsSpy).toHaveBeenCalled();
  });
});
