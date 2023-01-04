import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  of,
  ReplaySubject,
  Subject,
  switchMap,
  take,
  takeUntil,
  timer
} from 'rxjs';

// Client
import {
  AccountBankModel,
  PostQuoteBankModel,
  PricesService,
  QuoteBankModel,
  SymbolPriceBankModel,
  TradeBankModel
} from '@cybrid/cybrid-api-bank-angular';
import SideEnum = QuoteBankModel.SideEnum;
import TypeEnum = AccountBankModel.TypeEnum;

// Services
import { TestAccountsService } from '../../../../shared/services/test-accounts/test-accounts.service';

// Utility
import { symbolBuild, fiatMask } from '@utility';
import { AssetFormatPipe, AssetPipe } from '@pipes';
import {
  AssetService,
  CODE,
  ComponentConfig,
  ConfigService,
  ErrorService,
  EventService,
  LEVEL,
  QuoteService,
  RoutingData
} from '@services';
import { TradeConfirmComponent, TradeSummaryComponent } from '@components';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

interface TradeFormGroup {
  tradingAccount: FormControl<AccountBankModel | null>;
  fiatAccount: FormControl<AccountBankModel | null>;
  amount: FormControl<number | null>;
}

interface Price {
  basePrice: number;
  tradingAccount: number;
  fiatAccount: number;
}

interface Accounts {
  tradingAccounts: AccountBankModel[];
  fiatAccount: AccountBankModel;
}

interface TradeData {
  accounts: Accounts;
  price: Price;
}

@Component({
  selector: 'app-test-trade',
  templateUrl: './test-trade.component.html',
  styleUrls: ['./test-trade.component.scss']
})
export class TestTradeComponent implements OnInit, OnDestroy {
  accounts$ = new ReplaySubject<Accounts>(1);
  price$ = new ReplaySubject<Price>(1);
  priceList$ = new ReplaySubject<SymbolPriceBankModel>(1);
  tradeData$ = new ReplaySubject<TradeData>(1);

  tradeFormGroup!: FormGroup<TradeFormGroup>;
  side: SideEnum = SideEnum.Buy;
  input: TypeEnum = TypeEnum.Trading;

  routingData: RoutingData = {
    route: 'price-list',
    origin: 'trade'
  };

  dialogRef!: MatDialogRef<TradeConfirmComponent>;

  isLoading$ = new BehaviorSubject(true);
  unsubscribe$ = new Subject();

  constructor(
    private errorService: ErrorService,
    private eventService: EventService,
    private configService: ConfigService,
    private testAccountsService: TestAccountsService,
    private pricesService: PricesService,
    public dialog: MatDialog,
    private quoteService: QuoteService,
    private assetService: AssetService,
    private assetFormatPipe: AssetFormatPipe,
    private assetPipe: AssetPipe,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getAccountList();
    this.refreshPrice();

    combineLatest([this.accounts$, this.price$])
      .pipe(
        map(([accounts, price]) => {
          this.tradeData$.next({
            accounts,
            price
          });
          this.isLoading$.next(false);
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  getAccountList(): void {
    this.testAccountsService
      .listAccounts()
      .pipe(
        map((list) =>
          list.objects.filter((account) => account.state == 'created')
        ),
        map((accounts) => {
          const fiatAccount = accounts.filter(
            (account) => account.type == 'fiat'
          )[0];

          this.accounts$.next({
            tradingAccounts: accounts.filter(
              (account) => account.type == 'trading'
            ),
            fiatAccount: fiatAccount
          });

          this.initTradeForm();
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
                accounts.tradingAccounts.find(
                  (account) => account.asset == params['code']
                )
              )
            : accounts.tradingAccounts[0];

          this.tradeFormGroup = new FormGroup<TradeFormGroup>({
            fiatAccount: new FormControl(accounts.fiatAccount),
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
      .pipe(
        map(() => {
          this.evaluatePrice();
        })
      )
      .subscribe();
  }

  getPriceList(): void {
    const symbol = symbolBuild(
      <string>this.tradeFormGroup.controls.tradingAccount.value?.asset,
      <string>this.tradeFormGroup.controls.fiatAccount.value?.asset
    );

    this.pricesService
      .listPrices(symbol)
      .pipe(
        map((priceList) => {
          this.priceList$.next(priceList[0]);
          this.evaluatePrice();

          this.eventService.handleEvent(
            LEVEL.INFO,
            CODE.DATA_REFRESHED,
            'Price successfully updated'
          );
        }),
        catchError((err) => {
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'There was an error fetching price'
          );
          this.errorService.handleError(
            new Error('There was an error fetching price')
          );
          return of(err);
        })
      )
      .subscribe();
  }

  /**
   * Evaluates the current price based on input and side.
   **/
  evaluatePrice(): void {
    this.priceList$
      .pipe(
        take(1),
        map((priceList) => {
          let price: Price = {
            basePrice: 0,
            tradingAccount: 0,
            fiatAccount: 0
          };

          // Get current amount. If null, set to 0
          const amount = this.tradeFormGroup.controls.amount.value
            ? this.tradeFormGroup.controls.amount.value
            : 0;

          switch (this.input) {
            case 'trading': {
              const sidePrice =
                this.side == 'buy'
                  ? Number(priceList.sell_price)
                  : Number(priceList.buy_price);
              price.basePrice = sidePrice;
              price.tradingAccount = amount;
              price.fiatAccount = amount * sidePrice;
              break;
            }
            case 'fiat': {
              const sidePrice =
                this.side == 'buy'
                  ? Number(priceList.buy_price)
                  : Number(priceList.sell_price);
              let baseValue = Number(
                this.assetFormatPipe.transform(
                  amount,
                  <string>this.tradeFormGroup.controls.fiatAccount.value?.asset,
                  'base'
                )
              );
              price.basePrice = sidePrice;
              price.tradingAccount = baseValue / sidePrice;
              price.fiatAccount = baseValue;
              break;
            }
          }
          this.price$.next(price);
          console.log('price: ', price);
        })
      )
      .subscribe();
  }

  refreshPrice(): void {
    this.configService
      .getConfig$()
      .pipe(
        switchMap((cfg: ComponentConfig) => {
          return timer(cfg.refreshInterval, cfg.refreshInterval);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.eventService.handleEvent(
          LEVEL.INFO,
          CODE.DATA_FETCHING,
          'Refreshing price...'
        );
        this.getPriceList();
      });
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
    // Activates validation before blur
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
                price.tradingAccount !== 0 &&
                price.fiatAccount >
                  Number(accounts.fiatAccount.platform_available)
              )
                this.tradeFormGroup.controls.amount.setErrors({
                  insufficientFunds: true
                });
              break;
            }
            case 'sell': {
              // Check environment to bypass 'demo' platform_available always being '0'
              const platformAvailable = () =>
                config.environment == 'demo'
                  ? (this.assetFormatPipe.transform(
                      this.tradeFormGroup.controls.tradingAccount.value
                        ?.platform_balance,
                      <string>(
                        this.tradeFormGroup.controls.tradingAccount.value?.asset
                      )
                    ) as Number)
                  : (this.assetFormatPipe.transform(
                      this.tradeFormGroup.controls.tradingAccount.value
                        ?.platform_available,
                      <string>(
                        this.tradeFormGroup.controls.tradingAccount.value?.asset
                      )
                    ) as Number);

              if (
                price.tradingAccount !== 0 &&
                price.tradingAccount > platformAvailable()
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

  onSwitchInput(): void {
    this.input == TypeEnum.Fiat
      ? (this.input = TypeEnum.Trading)
      : (this.input = TypeEnum.Fiat);

    this.evaluatePrice();
    this.tradeFormGroup.updateValueAndValidity();
  }

  onSwitchSide(): void {
    this.side == SideEnum.Buy
      ? (this.side = SideEnum.Sell)
      : (this.side = SideEnum.Buy);

    // TODO: Get the whole price list on getPriceList() so we can immediately update on side switch
    this.getPriceList();
    this.tradeFormGroup.updateValueAndValidity();
  }

  onTrade(): void {
    //TODO: Extend the quote service to take the asset code as a string instead of the model
    const tradingAsset = this.assetService.getAsset(
      <string>this.tradeFormGroup.controls.tradingAccount.value?.asset
    );
    const fiatAsset = this.assetService.getAsset(
      <string>this.tradeFormGroup.controls.fiatAccount.value?.asset
    );

    const postQuoteBankModel: PostQuoteBankModel = this.quoteService.getQuote(
      <number>this.tradeFormGroup.controls.amount.value,
      this.input,
      this.side,
      tradingAsset,
      fiatAsset
    );

    this.dialogRef = this.dialog.open(TradeConfirmComponent, {
      data: {
        model: postQuoteBankModel,
        asset: tradingAsset,
        counter_asset: fiatAsset
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
                asset: tradingAsset,
                counter_asset: fiatAsset
              }
            });
          }
        })
      )
      .subscribe();
  }
}
