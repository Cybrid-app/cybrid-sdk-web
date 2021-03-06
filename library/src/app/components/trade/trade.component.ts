import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  PostQuoteBankModel,
  PricesService,
  SymbolPriceBankModel,
  TradeBankModel
} from '@cybrid/cybrid-api-bank-angular';
import {
  BehaviorSubject,
  catchError,
  map,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  timer
} from 'rxjs';
import {
  CODE,
  EventService,
  LEVEL
} from '../../../../../src/shared/services/event/event.service';
import { ErrorService } from '../../../../../src/shared/services/error/error.service';
import {
  ComponentConfig,
  ConfigService
} from '../../../../../src/shared/services/config/config.service';
import {
  Asset,
  AssetService
} from '../../../../../src/shared/services/asset/asset.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AssetPipe } from '../../../../../src/shared/pipes/asset/asset.pipe';
import { compareObjects } from '../../../../../src/shared/utility/compare-object';
import { symbolSplit } from '../../../../../src/shared/utility/symbol-split';
import { symbolBuild } from '../../../../../src/shared/utility/symbol-build';
import { QuoteService } from '../../../../../src/shared/services/quote/quote.service';
import { TradeConfirmComponent } from '../trade-confirm/trade-confirm.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TradeSummaryComponent } from '../trade-summary/trade-summary.component';
import { Constants } from '../../../../../src/shared/constants/constants';
import SideEnum = PostQuoteBankModel.SideEnum;
import { RoutingService } from '../../../../../src/shared/services/routing/routing.service';

interface Display {
  asset: number | string;
  counter_asset: number | string;
}

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss']
})
export class TradeComponent implements OnInit, OnDestroy {
  compareObjects = compareObjects;

  asset: Asset = Constants.BTC_ASSET;
  counterAsset: Asset = Constants.USD_ASSET;
  cryptoAssets!: Asset[];
  fiatAssets!: Asset[];

  side: SideEnum = SideEnum.Buy;
  input: 'asset' | 'counter_asset' = 'asset';
  amount: number = 0;
  price: SymbolPriceBankModel = {};

  quote$: Subject<PostQuoteBankModel> = new Subject<PostQuoteBankModel>();

  quoteGroup: FormGroup = new FormGroup({
    asset: new FormControl(),
    amount: new FormControl()
  });

  display: Display = {
    asset: 0,
    counter_asset: 0
  };

  dialogRef!: MatDialogRef<TradeConfirmComponent>;

  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  unsubscribe$ = new Subject();

  constructor(
    private errorService: ErrorService,
    private eventService: EventService,
    private assetService: AssetService,
    public configService: ConfigService,
    private routingService: RoutingService,
    private quoteService: QuoteService,
    private pricesService: PricesService,
    public dialog: MatDialog,
    private assetPipe: AssetPipe,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.COMPONENT_INIT,
      'Initializing trade component'
    );
    this.getAssets();
    this.initQuoteGroup();
    this.getPrice();
    this.refreshData();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  /*
  Set the current asset and counter-asset from routing data.
  Set the list of available crypto and fiat assets.
  * */
  getAssets(): void {
    this.route.queryParams
      .pipe(
        take(1),
        map((params) => {
          this.asset = this.assetService.getAsset(
            symbolSplit(params['symbol_pair'])[0]
          );
          this.counterAsset = this.assetService.getAsset(
            symbolSplit(params['symbol_pair'])[1]
          );
        })
      )
      .subscribe();

    this.assetService
      .getAssets$()
      .pipe(
        take(1),
        map((assets: Asset[]) => {
          this.cryptoAssets = assets.filter((asset) => {
            return asset.type == 'crypto';
          });
          /*
          Filtering here on the counterAsset supplied by the price-list.
          This is assuming a single fiat account for the customer for now.
          * */
          this.fiatAssets = assets.filter((asset) => {
            return asset.code == this.counterAsset.code;
          });
        })
      )
      .subscribe();
  }

  initQuoteGroup(): void {
    this.quoteGroup.patchValue({
      asset: this.assetService.getAsset(this.asset.code)
    });
    this.quoteGroup.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.asset = value.asset;
        this.amount = value.amount;
        this.getPrice();
      });
  }

  /*
  Set the price passed to the quote service.
  Format the displayed data.
  * */
  getPrice(): void {
    this.pricesService
      .listPrices(symbolBuild(this.asset.code, this.counterAsset.code))
      .pipe(
        map((priceArray) => {
          this.price = priceArray[0];

          // Set amount to 0 if null
          const amount = this.quoteGroup.get('amount')?.value;
          if (amount == null) {
            this.amount = 0;
          }

          switch (this.input) {
            case 'asset': {
              const sidePrice =
                this.side == 'buy'
                  ? Number(this.price.sell_price)
                  : Number(this.price.buy_price);
              this.display.asset = this.amount;
              this.display.counter_asset = this.amount * sidePrice!;
              break;
            }
            case 'counter_asset': {
              const sidePrice =
                this.side == 'buy'
                  ? Number(this.price.buy_price)
                  : Number(this.price.sell_price);
              let baseValue = this.assetPipe.transform(
                this.amount,
                this.counterAsset,
                'base'
              ) as number;
              this.display.asset = baseValue / sidePrice!;
              this.display.counter_asset = baseValue;
              break;
            }
          }
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
      .subscribe(() => {
        this.isLoading$.next(false);
      });
  }

  refreshData(): void {
    this.configService
      .getConfig$()
      .pipe(
        switchMap((cfg: ComponentConfig) => {
          return timer(cfg.refreshInterval, cfg.refreshInterval);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe({
        next: () => {
          this.eventService.handleEvent(
            LEVEL.INFO,
            CODE.DATA_FETCHING,
            'Refreshing price...'
          );
          this.getPrice();
        }
      });
  }

  onSwitchInput(): void {
    switch (this.input) {
      case 'asset': {
        this.input = 'counter_asset';
        break;
      }
      case 'counter_asset': {
        this.input = 'asset';
        break;
      }
    }
    this.getPrice();
  }

  onSwitchSide(tab: number | null): void {
    switch (tab) {
      case -1: {
        this.side = SideEnum.Buy;
        break;
      }
      case 1: {
        this.side = SideEnum.Sell;
        break;
      }
    }
    this.getPrice();
  }

  onTrade(): void {
    const postQuoteBankModel: PostQuoteBankModel = this.quoteService.getQuote(
      this.amount,
      this.input,
      this.side,
      this.asset,
      this.counterAsset
    );

    this.dialogRef = this.dialog.open(TradeConfirmComponent, {
      data: {
        model: postQuoteBankModel,
        asset: this.asset,
        counter_asset: this.counterAsset
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
                asset: this.asset,
                counter_asset: this.counterAsset
              }
            });
          }
        })
      )
      .subscribe();
  }

  onBack(): void {
    this.routingService.handleRoute('price-list', 'trade');
  }
}
