import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  timer
} from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { symbolSplit } from '../../../../../src/shared/utility/symbol-split';

// Services
import {
  AssetBankModel,
  PricesService,
  SymbolPriceBankModel
} from '@cybrid/cybrid-api-bank-angular';
import { FormControl } from '@angular/forms';
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
import { Constants } from '../../../../../src/shared/constants/constants';

export interface SymbolPrice extends SymbolPriceBankModel {
  asset: AssetBankModel;
  counter_asset: AssetBankModel;
  icon_url: string;
}

@Component({
  selector: 'app-list',
  templateUrl: 'price-list.component.html',
  styleUrls: ['price-list.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceListComponent implements OnInit, AfterViewChecked, OnDestroy {
  config$ = this.configService.getConfig$();
  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  refreshSub: Subscription = new Subscription();
  private unsubscribe$ = new Subject();

  dataSource: MatTableDataSource<SymbolPrice> = new MatTableDataSource();
  displayedColumns: string[] = ['symbol', 'price'];
  filterControl: FormControl = new FormControl();
  getPricesError = false;

  constructor(
    private errorService: ErrorService,
    private eventService: EventService,
    public configService: ConfigService,
    private assetService: AssetService,
    private pricesService: PricesService,
    private chdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.COMPONENT_INIT,
      'Initializing price list'
    );
    this.initFilterForm();
    this.getPrices();
    this.refreshData();
  }

  ngAfterViewChecked(): void {
    this.dataSource.filterPredicate = this.filterPredicate;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  initFilterForm(): void {
    this.filterControl = new FormControl();
    this.filterControl.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (value: string) => {
          this.dataSource.filter = value.toLowerCase();
        }
      });
  }

  filterPredicate(data: SymbolPrice, filter: string): boolean {
    return (
      data.asset.name.toLowerCase().indexOf(filter) != -1 ||
      data.asset.code.toLowerCase().indexOf(filter) != -1
    );
  }

  getPrices(): void {
    this.pricesService
      .listPrices()
      .pipe(
        takeUntil(this.unsubscribe$),
        map((list) => {
          if (this.refreshSub.closed) {
            this.refreshData();
          }
          this.isLoading$.next(false);
          const data: Array<SymbolPrice> = [];
          list.forEach((model) => {
            if (model.symbol) {
              const [asset, counter_asset] = symbolSplit(model.symbol);
              const symbol: SymbolPrice = {
                asset: this.assetService.getAsset(asset),
                counter_asset: this.assetService.getAsset(counter_asset),
                icon_url:
                  Constants.ICON_HOST + asset.toString().toLowerCase() + '.svg',
                symbol: model.symbol,
                buy_price: model.buy_price,
                sell_price: model.sell_price,
                buy_price_last_updated_at: model.buy_price_last_updated_at,
                sell_price_last_updated_at: model.sell_price_last_updated_at
              };
              data.push(symbol);
            }
          });
          this.eventService.handleEvent(
            LEVEL.INFO,
            CODE.DATA_REFRESHED,
            'Price list successfully updated'
          );
          this.dataSource.data = data;
          this.getPricesError = false;
        }),
        catchError((err) => {
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'There was an error fetching price list'
          );
          this.errorService.handleError(
            new Error('There was an error fetching price list')
          );
          this.refreshSub.unsubscribe();
          this.dataSource.data = [];
          this.getPricesError = true;
          this.chdRef.detectChanges();
          return of(err);
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
            'Refreshing price list...'
          );
          this.getPrices();
        }
      });
  }
}
