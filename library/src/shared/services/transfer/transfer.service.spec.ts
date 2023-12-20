import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../app/modules/library.module';
import { HttpClient } from '@angular/common/http';

import { EMPTY, of, throwError, catchError } from 'rxjs';

// Client
import {
  TransferBankModel,
  TransferListBankModel,
  TransfersService
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { TransferService, ErrorService, EventService } from '@services';

// Utility
import { TestConstants } from '@constants';

describe('TransferService', () => {
  let service: TransferService;
  let MockEventService = jasmine.createSpyObj('EventService', ['handleEvent']);
  let MockErrorService = jasmine.createSpyObj('ErrorService', ['handleError']);
  let MockTransfersService = jasmine.createSpyObj(TransfersService, [
    'listTransfers',
    'getTransfer'
  ]);

  const error$ = throwError(() => {
    new Error('Error');
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: TransfersService, useValue: MockTransfersService },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService }
      ]
    });
    service = TestBed.inject(TransferService);

    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockTransfersService = TestBed.inject(TransfersService);
    MockTransfersService.listTransfers.and.returnValue(
      of(TestConstants.TRANSFER_LIST_BANK_MODEL)
    );
    MockTransfersService.getTransfer.and.returnValue(
      of(TestConstants.FIAT_TRANSFER_BANK_MODEL)
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when getting a transfer, ', () => {
    it('should get a transfer', () => {
      const testTransfer = { ...TestConstants.FIAT_TRANSFER_BANK_MODEL };

      service.getTransfer('').subscribe((transfer: TransferBankModel) => {
        expect(transfer).toEqual(testTransfer);
      });
    });

    it('should handle errors', () => {
      MockTransfersService.getTransfer.and.returnValue(error$);

      service.getTransfer('').subscribe(() => {
        expect(MockErrorService.handleError).toHaveBeenCalled();
        expect(MockEventService.handleEvent).toHaveBeenCalled();
      });
    });
  });

  describe('when listing transfers', () => {
    it('should list transfers', () => {
      const testTransfers = { ...TestConstants.TRANSFER_LIST_BANK_MODEL };

      service.listTransfers().subscribe((transfers: TransferListBankModel) => {
        expect(transfers).toEqual(testTransfers);
      });
    });

    it('should handle errors', () => {
      MockTransfersService.listTransfers.and.returnValue(error$);

      service
        .listTransfers()
        .pipe(catchError((err) => of(err)))
        .subscribe(() => {
          expect(MockErrorService.handleError).toHaveBeenCalled();
          expect(MockEventService.handleEvent).toHaveBeenCalled();
        });
    });
  });

  describe('when paging all transfers', () => {
    it('should page transfers', () => {
      const perPage = Number(TestConstants.TRANSFER_LIST_BANK_MODEL.total);
      service.pageTransfers(
        perPage,
        TestConstants.TRANSFER_LIST_BANK_MODEL,
        ''
      );

      expect(MockTransfersService.listTransfers).toHaveBeenCalled();
    });

    it('should return EMPTY when complete', () => {
      const perPage = Number(TestConstants.TRANSFER_LIST_BANK_MODEL.total + 1);
      const transfers = service.pageTransfers(
        perPage,
        TestConstants.TRANSFER_LIST_BANK_MODEL,
        ''
      );

      expect(transfers).toEqual(EMPTY);
    });

    it('should accumulate transfers', () => {
      const totalTransfers =
        Number(TestConstants.TRANSFER_LIST_BANK_MODEL.total) + 1;
      const transfers = service.accumulateTransfers(
        TestConstants.TRANSFER_LIST_BANK_MODEL.objects,
        [TestConstants.TRANSFER_LIST_BANK_MODEL.objects[0]]
      );

      expect(transfers.length).toEqual(totalTransfers);
    });
  });

  describe('when listing all transfers', () => {
    it('should list all transfers', () => {
      service.transfersPerPage = Number(
        TestConstants.TRANSFER_LIST_BANK_MODEL.total
      );

      service
        .listAllTransfers('')
        .subscribe((transfers: TransferBankModel[]) => {
          expect(TestConstants.TRANSFER_LIST_BANK_MODEL.objects).toEqual(
            transfers
          );
        });

      expect(MockTransfersService.listTransfers).toHaveBeenCalled();
    });

    it('should handle errors', () => {
      MockTransfersService.listTransfers.and.returnValue(error$);

      service.listAllTransfers('').subscribe();
      expect(MockErrorService.handleError).toHaveBeenCalled();
      expect(MockEventService.handleEvent).toHaveBeenCalled();
    });
  });
});
