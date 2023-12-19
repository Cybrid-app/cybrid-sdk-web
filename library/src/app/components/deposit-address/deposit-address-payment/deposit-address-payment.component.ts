import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

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

// Client
import {
    AccountBankModel
  } from '@cybrid/cybrid-api-bank-angular';

// Services
import {
    ComponentConfig,
    ConfigService,
    EventService,
    CODE,
    LEVEL,
    ErrorService,
    Asset
  } from '@services';
  
// Utility
import { TranslatePipe } from '@ngx-translate/core';

export interface DepositAddressPayment {
  amount: number;
  message: string;
}

@Component({
    selector: 'app-deposit-address-payment',
    templateUrl: './deposit-address-payment.component.html',
    styleUrls: ['./deposit-address-payment.component.scss']
})
export class DepositAddressPaymentComponent implements OnInit, OnDestroy {
  
    account: AccountBankModel = this.data.account;
    amountValue: number;
    messageValue: string;

    isRecoverable$ = new BehaviorSubject(true);
    unsubscribe$ = new Subject();
    refreshSub: Subscription = new Subscription();
    refreshInterval = 0;
  
    constructor(
      @Inject(MAT_DIALOG_DATA) public data: any,
      public dialogRef: MatDialogRef<DepositAddressPaymentComponent>,
      private snackBar: MatSnackBar,
      public configService: ConfigService,
      private eventService: EventService,
      private errorService: ErrorService,
      private translatePipe: TranslatePipe
    ) {

      this.amountValue = 2;
      this.messageValue = 'Hello world';
    }

    ngOnInit(): void {}
    
    ngOnDestroy() {
        this.unsubscribe$.next('');
        this.unsubscribe$.complete();
    }

    onRefreshClick(): void {
      const depositPayment: DepositAddressPayment = {
        amount: this.amountValue,
        message: this.messageValue
      };
      this.dialogRef.close(depositPayment)
    }
}