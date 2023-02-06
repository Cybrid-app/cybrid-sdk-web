import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '../../../../shared/modules/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import {
  TranslateLoader,
  TranslateModule,
  TranslatePipe
} from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';

import { of } from 'rxjs';

// Services
import { BankAccountService, RoutingService } from '@services';

// Components
import { BankAccountDetailsComponent } from '@components';

// Utility
import { TruncatePipe } from '@pipes';
import { TestConstants } from '@constants';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('BankAccountDetailsComponent', () => {
  let component: BankAccountDetailsComponent;
  let fixture: ComponentFixture<BankAccountDetailsComponent>;

  let MockBankAccountService = jasmine.createSpyObj('BankAccountService', [
    'deleteExternalBankAccount'
  ]);
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  let MockDialog = jasmine.createSpyObj('Dialog', ['open']);
  let MockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
  let MockSnackbar = jasmine.createSpyObj('MatSnackBar', ['open']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankAccountDetailsComponent, TruncatePipe],
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
        { provide: BankAccountService, useValue: MockBankAccountService },
        { provide: RoutingService, useValue: MockRoutingService },
        {
          provide: MAT_DIALOG_DATA,
          useValue: TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL
        },
        { provide: MatDialog, useValue: MockDialog },
        { provide: MatDialogRef, useValue: MockDialogRef },
        { provide: MatSnackBar, useValue: MockSnackbar },
        TranslatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockBankAccountService = TestBed.inject(BankAccountService);
    MockBankAccountService.deleteExternalBankAccount.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL)
    );
    MockRoutingService = TestBed.inject(RoutingService);
    MockDialog = TestBed.inject(MatDialog);
    MockDialog.open.and.returnValue({ afterClosed: () => of(true) });

    fixture = TestBed.createComponent(BankAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.data = TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL;
  });

  afterEach(() => {
    MockBankAccountService.deleteExternalBankAccount.calls.reset();
    MockDialog.open.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate an external bank account', () => {
    expect(component.validateExternalBankAccount(true)).toBeFalse();
    expect(
      component.validateExternalBankAccount(
        TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL
      )
    ).toBeTrue();
  });

  it('should open the bank-account-disconnect dialog', () => {
    component.onDisconnect(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL);
    expect(MockDialog.open).toHaveBeenCalled();
  });

  it('should disconnect a bank account on confirmation', () => {
    component.onDisconnect(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL);
    expect(MockBankAccountService.deleteExternalBankAccount).toHaveBeenCalled();
  });

  it('should do nothing if disconnection is cancelled', () => {
    // Cancel disconnection dialog
    MockDialog.open.and.returnValue({
      afterClosed: () => of(false)
    });

    component.onDisconnect(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL);
    expect(
      MockBankAccountService.deleteExternalBankAccount
    ).toHaveBeenCalledTimes(0);
  });

  it('should open a snackbar message on successful disconnection', () => {
    component.onDisconnect(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL);
    expect(MockSnackbar.open).toHaveBeenCalled();
  });

  it('should open a snackbar on error disconnecting', () => {
    MockBankAccountService.deleteExternalBankAccount.and.returnValue(
      of(new Error(''))
    );
    component.onDisconnect(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL);
    expect(MockSnackbar.open).toHaveBeenCalled();
  });

  it('should call the routing service on reconnect', () => {
    component.onReconnect(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL);
    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
    expect(MockDialogRef.close).toHaveBeenCalled();
  });
});
