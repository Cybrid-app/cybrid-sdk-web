import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';

import { BehaviorSubject } from 'rxjs';

// Services
import { ConfigService } from '@services';

// Models
import { ExternalBankAccountBankModel } from '@cybrid/cybrid-api-bank-angular/model/externalBankAccount';

interface ExternalBankAccountModel extends ExternalBankAccountBankModel {}

@Component({
  selector: 'app-bank-account-details',
  templateUrl: './bank-account-details.component.html',
  styleUrls: ['./bank-account-details.component.scss']
})
export class BankAccountDetailsComponent {
  account!: ExternalBankAccountBankModel;

  isRecoverable$ = new BehaviorSubject(true);

  constructor(
    public configService: ConfigService,
    @Inject(MAT_DIALOG_DATA) public data: ExternalBankAccountModel,
    public dialogRef: MatDialogRef<BankAccountDetailsComponent>,
    public dialog: MatDialog
  ) {
    this.account = data;
  }

  onDisconnect(account: ExternalBankAccountModel): void {
    this.dialogRef.close(account);
  }
}
