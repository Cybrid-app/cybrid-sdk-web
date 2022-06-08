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
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '../../../../../src/shared/constants/constants';
import { AssetPipe } from '../../../../../src/shared/pipes/asset.pipe';
import { compareObjects } from '../../../../../src/shared/utility/compare-object';
import { symbolSplit } from '../../../../../src/shared/utility/symbol-split';
import { symbolBuild } from '../../../../../src/shared/utility/symbol-build';
import { TradeBankModel } from '@cybrid/cybrid-api-bank-angular/model/trade';
import SideEnum = PostQuoteBankModel.SideEnum;

interface Quote {
  asset: AssetBankModel;
  amount: string;
  value: string;
}

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradeComponent implements OnInit, OnDestroy {
  assetList: AssetBankModel[] = [];
  price$ = new BehaviorSubject<string>('0');
  price!: SymbolPriceBankModel;
  assetPipe: AssetPipe = new AssetPipe(this.configService);
  filteredAssetList: AssetBankModel[] = [];
  symbolPrice: SymbolPriceBankModel = {};

  quoteGroup: FormGroup = new FormGroup({
    asset: new FormControl(),
    amount: new FormControl()
  });

  quote: Quote = {
    asset: Constants.ASSET,
    amount: '0',
    value: '0'
  };

  counterAssetCode = Constants.COUNTER_ASSET.code;
  counterAsset: AssetBankModel = Constants.COUNTER_ASSET;

  side: TradeBankModel.SideEnum = SideEnum.Buy;
  input: AssetBankModel.TypeEnum = 'fiat';

  compareObjects = compareObjects;
  quote$ = new BehaviorSubject<Quote>(this.quote);

  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  unsubscribe$ = new Subject();
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
    this.isLoading$.next(true);
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

  getPrice(): void {
    this.pricesService
      .listPrices(symbolBuild(this.quote.asset.code, this.counterAsset.code))
      .pipe(
        map((priceArray) => {
          this.price = priceArray[0];
          const buyPrice = priceArray[0].buy_price!;
          let amount = this.quoteGroup.get('amount')?.value;
          switch (this.input) {
            case 'fiat': {
              this.quote.amount = amount;
              this.quote.value = (amount * buyPrice).toString();
              this.quote$.next(this.quote);
              break;
            }
            case 'crypto': {
              let baseValue = this.assetPipe.transform(
                amount,
                this.counterAsset,
                'base'
              ) as number;
              this.quote.amount = (baseValue / buyPrice).toString();
              this.quote.value = baseValue.toString();
              this.quote$.next(this.quote);
            }
          }
        })
      )
      .subscribe(() => {
        console.log(this.quote);
        this.isLoading$.next(false);
      });
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
            'Refreshing quote price...'
          );
          this.getPrice();
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
          this.quote.asset = JSON.parse(params['asset']);
          this.counterAssetCode = symbolSplit(params['symbol_pair'])[1];
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
      .subscribe(() => {
        this.getPrice();
      });
    this.quoteGroup
      .get('asset')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((asset: AssetBankModel) => {
        this.quote.asset = asset;
      });
  }

  onSwitchInput(): void {
    switch (this.input) {
      case 'fiat': {
        this.input = 'crypto';
        this.quoteGroup.patchValue({
          amount: this.quote.amount
        });
        break;
      }
      case 'crypto': {
        this.input = 'fiat';
        const value = this.assetPipe.transform(
          this.quote.value,
          this.counterAsset,
          'display'
        ) as number;
        this.quoteGroup.get('amount')?.patchValue(value);
        break;
      }
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }
}
