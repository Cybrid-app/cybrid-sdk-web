import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
  BehaviorSubject,
  Subject
} from 'rxjs';

// Client
import { AccountBankModel } from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  ConfigService
} from '@services';

export interface DepositAddressPayment {
  amount: string;
  message: string;
}

export interface DepositAddressFormGroup {
  amount: FormControl<number | null>;
  message: FormControl<string | null>;
}

@Component({
  selector: 'app-deposit-address-payment',
  templateUrl: './deposit-address-payment.component.html',
  styleUrls: ['./deposit-address-payment.component.scss']
})
export class DepositAddressPaymentComponent implements OnInit, OnDestroy {
  account: AccountBankModel = this.data.account;
  depositAddressFormGroup!: FormGroup<DepositAddressFormGroup>;

  isRecoverable$ = new BehaviorSubject(true);
  unsubscribe$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DepositAddressPaymentComponent>,
    public configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.initTradeForm();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  initTradeForm(): void {
    this.depositAddressFormGroup = new FormGroup<DepositAddressFormGroup>({
      amount: new FormControl(null, {
        validators: [
          Validators.min(0),
          Validators.pattern(
            /^(0*[1-9][0-9]*(\.[0-9]+)?|0+\.[0-9]*[1-9][0-9]*)$/
          )
        ]
      }),
      message: new FormControl(null)
    });
    this.depositAddressFormGroup.valueChanges.subscribe();
  }

  createDepositPaymentCode(): void {
    const depositPayment: DepositAddressPayment = {
      amount: <string>this.depositAddressFormGroup.controls.amount.value?.toString() ?? null,
      message: <string>this.depositAddressFormGroup.controls.message.value ?? null
    };
    this.dialogRef.close(depositPayment);
  }
}
