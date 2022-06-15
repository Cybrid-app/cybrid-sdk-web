import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AssetBankModel,
  CustomersService,
  PostQuoteBankModel,
  PricesService,
  SymbolPriceBankModel
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
import { AssetPipe } from '../../../../../src/shared/pipes/asset.pipe';
import { compareObjects } from '../../../../../src/shared/utility/compare-object';
import { symbolSplit } from '../../../../../src/shared/utility/symbol-split';
import { symbolBuild } from '../../../../../src/shared/utility/symbol-build';
import SideEnum = PostQuoteBankModel.SideEnum;
import { MatDialog } from '@angular/material/dialog';
import { TradeQuoteComponent } from './trade-quote/trade-quote.component';
import { Constants } from '../../../../../src/shared/constants/constants';

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss']
})
export class TradeComponent implements OnInit, OnDestroy {
  compareObjects = compareObjects;

  cryptoAssets!: Asset[];
  fiatAssets!: Asset[];

  price: SymbolPriceBankModel = {};

  quoteGroup: FormGroup = new FormGroup({
    asset: new FormControl(),
    amount: new FormControl()
  });

  postQuoteBankModel: PostQuoteBankModel = {
    customer_guid: '',
    symbol: '',
    side: PostQuoteBankModel.SideEnum.Buy
  };

  display = {
    amount: 0,
    value: 0
  };

  usd_icon = Constants.USD_ICON;
  cad_icon = Constants.CAD_ICON;

  input: 'receive_amount' | 'deliver_amount' = 'receive_amount';
  asset!: AssetBankModel;
  counterAsset!: AssetBankModel;

  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  unsubscribe$ = new Subject();

  constructor(
    private errorService: ErrorService,
    private eventService: EventService,
    private assetService: AssetService,
    public configService: ConfigService,
    private pricesService: PricesService,
    private customerService: CustomersService,
    private assetPipe: AssetPipe,
    public dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.COMPONENT_INIT,
      'Initializing trade component'
    );
    this.getCustomer();
    this.getSymbol();
    this.getAssets();
    this.initQuoteGroup();
    this.getPrice();
    this.refreshData();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  getCustomer(): void {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        map((config: ComponentConfig) => {
          this.postQuoteBankModel.customer_guid = config.customer;
        })
      )
      .subscribe();
  }

  getSymbol(): void {
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
          this.postQuoteBankModel.symbol = params['symbol_pair'];
        })
      )
      .subscribe();
  }

  getAssets(): void {
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
        if (this.input == 'receive_amount') {
          this.asset = value.asset;
          this.postQuoteBankModel.symbol = symbolBuild(
            value.asset.code,
            this.counterAsset.code
          );
        }
        this.formatAmount(value.amount);
        this.getPrice();
      });
  }

  getPrice(): void {
    this.pricesService
      .listPrices(symbolBuild(this.asset.code, this.counterAsset.code))
      .pipe(
        map((priceArray) => {
          this.price = priceArray[0];

          const amount = this.quoteGroup.get('amount')!.value;
          const sidePrice =
            this.postQuoteBankModel.side == 'buy'
              ? this.price.buy_price
              : this.price.sell_price;

          switch (this.input) {
            case 'receive_amount': {
              this.display.amount = amount;
              this.display.value = amount * sidePrice!;
              break;
            }
            case 'deliver_amount': {
              let baseValue = this.assetPipe.transform(
                amount,
                this.counterAsset,
                'base'
              ) as number;
              this.display.amount = baseValue / sidePrice!;
              this.display.value = baseValue;
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

  formatAmount(amount: number | undefined): void {
    if (amount) {
      switch (this.input) {
        case 'receive_amount':
          delete this.postQuoteBankModel.deliver_amount;
          if (this.postQuoteBankModel.side == 'buy') {
            this.postQuoteBankModel.receive_amount = this.assetPipe.transform(
              amount,
              this.asset,
              'base'
            ) as number;
          } else {
            this.postQuoteBankModel.receive_amount =
              amount * this.price.sell_price!;
          }
          break;
        case 'deliver_amount': {
          delete this.postQuoteBankModel.receive_amount;
          if (this.postQuoteBankModel.side == 'buy') {
            this.postQuoteBankModel.deliver_amount = this.assetPipe.transform(
              amount,
              this.counterAsset,
              'base'
            ) as number;
          } else {
            const value = this.assetPipe.transform(
              amount,
              this.counterAsset,
              'base'
            ) as number;
            this.postQuoteBankModel.deliver_amount =
              value / this.price.sell_price!;
          }
          break;
        }
      }
    } else {
      delete this.postQuoteBankModel.deliver_amount;
      delete this.postQuoteBankModel.receive_amount;
    }
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

  /*
  Switch between input field modes based off the postQuoteBankModel.
  * */
  onSwitchInput(): void {
    const amount = this.quoteGroup.get('amount')!;
    switch (this.input) {
      case 'deliver_amount': {
        this.input = 'receive_amount';
        this.quoteGroup.patchValue({ asset: this.asset });
        if (amount.value) {
          delete this.postQuoteBankModel.deliver_amount;
          this.postQuoteBankModel.receive_amount = this.assetPipe.transform(
            amount.value,
            this.asset,
            'base'
          ) as number;
        }
        break;
      }
      case 'receive_amount': {
        this.input = 'deliver_amount';
        this.quoteGroup.patchValue({ asset: this.counterAsset });
        if (amount.value) {
          delete this.postQuoteBankModel.receive_amount;
          this.postQuoteBankModel.deliver_amount = this.assetPipe.transform(
            amount.value,
            this.counterAsset,
            'base'
          ) as number;
        }
        break;
      }
    }
    this.getPrice();
  }

  /*
  Switch between 'sides'. Prices differ between 'buy' and 'sell'.
  * */
  onSwitchSide(tab: string): void {
    const amount = this.quoteGroup.get('amount')!.value;
    switch (tab) {
      case 'Buy': {
        this.postQuoteBankModel.side = SideEnum.Buy;
        break;
      }
      case 'Sell': {
        this.postQuoteBankModel.side = SideEnum.Sell;
        break;
      }
    }
    this.formatAmount(amount);
    this.getPrice();
  }

  onTrade(): void {
    this.dialog.open(TradeQuoteComponent, {
      data: this.postQuoteBankModel
    });
  }
}
