import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  BehaviorSubject,
  combineLatest,
  interval,
  map,
  Observable,
  ReplaySubject,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil
} from 'rxjs';

// Client
import {
  AccountBankModel,
  PostQuoteBankModel,
  QuoteBankModel,
  SymbolPriceBankModel,
  TradeBankModel
} from '@cybrid/cybrid-api-bank-angular';

import SideEnum = QuoteBankModel.SideEnum;
import TypeEnum = AccountBankModel.TypeEnum;

// Utility
import { fiatMask, symbolBuild, filterPrices } from '@utility';
import { AssetFormatPipe } from '@pipes';
import {
  AccountService,
  AssetService,
  ComponentConfig,
  ConfigService,
  ErrorService,
  EventService,
  PriceService,
  QuoteService,
  RoutingData
} from '@services';
import { TradeConfirmComponent, TradeSummaryComponent } from '@components';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

export interface Accounts {
  assets: AccountBankModel[];
  counterAsset: AccountBankModel;
}

export interface Price {
  base: number;
  asset: number;
  counterAsset: number;
}

export interface TradeFormGroup {
  tradingAccount: FormControl<AccountBankModel | null>;
  fiatAccount: FormControl<AccountBankModel | null>;
  amount: FormControl<number | null>;
}

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss']
})
export class TradeComponent implements OnInit, OnDestroy {
  filterPrices = filterPrices;

  accounts$ = new ReplaySubject<Accounts>(1);
  priceList$ = new ReplaySubject<SymbolPriceBankModel[]>(1);

  price$ = new ReplaySubject<Price>(1);
  tradeData$ = new Observable<{ accounts: Accounts; price: Price }>();

  tradeFormGroup!: FormGroup<TradeFormGroup>;
  side: SideEnum = SideEnum.Buy;
  input: TypeEnum = TypeEnum.Trading;

  routingData: RoutingData = {
    route: 'price-list',
    origin: 'trade'
  };

  dialogRef!: MatDialogRef<TradeConfirmComponent>;

  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  unsubscribe$ = new Subject();

  constructor(
    private configService: ConfigService,
    private eventService: EventService,
    private errorService: ErrorService,
    private accountService: AccountService,
    private priceService: PriceService,
    private quoteService: QuoteService,
    private assetService: AssetService,
    private assetFormatPipe: AssetFormatPipe,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.tradeData$ = combineLatest([this.accounts$, this.price$]).pipe(
      map(([accounts, price]) => ({ accounts, price }))
    );

    this.getAccountList();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  getAccountList(): void {
    this.accountService
      .getAccounts()
      .pipe(
        take(1),
        map((list) => list.filter((account) => account.state == 'created')),
        map((accounts) => {
          this.accounts$.next({
            assets: accounts.filter((account) => account.type == 'trading'),
            counterAsset: accounts.filter(
              (account) => account.type == 'fiat'
            )[0]
          });

          this.initTradeForm();
        })
      )
      .subscribe();
  }

  getPriceList(): void {
    this.configService
      .getConfig$()
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap((config) => interval(config.refreshInterval)),
        startWith(0),
        switchMap(() => this.priceService.listPrices()),
        map((priceList) => {
          this.priceList$.next(priceList);
          this.evaluatePrice();
        })
      )
      .subscribe();
  }

  initTradeForm(): void {
    combineLatest([this.route.queryParams, this.accounts$])
      .pipe(
        take(1),
        map(([params, accounts]) => {
          const selectedAccount = params['code']
            ? <AccountBankModel>(
                accounts.assets.find(
                  (account) => account.asset == params['code']
                )
              )
            : accounts.assets[0];

          this.tradeFormGroup = new FormGroup<TradeFormGroup>({
            fiatAccount: new FormControl(accounts.counterAsset),
            tradingAccount: new FormControl(selectedAccount),
            amount: new FormControl(null, {
              validators: [
                Validators.min(0),
                Validators.pattern(
                  /^(0*[1-9][0-9]*(\.[0-9]+)?|0+\.[0-9]*[1-9][0-9]*)$/
                )
              ]
            })
          });

          this.getPriceList();
          this.evaluatePrice();

          this.maskTradeForm();
          this.validateTradeForm();
        })
      )
      .subscribe();

    this.tradeFormGroup.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.evaluatePrice());
  }

  evaluatePrice(): void {
    const symbol = symbolBuild(
      <string>this.tradeFormGroup.controls.tradingAccount.value?.asset,
      <string>this.tradeFormGroup.controls.fiatAccount.value?.asset
    );

    this.priceList$
      .pipe(
        take(1),
        map((priceList) => {
          // Get current amount. If null, set to 0
          const amount = this.tradeFormGroup.controls.amount.value
            ? this.tradeFormGroup.controls.amount.value
            : 0;
          const prices = this.filterPrices(priceList, symbol);

          if (prices)
            switch (this.input) {
              case 'trading': {
                const sidePrice =
                  this.side == 'buy'
                    ? Number(prices.sell_price)
                    : Number(prices.buy_price);
                this.price$.next({
                  base: sidePrice,
                  asset: amount,
                  counterAsset: amount * sidePrice
                });
                break;
              }
              case 'fiat': {
                const sidePrice =
                  this.side == 'buy'
                    ? Number(prices.buy_price)
                    : Number(prices.sell_price);
                let baseValue = Number(
                  this.assetFormatPipe.transform(
                    amount,
                    <string>(
                      this.tradeFormGroup.controls.fiatAccount.value?.asset
                    ),
                    'base'
                  )
                );
                this.price$.next({
                  base: sidePrice,
                  asset: baseValue / sidePrice,
                  counterAsset: baseValue
                });
                break;
              }
            }
        })
      )
      .subscribe();
  }

  maskTradeForm(): void {
    this.tradeFormGroup.controls.amount.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
        map((amount) => {
          if (this.input == TypeEnum.Fiat && amount?.toString().includes('.')) {
            this.tradeFormGroup.controls.amount.setValue(fiatMask(amount), {
              emitEvent: false,
              onlySelf: true
            });
          }
        })
      )
      .subscribe();
  }

  validateTradeForm(): void {
    // Activate validation before blur
    this.tradeFormGroup.controls.amount.markAsTouched();

    combineLatest([
      this.configService.getConfig$(),
      this.price$,
      this.accounts$
    ])
      .pipe(
        takeUntil(this.unsubscribe$),
        map(([config, price, accounts]) => {
          switch (this.side) {
            case 'buy': {
              if (
                price.asset !== 0 &&
                price.counterAsset >
                  Number(accounts.counterAsset.platform_available)
              )
                this.tradeFormGroup.controls.amount.setErrors({
                  insufficientFunds: true
                });
              break;
            }
            case 'sell': {
              if (
                price.asset !== 0 &&
                price.asset > this.getTradingPlatformAvailable(config)
              )
                this.tradeFormGroup.controls.amount.setErrors({
                  insufficientFunds: true
                });
            }
          }
        })
      )
      .subscribe();
  }

  // Check environment to bypass 'staging and sandbox' platform_available always being '0'
  getTradingPlatformAvailable(config: ComponentConfig): number {
    return config.environment == 'sandbox' || config.environment == 'staging'
      ? (this.assetFormatPipe.transform(
          this.tradeFormGroup.controls.tradingAccount.value?.platform_balance,
          <string>this.tradeFormGroup.controls.tradingAccount.value?.asset,
          'trade'
        ) as number)
      : (this.assetFormatPipe.transform(
          this.tradeFormGroup.controls.tradingAccount.value?.platform_available,
          <string>this.tradeFormGroup.controls.tradingAccount.value?.asset,
          'trade'
        ) as number);
  }

  onSwitchInput(): void {
    this.input == TypeEnum.Fiat
      ? (this.input = TypeEnum.Trading)
      : (this.input = TypeEnum.Fiat);

    // Trigger input masking
    this.tradeFormGroup.controls.amount.patchValue(
      this.tradeFormGroup.controls.amount.value
    );
  }

  onSwitchSide(): void {
    this.side == SideEnum.Buy
      ? (this.side = SideEnum.Sell)
      : (this.side = SideEnum.Buy);

    // Update validation
    this.tradeFormGroup.updateValueAndValidity();
  }

  isMaxDisabled(): boolean {
    return this.side === 'buy'
      ? this.input.includes(TypeEnum.Trading)
      : this.input.includes(TypeEnum.Fiat);
  }

  onSetMax(): void {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        map((config) => {
          return this.side === 'buy'
            ? this.tradeFormGroup.controls.amount.setValue(
                <number>(
                  this.assetFormatPipe.transform(
                    this.tradeFormGroup.controls.fiatAccount.value
                      ?.platform_available,
                    <string>(
                      this.tradeFormGroup.controls.fiatAccount.value?.asset
                    ),
                    'trade'
                  )
                )
              )
            : this.tradeFormGroup.controls.amount.setValue(
                this.getTradingPlatformAvailable(config)
              );
        })
      )
      .subscribe();
  }

  //TODO: Extend the quote service to take the asset code as a string instead of the model
  onTrade(): void {
    const asset = this.assetService.getAsset(
      <string>this.tradeFormGroup.controls.tradingAccount.value?.asset
    );
    const counterAsset = this.assetService.getAsset(
      <string>this.tradeFormGroup.controls.fiatAccount.value?.asset
    );

    const postQuoteBankModel: PostQuoteBankModel = this.quoteService.getQuote(
      <number>this.tradeFormGroup.controls.amount.value,
      this.input,
      this.side,
      asset,
      counterAsset
    );

    this.dialogRef = this.dialog.open(TradeConfirmComponent, {
      data: {
        model: postQuoteBankModel,
        asset: asset,
        counter_asset: counterAsset
      }
    });

    this.dialogRef
      .afterClosed()
      .pipe(
        map((tradeBankModel: TradeBankModel) => {
          if (tradeBankModel) {
            this.dialog.open(TradeSummaryComponent, {
              data: {
                model: tradeBankModel,
                asset: asset,
                counter_asset: counterAsset
              }
            });
          }
        })
      )
      .subscribe();
  }
}
