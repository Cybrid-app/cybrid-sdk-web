import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ExternalBankAccountsService } from '@cybrid/cybrid-api-bank-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { of, throwError } from 'rxjs';

// Services
import { ConfigService, RoutingService } from '@services';

// Components
import { BankAccountListComponent } from '@components';

// Utility
import { TestConstants } from '@constants';
import { ExternalBankAccountBankModel } from '@cybrid/cybrid-api-bank-angular/model/externalBankAccount';
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
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockRoutingService = TestBed.inject(RoutingService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockExternalBankAccountService = TestBed.inject(
      ExternalBankAccountsService
    );

    fixture = TestBed.createComponent(BankAccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

  it('should navigate to bank-connect onAddAccount()', () => {
    component.listExternalBankAccounts();
    component.onAddAccount();
    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });

  // it('should navigate to bank-connect with the account guid onAccountRefresh()', () => {
  //   let mockRoutingData = { ...component.routingData };
  //   mockRoutingData.extras = {
  //     queryParams: {
  //       externalAccountGuid: TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL.guid
  //     }
  //   };
  //
  //   component.onAccountRefresh(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL);
  //   expect(MockRoutingService.handleRoute).toHaveBeenCalledWith(
  //     mockRoutingData
  //   );
  // });
});
