import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

// Services
import { RoutingData } from '@services';

// Client
import { BankBankModel } from '@cybrid/cybrid-api-bank-angular';

interface AssetGroup {
  asset: FormControl<string>;
}

@Component({
  selector: 'app-bank-account-confirm',
  templateUrl: './bank-account-confirm.component.html',
  styleUrls: ['./bank-account-confirm.component.scss']
})
export class BankAccountConfirmComponent implements OnInit {
  assetGroup!: FormGroup<AssetGroup>;
  assets!: Array<string>;

  isLoading$ = new BehaviorSubject(true);

  routingData: RoutingData = {
    route: 'account-list',
    origin: 'bank-account-connect'
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public bank: BankBankModel,
    public dialogRef: MatDialogRef<BankAccountConfirmComponent>
  ) {}

  ngOnInit(): void {
    this.initAssetGroup();
  }

  initAssetGroup() {
    this.assets = this.bank.supported_fiat_account_assets!;

    this.assetGroup = new FormGroup<AssetGroup>({
      asset: new FormControl(this.assets[0], {
        nonNullable: true
      })
    });

    this.isLoading$.next(false);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.assetGroup.value.asset);
  }
}
