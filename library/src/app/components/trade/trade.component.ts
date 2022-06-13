import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  AssetBankModel,
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
import { AssetService } from '../../../../../src/shared/services/asset/asset.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '../../../../../src/shared/constants/constants';
import { AssetPipe } from '../../../../../src/shared/pipes/asset.pipe';
import { compareObjects } from '../../../../../src/shared/utility/compare-object';
import { symbolSplit } from '../../../../../src/shared/utility/symbol-split';
import { symbolBuild } from '../../../../../src/shared/utility/symbol-build';
import SideEnum = PostQuoteBankModel.SideEnum;

interface Quote {
  asset: AssetBankModel;
  counterAsset: AssetBankModel;
  amount: number;
  value: number;
  side: SideEnum;
}

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradeComponent implements OnInit, OnDestroy {
  compareObjects = compareObjects;

  assetList: AssetBankModel[] = [];
  filteredAssetList: AssetBankModel[] = [];

  price: SymbolPriceBankModel = {};

  quoteGroup: FormGroup = new FormGroup({
    asset: new FormControl(),
    amount: new FormControl()
  });

  quote: Quote = {
    asset: Constants.ASSET,
    counterAsset: Constants.COUNTER_ASSET,
    amount: 0,
    value: 0,
    side: SideEnum.Buy
  };

  input: AssetBankModel.TypeEnum = 'fiat';

  quote$ = new BehaviorSubject<Quote>(this.quote);

  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  unsubscribe$ = new Subject();

  constructor(
    private errorService: ErrorService,
    private eventService: EventService,
    private assetService: AssetService,
    public configService: ConfigService,
    private pricesService: PricesService,
    private assetPipe: AssetPipe,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.COMPONENT_INIT,
      'Initializing trade component'
    );
    this.getRouterParams();
    this.getAssets();
    this.initQuoteGroup();
    this.getPrice();
    this.refreshData();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  getRouterParams(): void {
    this.route.queryParams
      .pipe(
        takeUntil(this.unsubscribe$),
        map((params) => {
          this.quote.asset = JSON.parse(params['asset']);
          this.quote.counterAsset.code = symbolSplit(params['symbol_pair'])[1];
        })
      )
      .subscribe();
  }

  getAssets(): void {
    this.assetService
      .getAssets$()
      .pipe(
        take(1),
        map((assets) => {
          this.assetList = assets;
          this.filteredAssetList = assets.filter((asset) => {
            return asset.type == 'crypto';
          });
          this.quote.counterAsset = this.assetList.filter((asset) => {
            return asset.code == this.quote.counterAsset.code;
          })[0];
        })
      )
      .subscribe();
  }

  initQuoteGroup(): void {
    this.quoteGroup.patchValue({
      asset: this.quote.asset
    });
    this.quoteGroup.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.quote.asset = value.asset;
        this.getPrice();
      });
  }

  getPrice(): void {
    this.pricesService
      .listPrices(
        symbolBuild(this.quote.asset.code, this.quote.counterAsset.code)
      )
      .pipe(
        map((priceArray) => {
          this.price = priceArray[0];
          const buyPrice = priceArray[0].buy_price!;
          const amount = this.quoteGroup.get('amount')!.value;
          switch (this.input) {
            case 'fiat': {
              this.quote.amount = amount;
              this.quote.value = amount * buyPrice;
              this.quote$.next(this.quote);
              break;
            }
            case 'crypto': {
              let baseValue = this.assetPipe.transform(
                amount,
                this.quote.counterAsset,
                'base'
              ) as number;
              this.quote.amount = baseValue / buyPrice;
              this.quote.value = baseValue;
              this.quote$.next(this.quote);
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
    const amount = this.quoteGroup.get('amount');
    switch (this.input) {
      case 'fiat': {
        this.input = 'crypto';
        if (amount!.value) {
          amount!.patchValue(this.quote.amount);
        }
        break;
      }
      case 'crypto': {
        this.input = 'fiat';
        if (amount!.value) {
          const displayValue = this.assetPipe.transform(
            this.quote.value,
            this.quote.counterAsset,
            'trade'
          );
          amount!.patchValue(displayValue);
        }
        break;
      }
    }
  }

  onSwitchSide(tab: string): void {
    switch (tab) {
      case 'Buy': {
        this.quote.side = 'buy';
        break;
      }
      case 'Sell': {
        this.quote.side = 'sell';
        break;
      }
    }
  }
}
