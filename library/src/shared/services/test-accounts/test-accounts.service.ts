import { Injectable } from '@angular/core';
import { map, ReplaySubject, switchMap, take } from 'rxjs';

import {
  AccountBankModel,
  AccountsService
} from '@cybrid/cybrid-api-bank-angular';

import { ConfigService } from '@services';

@Injectable({
  providedIn: 'root'
})
export class TestAccountsService {
  /**
   * Cached list of accounts
   * */
  accounts$: ReplaySubject<AccountBankModel[]> = new ReplaySubject(1);

  constructor(
    private configService: ConfigService,
    private clientAccountsService: AccountsService
  ) {}

  /**
   * Get a list of accounts given the current customer, and flatten the AccountListBankModel
   * @return An array of AccountBankModel
   **/
  listAccounts(): void {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        switchMap((config) =>
          this.clientAccountsService.listAccounts(
            undefined,
            undefined,
            undefined,
            undefined,
            config.customer
          )
        ),
        map((list) => this.accounts$.next(list.objects))
      )
      .subscribe();
  }
}
