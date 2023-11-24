import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BehaviorSubject, catchError, map, of, Subject, take } from 'rxjs';

// Client
import { TransferBankModel, TransfersService } from '@cybrid/cybrid-api-bank-angular';

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
  model: TransferBankModel;
  asset: Asset;
}

@Component({
  selector: 'app-transfer-summary',
  templateUrl: './transfer-summary.component.html',
  styleUrls: [
    './transfer-summary.component.scss',
    '../../../../shared/styles/global.scss'
  ]
})
export class TransferSummaryComponent implements OnInit {

  transfer$: Subject<TransferBankModel> = new Subject<TransferBankModel>();
  trnasferBankModel: TransferBankModel = {};

  isRecoverable$ = new BehaviorSubject(true);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialogRef: MatDialogRef<TransferSummaryComponent>,
    public configService: ConfigService,
    private routingService: RoutingService,
    private snackBar: MatSnackBar,
    private transfersService: TransfersService,
    private eventService: EventService,
    private errorService: ErrorService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    this.getTransfer();
  }

  getTransfer(): void {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.DATA_FETCHING,
      'Fetching transfer...'
    );
    this.transfersService
      .getTransfer(this.data.model.guid!)
      .pipe(
        map((transferBankModel) => {
          this.transfer$.next(transferBankModel);
        }),
        catchError((err: any) => {
          const message = this.translatePipe.transform('transfer.summary.error');
          this.snackBar.open(message, 'OK');
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'Error fetching transfer'
          );
          this.errorService.handleError(err);
          this.dialogRef.close();
          return of(err);
        })
      )
      .subscribe();
  }
}