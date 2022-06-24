import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  PostTradeBankModel,
  QuoteBankModel,
  QuotesService,
  TradesService
} from '@cybrid/cybrid-api-bank-angular';
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
import {
  ComponentConfig,
  ConfigService
} from '../../../../../src/shared/services/config/config.service';
import {
  CODE,
  EventService,
  LEVEL
} from '../../../../../src/shared/services/event/event.service';
import { ErrorService } from '../../../../../src/shared/services/error/error.service';
import { Asset } from '../../../../../src/shared/services/asset/asset.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-trade-confirm',
  templateUrl: './trade-confirm.component.html',
  styleUrls: ['./trade-confirm.component.scss']
})
export class TradeConfirmComponent implements OnInit, OnDestroy {
  quote$: Subject<QuoteBankModel> = new Subject<QuoteBankModel>();
  asset: Asset = this.data.asset;
  counter_asset: Asset = this.data.counter_asset;
  refreshInterval = 0;

  postTradeBankModel: PostTradeBankModel = {
    quote_guid: ''
  };

  isRecoverable$ = new BehaviorSubject(true);
  unsubscribe$ = new Subject();
  refreshSub: Subscription = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TradeConfirmComponent>,
    private snackBar: MatSnackBar,
    public configService: ConfigService,
    private quotesService: QuotesService,
    private tradesService: TradesService,
    private eventService: EventService,
    private errorService: ErrorService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    this.getRefreshInterval();
    this.createQuote();
    this.refreshData();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  getRefreshInterval(): void {
    this.configService
      .getConfig$()
      .pipe(
        takeUntil(this.unsubscribe$),
        map((config) => (this.refreshInterval = config.refreshInterval))
      )
      .subscribe();
  }

  createQuote(): void {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.DATA_FETCHING,
      'Fetching quote...'
    );
    this.quotesService
      .createQuote(this.data.model)
      .pipe(
        map((quote) => {
          this.postTradeBankModel.quote_guid = quote.guid!;
          this.quote$.next(quote);
        }),
        catchError((err: any) => {
          const message = this.translatePipe.transform(
            'trade.confirm.error.quote'
          );
          this.snackBar.open(message, 'OK');
          this.refreshSub.unsubscribe();
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'Error fetching quote'
          );
          this.errorService.handleError(err);
          this.dialogRef.close();
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
            'Refreshing quote...'
          );
          this.createQuote();
        }
      });
  }

  onConfirmTrade(): void {
    this.tradesService
      .createTrade(this.postTradeBankModel)
      .pipe(
        map((trade) => {
          this.dialogRef.close(trade);
        }),
        catchError((err: any) => {
          const message = this.translatePipe.transform(
            'trade.confirm.error.trade'
          );
          this.snackBar.open(message, undefined, {
            duration: 3000
          });
          this.refreshSub.unsubscribe();
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'Error confirming trade'
          );
          this.errorService.handleError(err);
          this.dialogRef.close();
          return of(err);
        })
      )
      .subscribe();
  }
}
