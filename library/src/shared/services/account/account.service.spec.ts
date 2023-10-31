import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../app/modules/library.module';
import { HttpClient } from '@angular/common/http';

import { EMPTY, of, throwError } from 'rxjs';

// Client
import {
  AccountBankModel,
  AccountListBankModel,
  AccountsService
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { AccountService, ErrorService, EventService } from '@services';

// Utility
import { TestConstants } from '@constants';

describe('AccountService', () => {
  let service: AccountService;
  let MockEventService = jasmine.createSpyObj('EventService', ['handleEvent']);
  let MockErrorService = jasmine.createSpyObj('ErrorService', ['handleError']);
  let MockAccountsService = jasmine.createSpyObj(AccountsService, [
    'listAccounts',
    'getAccount'
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
        { provide: AccountsService, useValue: MockAccountsService },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService }
      ]
    });
    service = TestBed.inject(AccountService);

    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockAccountsService = TestBed.inject(AccountsService);
    MockAccountsService.listAccounts.and.returnValue(
      of(TestConstants.ACCOUNT_LIST_BANK_MODEL)
    );
    MockAccountsService.getAccount.and.returnValue(
      of(TestConstants.ACCOUNT_BANK_MODEL_BTC)
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when getting an account, ', () => {
    it('should get an account', () => {
      const testAccount = { ...TestConstants.ACCOUNT_BANK_MODEL_BTC };

      service.getAccount('').subscribe((account: AccountBankModel) => {
        expect(account).toEqual(testAccount);
      });
    });

    it('should handle errors', () => {
      MockAccountsService.getAccount.and.returnValue(error$);

      service.getAccount('').subscribe(() => {
        expect(MockErrorService.handleError).toHaveBeenCalled();
        expect(MockEventService.handleEvent).toHaveBeenCalled();
      });
    });
  });

  describe('when listing accounts', () => {
    it('should list accounts', () => {
      const testAccounts = { ...TestConstants.ACCOUNT_LIST_BANK_MODEL };

      service.listAccounts().subscribe((accounts: AccountListBankModel) => {
        expect(accounts).toEqual(testAccounts);
      });
    });

    it('should handle errors', () => {
      MockAccountsService.listAccounts.and.returnValue(error$);

      service.listAccounts().subscribe(() => {
        expect(MockErrorService.handleError).toHaveBeenCalled();
        expect(MockEventService.handleEvent).toHaveBeenCalled();
      });
    });
  });

  describe('when paging all accounts', () => {
    it('should page accounts', () => {
      const perPage = Number(TestConstants.ACCOUNT_LIST_BANK_MODEL.total);
      service.pageAccounts(perPage, TestConstants.ACCOUNT_LIST_BANK_MODEL);

      expect(MockAccountsService.listAccounts).toHaveBeenCalled();
    });

    it('should return EMPTY when complete', () => {
      const perPage = Number(TestConstants.ACCOUNT_LIST_BANK_MODEL.total + 1);
      const accounts = service.pageAccounts(
        perPage,
        TestConstants.ACCOUNT_LIST_BANK_MODEL
      );

      expect(accounts).toEqual(EMPTY);
    });

    it('should accumulate accounts', () => {
      const totalAccounts =
        Number(TestConstants.ACCOUNT_LIST_BANK_MODEL.total) + 1;
      const accounts = service.accumulateAccounts(
        TestConstants.ACCOUNT_LIST_BANK_MODEL.objects,
        [TestConstants.ACCOUNT_LIST_BANK_MODEL.objects[0]]
      );

      expect(accounts.length).toEqual(totalAccounts);
    });
  });

  describe('when listing all accounts', () => {
    it('should list all accounts', () => {
      service.accountsPerPage = Number(
        TestConstants.ACCOUNT_LIST_BANK_MODEL.total
      );

      service.listAllAccounts().subscribe((accounts: AccountBankModel[]) => {
        expect(TestConstants.ACCOUNT_LIST_BANK_MODEL.objects).toEqual(accounts);
      });
    });

    it('should handle errors', () => {
      MockAccountsService.listAccounts.and.returnValue(error$);

      service.listAllAccounts().subscribe(() => {
        expect(MockErrorService.handleError).toHaveBeenCalled();
        expect(MockEventService.handleEvent).toHaveBeenCalled();
      });
    });
  });
});
