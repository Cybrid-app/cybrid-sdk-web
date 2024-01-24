import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../app/modules/library.module';
import { HttpClient } from '@angular/common/http';

import { EMPTY, of, throwError, catchError } from 'rxjs';

// Client
import {
    ExternalWalletBankModel,
    ExternalWalletListBankModel,
    PostExternalWalletBankModel,
    ExternalWalletsService
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { ExternalWalletService, ErrorService, EventService } from '@services';

// Utility
import { TestConstants } from '@constants';

fdescribe('ExternalWalletService', () => {
    let service: ExternalWalletService;
    let MockEventService = jasmine.createSpyObj('EventService', ['handleEvent']);
    let MockErrorService = jasmine.createSpyObj('ErrorService', ['handleError']);
    let MockExternalWalletsService = jasmine.createSpyObj(
        ExternalWalletsService,
        ['listExternalWallets', 'getExternalWallet', 'createExternalWallet', 'deleteExternalWallet']
    );

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
            {
                provide: ExternalWalletsService,
                useValue: MockExternalWalletsService
            },
            { provide: EventService, useValue: MockEventService },
            { provide: ErrorService, useValue: MockErrorService }
          ]
        });
        service = TestBed.inject(ExternalWalletService);
    
        MockEventService = TestBed.inject(EventService);
        MockErrorService = TestBed.inject(ErrorService);
        MockExternalWalletsService = TestBed.inject(ExternalWalletsService);
        MockExternalWalletsService.listExternalWallets.and.returnValue(
          of(TestConstants.EXTERNAL_WALLET_LIST_BANK_MODEL)
        );
        MockExternalWalletsService.getExternalWallet.and.returnValue(
          of(TestConstants.EXTERNAL_WALLET_BANK_MODEL)
        );
        MockExternalWalletsService.createExternalWallet.and.returnValue(
          of(TestConstants.EXTERNAL_WALLET_BANK_MODEL)
        );
        MockExternalWalletsService.deleteExternalWallet.and.returnValue(
            of(TestConstants.EXTERNAL_WALLET_BANK_MODEL)
          );
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('when listExternalWallets', () => {
        it('should list external wallets', () => {
            const testExternalWallets = {
              ...TestConstants.EXTERNAL_WALLET_LIST_BANK_MODEL
            };
      
            service
                .listExternalWallets()
                .subscribe((externalWallets: ExternalWalletListBankModel) => {
                    expect(externalWallets).toEqual(testExternalWallets);
                });
        });

        it('should handle errors', () => {
            MockExternalWalletsService.listExternalWallets.and.returnValue(error$);
      
            service
              .listExternalWallets()
              .pipe(catchError((err) => of(err)))
              .subscribe(() => {
                expect(MockErrorService.handleError).toHaveBeenCalled();
                expect(MockEventService.handleEvent).toHaveBeenCalled();
              });
          });
    });

    describe('when getExternalWallet', () => {
        it('should get external wallet', () => {
            const testExternalWallet = {
              ...TestConstants.EXTERNAL_WALLET_BANK_MODEL
            };
      
            service
                .getExternalWallet('')
                .subscribe((externalWalletBankModel: ExternalWalletBankModel) => {
                    expect(externalWalletBankModel).toEqual(testExternalWallet);
                });
        });

        it('should handle errors', () => {
            MockExternalWalletsService.getExternalWallet.and.returnValue(error$);
      
            service
              .getExternalWallet('')
              .pipe(catchError((err) => of(err)))
              .subscribe(() => {
                expect(MockErrorService.handleError).toHaveBeenCalled();
                expect(MockEventService.handleEvent).toHaveBeenCalled();
              });
          });
    });

    describe('when createExternalWallet', () => {
        it('should create external wallet', () => {
            const testExternalWallet = {
              ...TestConstants.EXTERNAL_WALLET_BANK_MODEL
            };
            const postExternalWalletBankModel = {
              ...TestConstants.POST_EXTERNAL_WALLET_BANK_MODEL
            };
      
            service
                .createExternalWallet(postExternalWalletBankModel)
                .subscribe((externalWallet: ExternalWalletBankModel) => {
                    expect(externalWallet).toEqual(testExternalWallet);
                });
        });

        it('should handle errors', () => {
            const postExternalWalletBankModel = {
              ...TestConstants.POST_EXTERNAL_WALLET_BANK_MODEL
            };
            MockExternalWalletsService.createExternalWallet.and.returnValue(error$);
      
            service
                .createExternalWallet(postExternalWalletBankModel)
                .pipe(catchError((err) => of(err)))
                .subscribe(() => {
                    expect(MockErrorService.handleError).toHaveBeenCalled();
                    expect(MockEventService.handleEvent).toHaveBeenCalled();
                });
        });
    });

    describe('when deleteExternalWallet', () => {
        it('should delete external wallet', () => {
            const testExternalWallet = {
              ...TestConstants.EXTERNAL_WALLET_BANK_MODEL
            };
      
            service
                .deleteExternalWallet("")
                .subscribe((externalWallet: ExternalWalletBankModel) => {
                    expect(externalWallet).toEqual(testExternalWallet);
                });
        });

        it('should handle errors', () => {
            MockExternalWalletsService.deleteExternalWallet.and.returnValue(error$);
      
            service
                .deleteExternalWallet("")
                .pipe(catchError((err) => of(err)))
                .subscribe(() => {
                    expect(MockErrorService.handleError).toHaveBeenCalled();
                    expect(MockEventService.handleEvent).toHaveBeenCalled();
                });
        });
    });
});