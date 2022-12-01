import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  TranslateLoader,
  TranslateModule,
  TranslatePipe
} from '@ngx-translate/core';

import { of, throwError } from 'rxjs';

// Components
import { TransferConfirmComponent, TransferConfirmData } from '@components';

// Services
import { ConfigService, ErrorService, EventService } from '@services';
import {
  QuotesService,
  TransfersService
} from '@cybrid/cybrid-api-bank-angular';

// Utility
import { Constants, TestConstants } from '@constants';
import { AssetPipe, MockAssetPipe, TruncatePipe } from '@pipes';
import { SharedModule } from '../../../../shared/modules/shared.module';

describe('TransferConfirmComponent', () => {
  let component: TransferConfirmComponent;
  let fixture: ComponentFixture<TransferConfirmComponent>;

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
  let MockQuotesService = jasmine.createSpyObj('QuotesService', [
    'createQuote'
  ]);
  let MockTransfersService = jasmine.createSpyObj('TransfersService', [
    'getTransfer',
    'createTransfer'
  ]);
  let MockDialog = jasmine.createSpyObj('Dialog', ['open', 'close']);
  let MockSnackbar = jasmine.createSpyObj('Snackbar', ['open']);

  const error$ = throwError(() => {
    new Error('Error');
  });

  let MockTransferConfirmData: TransferConfirmData = {
    asset: TestConstants.USD_ASSET,
    externalBankAccountBankModel:
      TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL,
    postQuoteBankModel: TestConstants.POST_QUOTE,
    quoteBankModel: TestConstants.QUOTE_BANK_MODEL
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransferConfirmComponent, TruncatePipe, MockAssetPipe],
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
        {
          provide: MAT_DIALOG_DATA,
          useValue: MockTransferConfirmData
        },
        { provide: MatDialogRef, useValue: MockDialog },
        { provide: AssetPipe, useClass: MockAssetPipe },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: QuotesService, useValue: MockQuotesService },
        { provide: TransfersService, useValue: MockTransfersService },
        { provide: MatSnackBar, useValue: MockSnackbar },
        TranslatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getCustomer$.and.returnValue(
      of(TestConstants.CUSTOMER_BANK_MODEL)
    );
    MockQuotesService = TestBed.inject(QuotesService);
    MockQuotesService.createQuote.and.returnValue(
      of(TestConstants.QUOTE_BANK_MODEL_TRANSFER)
    );
    MockTransfersService = TestBed.inject(TransfersService);
    MockTransfersService.createTransfer.and.returnValue(
      of(TestConstants.TRANSFER_BANK_MODEL)
    );
    MockTransfersService.getTransfer.and.returnValue(
      of(TestConstants.TRANSFER_BANK_MODEL)
    );
    MockDialog = TestBed.inject(MatDialogRef);
    MockDialog.open.and.returnValue({
      afterClosed: () => of(TestConstants.TRANSFER_BANK_MODEL)
    });

    fixture = TestBed.createComponent(TransferConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should getQuote()', fakeAsync(() => {
    component.getQuote();

    tick(Constants.PLATFORM_REFRESH_INTERVAL);
    expect(MockQuotesService.createQuote).toHaveBeenCalled();

    discardPeriodicTasks();
  }));

  it('should handle errors on getQuote()', fakeAsync(() => {
    MockQuotesService.createQuote.and.returnValue(error$);

    component.getQuote();

    tick(Constants.PLATFORM_REFRESH_INTERVAL);
    expect(MockDialog.close).toHaveBeenCalled();
    expect(MockSnackbar.open).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  }));

  it('should create transfer onConfirmTransfer()', () => {
    const isLoadingSpy = spyOn(component.isLoading$, 'next');

    component.onConfirmTransfer();

    expect(isLoadingSpy).toHaveBeenCalledWith(true);
    expect(MockTransfersService.createTransfer).toHaveBeenCalled();
  });

  it('should get transfer onConfirmTransfer()', fakeAsync(() => {
    let transfer = { ...TestConstants.TRANSFER_BANK_MODEL };
    transfer.state = 'storing';

    // Mock 'state' as 'storing' for create call
    MockTransfersService.createTransfer.and.returnValue(of(transfer));

    component.onConfirmTransfer();

    tick();
    expect(MockTransfersService.getTransfer).toHaveBeenCalled();
    expect(MockDialog.close).toHaveBeenCalled();
  }));

  it('should poll on getTransfer()', fakeAsync(() => {
    let transfer = { ...TestConstants.TRANSFER_BANK_MODEL };
    transfer.state = 'storing';

    // Mock 'state' as 'storing' for both create and get calls
    MockTransfersService.createTransfer.and.returnValue(of(transfer));
    MockTransfersService.getTransfer.and.returnValue(of(transfer));

    // Reset spy
    MockTransfersService.getTransfer.calls.reset();

    component.onConfirmTransfer();
    tick(Constants.POLL_DURATION);

    const callCount = Constants.POLL_DURATION / Constants.POLL_INTERVAL;
    expect(MockTransfersService.getTransfer).toHaveBeenCalledTimes(callCount);
  }));

  it('should handle a timeout on getTransfer()', () => {
    component.onConfirmTransfer();

    // Force timeout
    component.error$.next(true);

    expect(MockDialog.close).toHaveBeenCalled();
    expect(MockSnackbar.open).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should handle an error on createTransfer()', fakeAsync(() => {
    MockTransfersService.createTransfer.and.returnValue(error$);

    component.onConfirmTransfer();

    tick();
    expect(MockDialog.close).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  }));

  it('should handle an error on getTransfer()', fakeAsync(() => {
    MockTransfersService.getTransfer.and.returnValue(error$);

    component.onConfirmTransfer();

    tick();
    expect(MockDialog.close).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  }));
});
