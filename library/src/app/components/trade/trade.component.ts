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
  Subject,
  BehaviorSubject,
  map,
  takeUntil,
  switchMap,
  timer,
  Subscription,
  take
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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '../../../../../src/shared/constants/constants';
import { compareObjects } from '../../../../../src/shared/utility/compare-object';
import { symbolSplit } from '../../../../../src/shared/utility/symbol-split';
import { symbolBuild } from '../../../../../src/shared/utility/symbol-build';
import { TradeBankModel } from '@cybrid/cybrid-api-bank-angular/model/trade';
import SideEnum = PostQuoteBankModel.SideEnum;

interface Trade {
  asset: AssetBankModel;
  quantity: number;
}

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradeComponent implements OnInit, OnDestroy {
  assetList: AssetBankModel[] = [];
  filteredAssetList: AssetBankModel[] = [];
  asset = Constants.ASSET;
  price$ = new BehaviorSubject<string | number>(0);
  symbolPrice: SymbolPriceBankModel = {};
  quoteGroup: FormGroup = new FormGroup({
    asset: new FormControl(this.asset, Validators.required),
    quantity: new FormControl(0, Validators.required)
  });
  counterAssetCode = Constants.COUNTER_ASSET.code;
  counterAsset: AssetBankModel = Constants.COUNTER_ASSET;
  type: TradeBankModel.SideEnum = SideEnum.Buy;
  trade: Trade = {
    asset: Constants.ASSET,
    quantity: 0
  };
  compareObjects = compareObjects;

  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  private unsubscribe$ = new Subject();
  refreshSub: Subscription = new Subscription();

  constructor(
    private errorService: ErrorService,
    private eventService: EventService,
    private assetService: AssetService,
    public configService: ConfigService,
    private pricesService: PricesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.isLoading$.next(false);
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.COMPONENT_INIT,
      'Initializing trade component'
    );
    this.getRouterParams();
    this.getAssets();
    this.initQuoteGroup();
    this.refreshData();
  }

  getPrice(trade: Trade): void {
    this.pricesService
      .listPrices(symbolBuild(trade.asset.code, this.counterAsset.code))
      .pipe(
        map((priceArray) => {
          const buyPrice = priceArray[0].buy_price;
          const sellPrice = priceArray[0].sell_price;
          if (this.type == 'buy') {
            this.price$.next(trade.quantity * buyPrice!);
          } else {
            this.price$.next(trade.quantity * sellPrice!);
          }
        })
      )
      .subscribe();
  }

  refreshData(): void {
    this.refreshSub = this.configService
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
            'Refreshing trade price...'
          );
          this.getPrice(this.trade);
        }
      });
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
          this.counterAsset = this.assetList.filter((asset) => {
            return asset.code == this.counterAssetCode;
          })[0];
        })
      )
      .subscribe();
  }

  getRouterParams(): void {
    this.route.queryParams
      .pipe(
        takeUntil(this.unsubscribe$),
        map((params) => {
          this.asset = JSON.parse(params['asset']);
          this.counterAssetCode = symbolSplit(params['symbol_pair'])[1];
        })
      )
      .subscribe();
  }

  initQuoteGroup(): void {
    this.quoteGroup.patchValue({
      asset: this.asset
    });
    this.quoteGroup.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
        map((value: any) => {
          if (value.asset && value.quantity) {
            this.getPrice(value);
            this.trade = value;
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }
}
