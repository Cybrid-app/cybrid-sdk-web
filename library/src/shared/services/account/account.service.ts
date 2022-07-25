import { Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

// Client
import {
  AccountBankModel,
  AccountsService
} from '@cybrid/cybrid-api-bank-angular';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private accountsService: AccountsService) {}

  // Filtered for trading account platform balances
  getBalances() {
    return this.getAccounts().pipe();
  }

  // Filtered for only 'trading' accounts
  getAccounts(): Observable<AccountBankModel[]> {
    return this.accountsService.listAccounts().pipe(
      map((accounts) => {
        return accounts.objects.filter((account: AccountBankModel) => {
          return account.type == 'trading';
        });
      })
    );
  }
}
