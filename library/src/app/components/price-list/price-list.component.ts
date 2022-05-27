import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  of,
  Subject,
  Subscription,
  switchMap,
  take,
  takeUntil,
  tap,
  timer
} from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { symbolSplit } from '../../../../../src/shared/utility/symbol-split';

// Services
import { AuthService } from '../../../../../src/shared/services/auth/auth.service';
import {
  AssetBankModel,
  PricesService,
  SymbolPriceBankModel
} from '@cybrid/cybrid-api-bank-angular';
import { FormControl } from '@angular/forms';
import {
  CODE,
  EventLog,
  EventService,
  LEVEL
} from '../../../../../src/shared/services/event/event.service';
import {
  ErrorLog,
  ErrorService
} from '../../../../../src/shared/services/error/error.service';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'price-list.component.html',
  styleUrls: ['price-list.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class PriceListComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input()
  set auth(token: string) {
    this.authService.setToken(token);
    if (this.refreshSub.closed) {
      this.getPrices();
    }
  }
  @Input()
  set hostConfig(config: ComponentConfig) {
    this.configService.setConfig(config);
  }
  @Output() eventLog = new EventEmitter<EventLog>();
  @Output() errorLog = new EventEmitter<ErrorLog>();
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
    private authService: AuthService,
    private pricesService: PricesService,
    private chdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initEventService();
    this.initErrorService();
    combineLatest([
      this.configService.getConfig$(),
      this.assetService.getAssets$()
    ])
      .pipe(
        take(1),
        tap(() => {
          this.eventLog.emit({
            level: LEVEL.INFO,
            code: CODE.COMPONENT_INIT,
            message: 'Initializing price list'
          });
          this.initFilterForm();
          this.getPrices();
          this.refreshData();
        }),
        catchError((err) => {
          this.eventService.handleEvent(
            LEVEL.FATAL,
            CODE.COMPONENT_ERROR,
            'Fatal error initializing price list'
          );
          this.errorService.handleError(
            new Error('Fatal error initializing price list')
          );
          return of(err);
        })
      )
      .subscribe();
  }

  ngAfterViewChecked(): void {
    this.dataSource.filterPredicate = this.filterPredicate;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  initEventService(): void {
    this.eventService
      .getEvent()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (event: EventLog) => {
          this.eventLog.emit(event);
        },
        error: (err: Error) => {
          this.eventLog.next({
            level: LEVEL.ERROR,
            code: CODE.SERVICE_ERROR,
            message: 'There was a failure initializing the Event service',
            data: err
          });
          this.errorService.handleError(err);
        }
      });
  }

  initErrorService(): void {
    this.errorService
      .getError()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (err: ErrorLog) => {
          this.errorLog.emit(err);
        },
        error: (err: Error) => {
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.SERVICE_ERROR,
            'There was a failure initializing the error service'
          );
          this.errorLog.emit({
            code: err.name,
            message: 'There was a failure initializing the error service',
            data: err
          });
        }
      });
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
