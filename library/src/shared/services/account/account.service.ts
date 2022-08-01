import { Injectable, OnDestroy } from '@angular/core';

import { forkJoin, Observable, Subject, map, catchError, of } from 'rxjs';

// Client
import {
  AccountBankModel,
  AccountsService,
  AssetBankModel,
  PricesService,
  SymbolPriceBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { AssetService, Asset } from '@services';

// Utility
import { symbolSplit } from '@utility';
import { AssetPipe } from '@pipes';

export interface Account {
  asset: Asset;
  counter_asset: Asset;
  price: SymbolPriceBankModel;
  value: number;
  account: AccountBankModel;
}

export interface AccountOverview {
  accounts: Account[];
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService implements OnDestroy {
  private unsubscribe$ = new Subject();

  constructor(
    private accountsService: AccountsService,
    private pricesService: PricesService,
    private assetService: AssetService,
    private assetPipe: AssetPipe
  ) {}

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  // Filter for 'trading' accounts
  filterAccounts(): Observable<AccountBankModel[]> {
    return this.accountsService.listAccounts().pipe(
      map((accounts) => {
        return accounts.objects.filter((account) => {
          return account.type == 'trading';
        });
      })
    );
  }

  // Filter for specific asset price
  filterPrices(
    prices: SymbolPriceBankModel[],
    accountModel: AccountBankModel
  ): SymbolPriceBankModel | undefined {
    return prices.find((price) => {
      const [asset] = symbolSplit(price.symbol!);
      return asset == accountModel.asset;
    });
  }

  // Returns asset and counter asset models
  getAccountAssets(assetCodes: string[]): Asset[] {
    const assets: Asset[] = [];
    assetCodes.forEach((code) => {
      assets.push(this.assetService.getAsset(code));
    });
    return assets;
  }

  // Returns approximate current market value of account in fiat
  getAccountValue(
    price: { amount: string; asset: AssetBankModel },
    balance: { amount: string; asset: AssetBankModel }
  ): number {
    const sellPrice = Number(
      this.assetPipe.transform(price.amount, price.asset, 'trade')
    );
    const platformBalance = Number(
      this.assetPipe.transform(balance.amount, balance.asset, 'trade')
    );
    return sellPrice * platformBalance;
  }

  getPortfolio(): Observable<AccountOverview> {
    return forkJoin([
      this.filterAccounts().pipe(
        catchError((err) => {
          return of(err);
        })
      ),
      this.pricesService.listPrices().pipe(
        catchError((err) => {
          return of(err);
        })
      )
    ]).pipe(
      map((combined) => {
        const [accounts, prices] = combined;

        let portfolioBalance = 0;
        let tradingAccounts: Account[] = [];

        accounts.forEach((accountModel: AccountBankModel) => {
          const priceModel = this.filterPrices(prices, accountModel);

          const [assetCode, counterAssetCode] = symbolSplit(prices[0].symbol!);
          const [assetModel, counterAssetModel] = this.getAccountAssets([
            accountModel.asset!,
            counterAssetCode
          ]);

          const accountValue = this.getAccountValue(
            {
              amount: priceModel!.sell_price!,
              asset: counterAssetModel
            },
            {
              amount: accountModel.platform_balance!,
              asset: assetModel
            }
          );

          // Build extended account model
          const account: Account = {
            asset: assetModel,
            counter_asset: counterAssetModel,
            price: priceModel!,
            value: accountValue,
            account: accountModel
          };

          // Push extended account model to trading account array
          tradingAccounts.push(account);
        });

        // Sum of all trading account market values
        tradingAccounts.forEach((account) => {
          portfolioBalance = portfolioBalance + account.value!;
        });

        return { accounts: tradingAccounts, balance: portfolioBalance };
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }
}
