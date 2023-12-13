import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-bank-account-disconnect',
  templateUrl: './bank-account-disconnect.component.html',
  styleUrls: ['./bank-account-disconnect.component.scss']
})
export class BankAccountDisconnectComponent {
  accountName!: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string,
    public dialogRef: MatDialogRef<BankAccountDisconnectComponent>
  ) {
    this.accountName = data;
  }
}
