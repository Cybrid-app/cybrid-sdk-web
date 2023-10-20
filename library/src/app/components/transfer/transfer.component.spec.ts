import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '../../../shared/modules/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import {
  TranslateLoader,
  TranslateModule,
  TranslatePipe
} from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable, of, throwError } from 'rxjs';

// Services
import {
  EventService,
  ErrorService,
  ConfigService,
  BankAccountService,
  AssetService,
  RoutingService,
  AccountService
} from '@services';
import {
  ExternalBankAccountListBankModel,
  QuotesService
} from '@cybrid/cybrid-api-bank-angular';

// Components
import { TransferComponent } from '@components';

// Utility
import { TestConstants } from '@constants';
import { AssetFormatPipe, MockAssetFormatPipe } from '@pipes';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('TransferComponent', () => {
  let component: TransferComponent;
  let fixture: ComponentFixture<TransferComponent>;

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
    'getCustomer$'
  ]);
  let MockBankAccountService = jasmine.createSpyObj('BankAccountService', [
    'listExternalBankAccounts'
  ]);
  let MockQuotesService = jasmine.createSpyObj('QuotesService', [
    'createQuote'
  ]);
  let MockAccountService = jasmine.createSpyObj('AccountService', [
    'getAccounts'
  ]);
  let MockAssetService = jasmine.createSpyObj('AssetService', ['getAsset']);
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  let MockDialog = jasmine.createSpyObj('Dialog', ['open']);
  let MockSnackbar = jasmine.createSpyObj('Snackbar', ['open']);

  const error$ = throwError(() => {
    new Error('Error');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransferComponent],
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
        { provide: BankAccountService, useValue: MockBankAccountService },
        { provide: QuotesService, useValue: MockQuotesService },
        { provide: AccountService, useValue: MockAccountService },
        { provide: AssetService, useValue: MockAssetService },
        { provide: RoutingService, useValue: MockRoutingService },
        { provide: MatDialog, useValue: MockDialog },
        { provide: MatSnackBar, useValue: MockSnackbar },
        TranslatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockConfigService.getCustomer$.and.returnValue(
      of(TestConstants.CUSTOMER_BANK_MODEL)
    );
    MockBankAccountService = TestBed.inject(BankAccountService);
    MockBankAccountService.listExternalBankAccounts.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_LIST_BANK_MODEL)
    );
    MockQuotesService = TestBed.inject(QuotesService);
    MockQuotesService.createQuote.and.returnValue(
      of(TestConstants.QUOTE_BANK_MODEL_TRANSFER)
    );
    MockAssetService.getAsset.and.returnValue(TestConstants.USD_ASSET);
    MockAccountService = TestBed.inject(AccountService);
    MockAccountService.getAccounts.and.returnValue(
      of(TestConstants.ACCOUNT_LIST_BANK_MODEL.objects)
    );
    MockAssetService = TestBed.inject(AssetService);
    MockRoutingService = TestBed.inject(RoutingService);
    MockDialog = TestBed.inject(MatDialog);
    MockDialog.open.and.returnValue({
      afterClosed: () => of(TestConstants.TRANSFER_BANK_MODEL)
    });

    fixture = TestBed.createComponent(TransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Set fiat asset and account
    component.fiatAsset = TestConstants.USD_ASSET;
    component.fiatAccount$.next(TestConstants.ACCOUNT_BANK_MODEL_USD);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the transfer form group', () => {
    expect(component.transferGroup).toBeDefined();
  });

  it('should validate the amount control if amount < platform_available', () => {
    component.side = 'withdrawal';

    // Validating against a 'platform_available' of $1.00
    component.transferGroup.controls.amount.setValue(0.5);

    expect(component.transferGroup.controls.amount.valid).toBeTrue();
  });

  it('should validate the amount control if amount == platform_available', () => {
    component.side = 'withdrawal';

    // Validating against a 'platform_available' of $1.00
    component.transferGroup.controls.amount.setValue(1);

    expect(component.transferGroup.controls.amount.valid).toBeTrue();
  });

  it('should invalidate the amount control if amount > platform_available', () => {
    component.side = 'withdrawal';

    // Validating against a 'platform_available' of $1.00
    component.transferGroup.controls.amount.setValue(2);

    expect(component.transferGroup.controls.amount.valid).toBeFalse();
  });

  it('should apply a currency mask to the amount control', () => {
    // Set invalid input to the amount control
    component.transferGroup.controls.amount.setValue(1.2345);

    // Expect extra digits to be trimmed
    expect(component.transferGroup.controls.amount.value).toEqual(1.23);
  });

  it('should switch the side', () => {
    component.onSwitchSide(-1);
    expect(component.side).toEqual('deposit');

    component.onSwitchSide(1);
    expect(component.side).toEqual('withdrawal');
  });

  it('should page through external bank accounts', () => {
    let externalBankAccountList = {
      ...TestConstants.EXTERNAL_BANK_ACCOUNT_LIST_BANK_MODEL
    };
    externalBankAccountList.objects = [];

    // Fill objects with amount per page
    for (let i = 0; i < component.externalBankAccountsPerPage; i++) {
      externalBankAccountList.objects.push(
        TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL
      );
    }

    MockBankAccountService.listExternalBankAccounts.and.returnValue(
      of(externalBankAccountList)
    );

    component.listAccounts();
    expect(
      component.pageExternalAccounts(
        component.externalBankAccountsPerPage,
        externalBankAccountList
      )
    ).toBeInstanceOf(Observable<ExternalBankAccountListBankModel>);

    // Reset
    MockBankAccountService.listExternalBankAccounts.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_LIST_BANK_MODEL)
    );
  });

  it('should accumulate external accounts', () => {
    expect(
      component.accumulateExternalAccounts(
        [{ ...TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL }],
        [{ ...TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL }]
      )
    ).toEqual([
      ...[{ ...TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL }],
      ...[{ ...TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL }]
    ]);
  });

  it('should handle an error on listExternalBankAccounts()', () => {
    MockBankAccountService.listExternalBankAccounts.and.returnValue(error$);

    component.listAccounts();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should handle an error on listAccounts()', () => {
    MockAccountService.getAccounts.and.returnValue(error$);

    component.listAccounts();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should create a quote onTransfer()', () => {
    // Set 'amount' control
    component.transferGroup.controls.amount.setValue(0.5);

    component.onTransfer();
    expect(MockQuotesService.createQuote).toHaveBeenCalled();
  });

  it('should open the TransferConfirmComponent onTransfer()', () => {
    // Set 'amount' control
    component.transferGroup.controls.amount.setValue(0.5);

    component.onTransfer();
    expect(MockDialog.open).toHaveBeenCalled();
  });

  it('should open the TransferDetailsComponent if the trade is confirmed', () => {
    // Set 'amount' control
    component.transferGroup.controls.amount.setValue(0.5);

    // Reset spy
    MockDialog.open.calls.reset();

    component.onTransfer();
    // First dialog is to confirm, second is to view details
    expect(MockDialog.open).toHaveBeenCalledTimes(2);
  });

  it('should handle a configService error onTransfer()', () => {
    // Set 'amount' control
    component.transferGroup.controls.amount.setValue(0.5);
    MockConfigService.getCustomer$.and.returnValue(error$);

    component.onTransfer();

    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockSnackbar.open).toHaveBeenCalled();
  });

  it('should handle a quotesService error onTransfer()', () => {
    // Set 'amount' control
    component.transferGroup.controls.amount.setValue(0.5);
    MockQuotesService.createQuote.and.returnValue(error$);

    component.onTransfer();

    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockSnackbar.open).toHaveBeenCalled();
  });

  it('should handle route onAddAccount()', () => {
    component.onAddAccount();

    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });
});
