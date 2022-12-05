import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs';

// Services
import { Asset, RoutingData, RoutingService } from '@services';

// Models
import {
  ExternalBankAccountBankModel,
  TransferBankModel
} from '@cybrid/cybrid-api-bank-angular';

export interface TransferDetailsData {
  transferBankModel: TransferBankModel;
  externalBankAccountBankModel: ExternalBankAccountBankModel;
  asset: Asset;
}

@Component({
  selector: 'app-transfer-details',
  templateUrl: './transfer-details.component.html',
  styleUrls: ['./transfer-details.component.scss']
})
export class TransferDetailsComponent implements OnInit {
  transfer: TransferBankModel = this.data.transferBankModel;
  asset: Asset = this.data.asset;
  account: ExternalBankAccountBankModel =
    this.data.externalBankAccountBankModel;

  routingData: RoutingData = {
    route: 'account-list',
    origin: 'transfer-details'
  };

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: TransferDetailsData,
    private dialogRef: MatDialogRef<TransferDetailsComponent>,
    private router: RoutingService
  ) {}

  ngOnInit() {
    this.dialogRef
      .afterClosed()
      .pipe(map(() => this.router.handleRoute(this.routingData)))
      .subscribe();
  }
}
