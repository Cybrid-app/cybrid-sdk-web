import { Component, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  of,
  Subject,
  takeUntil,
  zip
} from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';

// Client
import {
  AccountBankModel,
  AssetBankModel,
  PricesService,
  SymbolPriceBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { AccountService, AssetService } from '@services';
import { symbolSplit } from '@utility';
import { AssetPipe } from '@pipes';
import { Constants } from '@constants';

export interface Account {
  asset: AssetBankModel;
  counter_asset: AssetBankModel;
  price: SymbolPriceBankModel;
  value: number;
  account: AccountBankModel;
}

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit {
  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  private unsubscribe$ = new Subject();

  balance$ = new BehaviorSubject(0);
  account$ = new Subject();

  // todo(Dustin) look into getting counter_asset as part of the config
  counter_asset = Constants.USD_ASSET;

  dataSource = new MatTableDataSource<Account>();
  displayedColumns: string[] = ['account', 'balance'];

  constructor(
    private accountService: AccountService,
    private assetService: AssetService,
    private priceService: PricesService,
    private assetPipe: AssetPipe
  ) {}

  ngOnInit(): void {
    this.getAccounts();
  }

  getAccounts(): void {
    zip(this.accountService.getAccounts(), this.priceService.listPrices())
      .pipe(
        takeUntil(this.unsubscribe$),
        map((zip) => {
          const [accounts, prices] = zip;
          let balance = 0;
          let data: Account[] = [];

          accounts.forEach((account) => {
            if (account.asset) {
              const price: SymbolPriceBankModel | undefined = prices.find(
                (price) => {
                  const [asset] = symbolSplit(price.symbol!);
                  return asset == account.asset;
                }
              );

              const [asset_code, counter_asset_code] = symbolSplit(
                prices[0].symbol!
              );

              const counter_asset =
                this.assetService.getAsset(counter_asset_code);

              const value =
                Number(
                  this.assetPipe.transform(
                    price?.sell_price!,
                    counter_asset,
                    'trade'
                  )
                ) *
                Number(
                  this.assetPipe.transform(
                    account.platform_balance!,
                    this.assetService.getAsset(account.asset),
                    'trade'
                  )
                );

              const acc: Account = {
                asset: this.assetService.getAsset(account.asset),
                counter_asset: counter_asset,
                price: price!,
                value: value,
                account: account
              };
              data.push(acc);
            }
            data.forEach((account) => {
              balance = balance + account.value!;
            });
          });
          this.balance$.next(balance);
          this.account$.next(data);
          this.dataSource.data = data;
          this.isLoading$.next(false);
        }),
        catchError((err: any) => {
          console.log(err);
          return of(err);
        })
      )
      .subscribe();
  }
}
