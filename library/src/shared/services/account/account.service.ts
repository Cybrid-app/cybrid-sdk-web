import { Injectable, OnDestroy } from '@angular/core';
import {
  catchError,
  EMPTY,
  expand,
  map,
  tap,
  Observable,
  of,
  reduce,
  Subject
} from 'rxjs';

// Client
import {
  AccountBankModel,
  AccountListBankModel,
  AccountsService,
  SymbolPriceBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { LEVEL, CODE, EventService, ErrorService } from '@services';

export interface AccountBankModelWithDetails extends AccountBankModel {
  price?: SymbolPriceBankModel;
  value?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService implements OnDestroy {
  private unsubscribe$ = new Subject();

  accountsPerPage = 10;

  constructor(
    private eventService: EventService,
    private errorService: ErrorService,
    private accountsService: AccountsService
  ) {}

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  listAccounts(
    page?: string,
    perPage?: string
  ): Observable<AccountListBankModel> {
    return this.accountsService.listAccounts(page, perPage).pipe(
      catchError((err) => {
        this.eventService.handleEvent(
          LEVEL.ERROR,
          CODE.DATA_ERROR,
          'There was an error listing accounts'
        );

        this.errorService.handleError(
          new Error('There was an error listing accounts')
        );
        return of(err);
      })
    );
  }

  pageAccounts(perPage: number, list: AccountListBankModel) {
    return list.objects.length == perPage
      ? this.accountsService.listAccounts(
        (Number(list.page) + 1).toString(),
        perPage.toString()
      )
      : EMPTY;
  }

  accumulateAccounts(acc: AccountBankModel[], value: AccountBankModel[]) {
    return [...acc, ...value];
  }

  listAllAccounts(): Observable<AccountBankModel[]> {
    return this.accountsService.listAccounts().pipe(
      expand((list) => this.pageAccounts(this.accountsPerPage, list)),
      map((list) => list.objects),
      reduce((acc, value) => this.accumulateAccounts(acc, value)),
      catchError((err) => {
        this.eventService.handleEvent(
          LEVEL.ERROR,
          CODE.DATA_ERROR,
          'There was an error listing all accounts'
        );

        this.errorService.handleError(
          new Error('There was an error listing all accounts')
        );
        return of(err);
      })
    );
  }

  getAccount(guid: string): Observable<AccountBankModel> {
    return this.accountsService.getAccount(guid).pipe(
      catchError((err) => {
        this.eventService.handleEvent(
          LEVEL.ERROR,
          CODE.DATA_ERROR,
          `There was an error fetching account ${guid}`
        );

        this.errorService.handleError(
          new Error(`There was an error fetching account ${guid}`)
        );
        return of(err);
      })
    );
  }
}
