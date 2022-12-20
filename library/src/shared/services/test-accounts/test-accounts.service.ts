import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';

import {
  AccountListBankModel,
  AccountsService
} from '@cybrid/cybrid-api-bank-angular';

import { ConfigService } from '@services';

@Injectable({
  providedIn: 'root'
})
export class TestAccountsService {
  constructor(
    private configService: ConfigService,
    private clientAccountsService: AccountsService
  ) {}

  /**
   * Get a list of accounts given the current customer
   * @return An account list
   **/
  listAccounts(): Observable<AccountListBankModel> {
    return this.configService
      .getConfig$()
      .pipe(
        switchMap((config) =>
          this.clientAccountsService.listAccounts(
            undefined,
            undefined,
            undefined,
            undefined,
            config.customer
          )
        )
      );
  }
}
