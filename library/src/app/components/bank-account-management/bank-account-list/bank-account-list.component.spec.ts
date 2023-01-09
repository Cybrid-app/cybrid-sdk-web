import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExternalBankAccountsService } from '@cybrid/cybrid-api-bank-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { PageEvent } from '@angular/material/paginator';

import { of, throwError } from 'rxjs';

// Services
import {
  ConfigService,
  ErrorService,
  EventService,
  RoutingService
} from '@services';
// Components

import { BankAccountManagementComponent } from '@components';

// Utility
import { TestConstants } from '@constants';
import { ExternalBankAccountBankModel } from '@cybrid/cybrid-api-bank-angular/model/externalBankAccount';
import { SharedModule } from '../../../../shared/modules/shared.module';

describe('BankAccountManagementComponent', () => {
  let component: BankAccountManagementComponent;
  let fixture: ComponentFixture<BankAccountManagementComponent>;

  let MockConfigService = jasmine.createSpyObj('ConfigService', {
    getConfig$: of(TestConstants.CONFIG)
  });
  let MockEventService = jasmine.createSpyObj('EventService', [
    'getEvent',
    'handleEvent'
  ]);
  let MockErrorService = jasmine.createSpyObj('ErrorService', [
    'getError',
    'handleError'
  ]);
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
  const error$ = throwError(() => {
    new Error('Error');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankAccountManagementComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
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
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: RoutingService, useValue: MockRoutingService },
        { provide: ConfigService, useValue: MockConfigService },
        {
          provide: ExternalBankAccountsService,
          useValue: MockExternalBankAccountService
        },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockRoutingService = TestBed.inject(RoutingService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockExternalBankAccountService = TestBed.inject(
      ExternalBankAccountsService
    );

    fixture = TestBed.createComponent(BankAccountManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle errors on listBankAccounts()', () => {
    MockExternalBankAccountService.listExternalBankAccounts.and.returnValue(
      error$
    );

    component.listBankAccounts();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
  });

  it('should get accounts on page change', () => {
    const listBankAccountsSpy = spyOn(component, 'listBankAccounts');
    const testPageChange: PageEvent = {
      length: 0,
      pageIndex: 0,
      pageSize: 5
    };

    component.pageChange(testPageChange);
    expect(listBankAccountsSpy).toHaveBeenCalled();
  });

  it('should sort the datasource', () => {
    component.sortChange();
    expect(component.dataSource.sort).toEqual(component.sort);

    let account: ExternalBankAccountBankModel =
      TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL;

    // Sort by account
    let accountSort = component.sortingDataAccessor(account, 'account');
    expect(accountSort).toEqual(account.guid!);

    // Default
    let defaultSort = component.sortingDataAccessor(account, '');
    expect(defaultSort).toEqual('');
  });

  it('should display the account onAccountSelect()', () => {
    const dialogSpy = spyOn(component.dialog, 'open');

    component.onAccountSelect(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL);
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should navigate to bank-connect onAddAccount()', () => {
    component.onAddAccount();
    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });
});
