import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../app/modules/library.module';
import { HttpClient } from '@angular/common/http';

import { EMPTY, of, throwError, catchError } from 'rxjs';

// Client
import {
    DepositAddressBankModel,
    DepositAddressListBankModel,
    PostDepositAddressBankModel,
    DepositAddressesService
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { DepositAddressService, ErrorService, EventService } from '@services';

// Utility
import { TestConstants } from '@constants';

describe('DepositAddressService', () => {
    let service: DepositAddressService;
    let MockEventService = jasmine.createSpyObj('EventService', ['handleEvent']);
    let MockErrorService = jasmine.createSpyObj('ErrorService', ['handleError']);
    let MockDepositAddressesService = jasmine.createSpyObj(DepositAddressesService, [
      'listDepositAddresses',
      'getDepositAddress',
      'createDepositAddress'
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
            { provide: DepositAddressesService, useValue: MockDepositAddressesService },
            { provide: EventService, useValue: MockEventService },
            { provide: ErrorService, useValue: MockErrorService }
          ]
        });
        service = TestBed.inject(DepositAddressService);
    
        MockEventService = TestBed.inject(EventService);
        MockErrorService = TestBed.inject(ErrorService);
        MockDepositAddressesService = TestBed.inject(DepositAddressesService);
        MockDepositAddressesService.listDepositAddresses.and.returnValue(
          of(TestConstants.DEPOSIT_ADDRESS_LIST_BANK_MODEL)
        );
        MockDepositAddressesService.getDepositAddress.and.returnValue(
          of(TestConstants.DEPOSIT_ADDRESS_BANK_MODEL)
        );
        MockDepositAddressesService.createDepositAddress.and.returnValue(
            of(TestConstants.DEPOSIT_ADDRESS_BANK_MODEL)
        );
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('when listDepositAddresses', () => {
        it('should list deposit addresses', () => {
          const testDepositAddresses = { ...TestConstants.DEPOSIT_ADDRESS_LIST_BANK_MODEL };
    
          service.listDepositAddresses().subscribe((depositAddresses: DepositAddressListBankModel) => {
            expect(depositAddresses).toEqual(testDepositAddresses);
          });
        });
    
        it('should handle errors', () => {
          MockDepositAddressesService.listDepositAddresses.and.returnValue(error$);
    
          service
            .listDepositAddresses()
            .pipe(catchError((err) => of(err)))
            .subscribe(() => {
              expect(MockErrorService.handleError).toHaveBeenCalled();
              expect(MockEventService.handleEvent).toHaveBeenCalled();
            });
        });
    });

    describe('when getDepositAddress', () => {
      it('should get deposit addresses', () => {
        const testDepositAddress = { ...TestConstants.DEPOSIT_ADDRESS_BANK_MODEL };
  
        service.getDepositAddress("").subscribe((depositAddress: DepositAddressBankModel) => {
          expect(depositAddress).toEqual(testDepositAddress);
        });
      });
  
      it('should handle errors', () => {
        MockDepositAddressesService.getDepositAddress.and.returnValue(error$);
  
        service
          .getDepositAddress("")
          .pipe(catchError((err) => of(err)))
          .subscribe(() => {
            expect(MockErrorService.handleError).toHaveBeenCalled();
            expect(MockEventService.handleEvent).toHaveBeenCalled();
          });
      });
    });

    describe('when createDepositAddress', () => {
      it('should create deposit addresses', () => {
        const testDepositAddress = { ...TestConstants.DEPOSIT_ADDRESS_BANK_MODEL };
        const postDepositAddressBankModel = { ...TestConstants.POST_DEPOSIT_ADDRESS_BANK_MODEL };

        service.createDepositAddress(postDepositAddressBankModel).subscribe((depositAddress: DepositAddressBankModel) => {
          expect(depositAddress).toEqual(testDepositAddress);
        });
      });
  
      it('should handle errors', () => {
        const postDepositAddressBankModel = { ...TestConstants.POST_DEPOSIT_ADDRESS_BANK_MODEL };
        MockDepositAddressesService.createDepositAddress.and.returnValue(error$);
  
        service
          .createDepositAddress(postDepositAddressBankModel)
          .pipe(catchError((err) => of(err)))
          .subscribe(() => {
            expect(MockErrorService.handleError).toHaveBeenCalled();
            expect(MockEventService.handleEvent).toHaveBeenCalled();
          });
      });
    });
});