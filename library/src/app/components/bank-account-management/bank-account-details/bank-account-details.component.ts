import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';

import {
  BehaviorSubject,
  catchError,
  EMPTY,
  map,
  NEVER,
  Observable,
  of,
  switchMap,
  take,
  takeUntil,
  tap
} from 'rxjs';

// Services
import {
  BankAccountService,
  ConfigService,
  RoutingData,
  RoutingService
} from '@services';

// Components
import { BankAccountDisconnectComponent } from '@components';

// Models
import { ExternalBankAccountBankModel } from '@cybrid/cybrid-api-bank-angular/model/externalBankAccount';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    public dialog: MatDialog,
    private router: RoutingService,
    private bankAccountsService: BankAccountService,
    private snackBar: MatSnackBar
  ) {
    this.account = data;
  }

  onDisconnect(account: ExternalBankAccountModel): void {
    const dialog = this.dialog.open(BankAccountDisconnectComponent, {
      data: account.name
    });

    dialog
      .afterClosed()
      .pipe(
        take(1),
        switchMap((res: boolean) => {
          return res
            ? this.bankAccountsService.deleteExternalBankAccount(account.guid!)
            : of(res);
        }),
        map((res: boolean | ExternalBankAccountBankModel) => {
          function openSnackbar(snackBar: MatSnackBar, message: string) {
            snackBar.open(message + account.name, 'OK', { duration: 5000 });
          }

          // Runtime check for model/error
          if (Object.keys(res).includes('guid')) {
            this.dialogRef.close(true);
            openSnackbar(this.snackBar, 'Disconnecting: ');
          } else {
            this.dialogRef.close(false);
            openSnackbar(this.snackBar, 'Error disconnecting: ');
          }
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
