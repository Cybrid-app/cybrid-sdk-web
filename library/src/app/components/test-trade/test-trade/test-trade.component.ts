import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  BehaviorSubject,
  combineLatest,
  interval,
  map,
  Observable,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs';

// Client
import {
  AccountBankModel,
  PricesService,
  QuoteBankModel,
  SymbolPriceBankModel
} from '@cybrid/cybrid-api-bank-angular';
import SideEnum = QuoteBankModel.SideEnum;
import TypeEnum = AccountBankModel.TypeEnum;

// Services
import { TestAccountsService } from '../../../../shared/services/test-accounts/test-accounts.service';

// Utility
import { FiatMask } from '../../../../shared/utility/fiat-mask';
import { AssetService } from '@services';

interface TradeFormGroup {
  account: FormControl<AccountBankModel | null>;
  amount: FormControl<number | null>;
}

interface TradeData {
  accounts: AccountBankModel[];
  fiatAccount: AccountBankModel;
  prices: SymbolPriceBankModel[];
}

@Component({
  selector: 'app-test-trade',
  templateUrl: './test-trade.component.html',
  styleUrls: ['./test-trade.component.scss']
})
export class TestTradeComponent implements OnInit, OnDestroy {
  isLoading$ = new BehaviorSubject(true);
  unsubscribe$ = new Subject();

  // Filtering for 'created' accounts
  accounts$ = this.testAccountsService
    .listAccounts()
    .pipe(
      map((list) =>
        list.objects.filter((account) => account.state == 'created')
      )
    );
  prices$ = this.pricesService.listPrices();
  tradeData$: Observable<TradeData> = combineLatest([
    this.accounts$,
    this.prices$
  ]).pipe(
    takeUntil(this.unsubscribe$),
    map(([accounts, prices]: [AccountBankModel[], SymbolPriceBankModel[]]) => ({
      accounts: accounts.filter((account) => account.type == 'trading'),
      fiatAccount: accounts.filter((account) => account.type == 'fiat')[0],
      prices: prices
    }))
  );

  tradeFormGroup!: FormGroup<TradeFormGroup>;
  side: SideEnum = SideEnum.Buy;
  input: TypeEnum = TypeEnum.Trading;

  constructor(
    private testAccountsService: TestAccountsService,
    private pricesService: PricesService,
    private assetService: AssetService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Initialize/refresh data
    this.testAccountsService.listAccounts();

    this.initTradeForm();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  initTradeForm(): void {
    combineLatest([this.route.queryParams, this.tradeData$])
      .pipe(
        map(([params, data]) => {
          // Initialize form group
          this.tradeFormGroup = new FormGroup<TradeFormGroup>({
            account: new FormControl(null),
            amount: new FormControl(null)
          });

          // Check for routing data
          const account = data.accounts.find(
            (account) => account.asset == params['code']
          );

          // Set to the requested account, or the first account
          account
            ? this.tradeFormGroup.controls.account.setValue(account)
            : this.tradeFormGroup.controls.account.setValue(data.accounts[0]);
        })
      )
      .subscribe(() => {
        this.maskTradeForm();
        this.validateTradeForm();

        this.isLoading$.next(false);
      });
  }

  maskTradeForm(): void {
    // Mask fiat input
    this.tradeFormGroup.controls.amount.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
        map((amount) => {
          if (this.input == TypeEnum.Fiat && amount?.toString().includes('.')) {
            this.tradeFormGroup.controls.amount.setValue(FiatMask(amount), {
              emitEvent: false
            });
          }
        })
      )
      .subscribe();
  }

  validateTradeForm(): void {
    this.tradeFormGroup.valueChanges
      .pipe(
        withLatestFrom(this.tradeData$),
        map(([value, data]) => {
          // const account = value.account;
          // const amount = value.amount;
          // if (account && amount) {
          //   if (account < 0) {
          //     this.tradeFormGroup.controls.amount.setErrors({
          //       negativeNumber: true
          //     });
          //   } else if (amount > 0 && data.fiatAccount.platform_available) {
          //     switch (this.side) {
          //       case 'buy':
          //         switch (this.input) {
          //           case 'trading':
          //             if (amount * price > baseFiatPlatformAvailable) {
          //               amountControl.setErrors({ nonSufficientFunds: true });
          //             }
          //             break;
          //           case 'fiat':
          //             if (value > tradeFiatPlatformAvailable) {
          //               amountControl.setErrors({ nonSufficientFunds: true });
          //             }
          //             break;
          //         }
          //         break;
          //       case 'sell':
          //         switch (this.input) {
          //           case 'asset':
          //             if (value > tradeTradingPlatformBalance) {
          //               amountControl.setErrors({ nonSufficientFunds: true });
          //             }
          //             break;
          //           case 'counter_asset':
          //             console.log(baseTradingPlatformBalance);
          //             break;
          //         }
          //         break;
          //     }
          //   }
          // }
          // if (value.amount) {
          //   if (value.amount < 0) {
          //     this.tradeFormGroup.controls.amount.setErrors({
          //       negativeNumber: true
          //     });
          //   } else if (
          //     value.amount > 0 &&
          //     this.fiatAccount.platform_available
          //   ) {
          //     const tradeFiatPlatformAvailable = this.assetPipe.transform(
          //       this.fiatAccount.platform_available,
          //       this.counterAsset,
          //       'trade'
          //     ) as number;
          //     const baseFiatPlatformAvailable = Number(
          //       this.fiatAccount.platform_available
          //     );
          //     const tradeTradingPlatformBalance = this.assetPipe.transform(
          //       this.tradingAccount.platform_balance!,
          //       this.asset,
          //       'trade'
          //     ) as number;
          //     const baseTradingPlatformBalance = Number(
          //       this.tradingAccount.platform_balance
          //     );
          //     const price = Number(this.price.buy_price);
          //     switch (this.side) {
          //       case 'buy':
          //         switch (this.input) {
          //           case 'asset':
          //             if (value * price > baseFiatPlatformAvailable) {
          //               amountControl.setErrors({ nonSufficientFunds: true });
          //             }
          //             break;
          //           case 'counter_asset':
          //             if (value > tradeFiatPlatformAvailable) {
          //               amountControl.setErrors({ nonSufficientFunds: true });
          //             }
          //             break;
          //         }
          //         break;
          //       case 'sell':
          //         switch (this.input) {
          //           case 'asset':
          //             if (value > tradeTradingPlatformBalance) {
          //               amountControl.setErrors({ nonSufficientFunds: true });
          //             }
          //             break;
          //           case 'counter_asset':
          //             console.log(baseTradingPlatformBalance);
          //             break;
          //         }
          //         break;
          //     }
          //   }
          // }
        })
      )
      .subscribe();
  }

  // Switch amount input
  onSwitchInput(): void {
    this.input == TypeEnum.Fiat
      ? (this.input = TypeEnum.Trading)
      : (this.input = TypeEnum.Fiat);

    // Update value/validity by triggering value changes
    this.tradeFormGroup.patchValue(this.tradeFormGroup.value);
  }

  // Switch trading side
  onSwitchSide(): void {
    this.side == SideEnum.Buy
      ? (this.side = SideEnum.Sell)
      : (this.side = SideEnum.Buy);

    // Update value/validity by triggering value changes
    this.tradeFormGroup.patchValue(this.tradeFormGroup.value);
  }
}
