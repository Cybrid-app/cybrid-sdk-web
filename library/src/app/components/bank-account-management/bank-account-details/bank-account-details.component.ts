import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BehaviorSubject, EMPTY, map, switchMap, take } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

// Services
import { BankAccountService, RoutingData, RoutingService } from '@services';

// Components
import { BankAccountDisconnectComponent } from '@components';

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
    @Inject(MAT_DIALOG_DATA) public data: ExternalBankAccountModel,
    public dialogRef: MatDialogRef<BankAccountDetailsComponent>,
    public dialog: MatDialog,
    private router: RoutingService,
    private bankAccountService: BankAccountService,
    private snackBar: MatSnackBar,
    private translate: TranslatePipe
  ) {
    this.account = data;
  }

  // Validates the external bank account bank model contains a guid
  validateExternalBankAccount(
    res: boolean | ExternalBankAccountBankModel
  ): res is ExternalBankAccountBankModel {
    return (res as ExternalBankAccountBankModel).guid !== undefined;
  }

  onDisconnect(account: ExternalBankAccountModel): void {
    this.dialog
      .open(BankAccountDisconnectComponent, {
        data: account.name
      })
      .afterClosed()
      .pipe(
        take(1),
        switchMap((res) => {
          return res
            ? this.bankAccountService.deleteExternalBankAccount(account.guid!)
            : EMPTY;
        }),
        map((account) => {
          const isValid = this.validateExternalBankAccount(account);

          const message =
            (isValid
              ? this.translate.transform('bankAccountList.details.success') +
                ' '
              : this.translate.transform('bankAccountList.details.error') +
                ' ') + this.account.name;

          this.snackBar.open(message, 'OK', {
            duration: 5000
          });

          this.dialogRef.close(isValid);
        })
      )
      .subscribe();
  }

  onReconnect(externalBankAccount: ExternalBankAccountModel): void {
    const routingData: RoutingData = {
      origin: 'bank-account-list',
      route: 'bank-account-connect',
      extras: {
        queryParams: {
          externalBankAccountGuid: externalBankAccount.guid
        }
      }
    };

    this.dialogRef.close();
    this.router.handleRoute(routingData);
  }
}
