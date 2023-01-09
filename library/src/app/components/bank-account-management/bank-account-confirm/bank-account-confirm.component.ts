import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExternalBankAccountBankModel } from '@cybrid/cybrid-api-bank-angular/model/externalBankAccount';

interface ExternalBankAccountModel extends ExternalBankAccountBankModel {}

@Component({
  selector: 'app-bank-account-confirm',
  templateUrl: './bank-account-confirm.component.html',
  styleUrls: ['./bank-account-confirm.component.scss']
})
export class BankAccountConfirmComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public account: ExternalBankAccountModel
  ) {}
}
