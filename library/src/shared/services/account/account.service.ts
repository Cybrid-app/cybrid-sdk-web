import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, catchError, of } from 'rxjs';

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

  constructor(
    private eventService: EventService,
    private errorService: ErrorService,
    private accountsService: AccountsService
  ) { }

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
