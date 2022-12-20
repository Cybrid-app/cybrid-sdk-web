import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  Subject,
  takeUntil
} from 'rxjs';

// Client
import {
  AccountBankModel,
  QuoteBankModel,
  SymbolPriceBankModel
} from '@cybrid/cybrid-api-bank-angular';
import SideEnum = QuoteBankModel.SideEnum;
import TypeEnum = AccountBankModel.TypeEnum;

// Services
import { TestAccountsService } from '../../../../shared/services/test-accounts/test-accounts.service';
import { TestPricesService } from '../../../../shared/test-prices/test-prices.service';

// Utility
import { FiatMask } from '../../../../shared/utility/fiat-mask';

interface TradeFormGroup {
  account: FormControl<AccountBankModel | null>;
  amount: FormControl<number | null>;
}

interface TradeData {
  accounts: AccountBankModel[];
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

  accounts$ = this.testAccountsService.accounts$.pipe(
    map((accounts) => accounts.filter((account) => account.type == 'trading'))
  );
  prices$ = this.testPricesService.prices$;
  tradeData$: Observable<TradeData> = combineLatest([
    this.accounts$,
    this.prices$
  ]).pipe(
    takeUntil(this.unsubscribe$),
    map(([accounts, prices]: [AccountBankModel[], SymbolPriceBankModel[]]) => ({
      accounts: accounts,
      prices: prices
    }))
  );

  tradeFormGroup!: FormGroup<TradeFormGroup>;
  side: SideEnum = SideEnum.Buy;
  input: TypeEnum = TypeEnum.Trading;

  constructor(
    private testAccountsService: TestAccountsService,
    private testPricesService: TestPricesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Initialize/refresh data
    this.testAccountsService.listAccounts();
    this.testPricesService.listPrices();

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
    // Mask the amount control for fiat currency
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

  validateTradeForm(): void {}

  // Switch amount input
  onSwitchInput(): void {
    this.input == TypeEnum.Fiat
      ? (this.input = TypeEnum.Trading)
      : (this.input = TypeEnum.Fiat);
  }

  // Switch trading side
  onSwitchSide(): void {
    this.side == SideEnum.Buy
      ? (this.side = SideEnum.Sell)
      : (this.side = SideEnum.Buy);
  }
}
