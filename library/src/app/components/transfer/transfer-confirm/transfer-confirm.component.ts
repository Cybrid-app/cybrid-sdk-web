import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';

import {
  BehaviorSubject,
  catchError,
  interval,
  map,
  of,
  Subject,
  switchMap,
  takeUntil,
  merge,
  skipWhile
} from 'rxjs';

// Services
import {
  Asset,
  CODE,
  ConfigService,
  ErrorService,
  EventService,
  LEVEL
} from '@services';

import {
  ExternalBankAccountBankModel,
  PostQuoteBankModel,
  PostTransferBankModel,
  QuoteBankModel,
  QuotesService,
  TransferBankModel,
  TransfersService
} from '@cybrid/cybrid-api-bank-angular';

// Utility
import { Constants } from '@constants';
import { Poll, PollConfig } from '../../../../shared/utility/poll/poll';

export interface TransferConfirmData {
  quoteBankModel: QuoteBankModel;
  postQuoteBankModel: PostQuoteBankModel;
  externalBankAccountBankModel: ExternalBankAccountBankModel;
  asset: Asset;
}

@Component({
  selector: 'app-transfer-confirm',
  templateUrl: './transfer-confirm.component.html',
  styleUrls: ['./transfer-confirm.component.scss']
})
export class TransferConfirmComponent implements OnInit, OnDestroy {
  quote$: BehaviorSubject<QuoteBankModel> = new BehaviorSubject<QuoteBankModel>(
    this.data.quoteBankModel
  );
  account: ExternalBankAccountBankModel =
    this.data.externalBankAccountBankModel;
  asset: Asset = this.data.asset;
  postQuoteBankModel = this.data.postQuoteBankModel;

  isLoading$ = new BehaviorSubject(false);
  isRecoverable$ = new BehaviorSubject(true);
  error$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  unsubscribe$ = new Subject();

  pollConfig: PollConfig = {
    timeout: this.error$,
    interval: Constants.POLL_INTERVAL,
    duration: Constants.POLL_DURATION
  };

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: TransferConfirmData,
    public dialogRef: MatDialogRef<TransferConfirmComponent>,
    private snackBar: MatSnackBar,
    private configService: ConfigService,
    private quoteService: QuotesService,
    private transfersService: TransfersService,
    private eventService: EventService,
    private errorService: ErrorService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit() {
    this.getQuote();
  }

  getQuote(): void {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.DATA_FETCHING,
      'Fetching quote...'
    );
    interval(Constants.PLATFORM_REFRESH_INTERVAL)
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap(() =>
          this.quoteService.createQuote(this.data.postQuoteBankModel)
        ),
        map((quote) => this.quote$.next(quote)),
        catchError((err) => {
          const message = this.translatePipe.transform(
            'trade.confirm.error.quote'
          );
          this.snackBar.open(message, 'OK');
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

  onConfirmTransfer(): void {
    this.isLoading$.next(true);

    const postTransferBankModel: PostTransferBankModel = {
      external_bank_account_guid: this.data.externalBankAccountBankModel.guid,
      quote_guid: this.quote$.getValue().guid!,
      transfer_type: PostTransferBankModel.TransferTypeEnum.Funding
    };

    let poll: Poll = new Poll(this.pollConfig);
    let transfer: TransferBankModel;

    this.transfersService
      .createTransfer(postTransferBankModel)
      .pipe(
        switchMap((res) => {
          transfer = res;
          return poll.start();
        }),
        switchMap(() => this.transfersService.getTransfer(transfer.guid!)),
        takeUntil(merge(poll.session$, this.unsubscribe$)),
        skipWhile((transfer) => transfer.state === 'storing'),
        map((transfer) => {
          poll.stop();
          this.dialogRef.close(transfer);
        }),
        catchError((err) => {
          const message = this.translatePipe.transform(
            'transfer.confirm.error.transfer'
          );
          this.snackBar.open(message, 'OK');
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'Error confirming transfer'
          );
          this.errorService.handleError(err);
          this.dialogRef.close();
          return of(err);
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }
}
