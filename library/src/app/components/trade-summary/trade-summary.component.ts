import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BehaviorSubject, catchError, map, of, Subject } from 'rxjs';

// Client
import { TradeBankModel, TradesService } from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  ConfigService,
  EventService,
  CODE,
  LEVEL,
  ErrorService,
  Asset,
  RoutingService
} from '@services';

// Utility
import { TranslatePipe } from '@ngx-translate/core';

interface DialogData {
  model: TradeBankModel;
  asset: Asset;
  counter_asset: Asset;
}

@Component({
  selector: 'app-trade-summary',
  templateUrl: './trade-summary.component.html',
  styleUrls: [
    './trade-summary.component.scss',
    '../../../shared/styles/global.scss'
  ]
})
export class TradeSummaryComponent implements OnInit {
  trade$: Subject<TradeBankModel> = new Subject<TradeBankModel>();
  tradeBankModel: TradeBankModel = {};

  isRecoverable$ = new BehaviorSubject(true);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialogRef: MatDialogRef<TradeSummaryComponent>,
    public configService: ConfigService,
    private routingService: RoutingService,
    private snackBar: MatSnackBar,
    private tradesService: TradesService,
    private eventService: EventService,
    private errorService: ErrorService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    this.getTrade();
  }

  getTrade(): void {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.DATA_FETCHING,
      'Fetching trade...'
    );
    this.tradesService
      .getTrade(this.data.model.guid!)
      .pipe(
        map((tradeBankModel) => {
          this.trade$.next(tradeBankModel);
        }),
        catchError((err: any) => {
          const message = this.translatePipe.transform('trade.summary.error');
          this.snackBar.open(message, 'OK');
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'Error fetching trade'
          );
          this.errorService.handleError(err);
          this.dialogRef.close();
          return of(err);
        })
      )
      .subscribe();
  }

  onDialogClose(): void {
    this.routingService.handleRoute('price-list', 'trade');
  }
}
