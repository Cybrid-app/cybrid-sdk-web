import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

// Services
import { RoutingData } from '@services';

interface AssetGroup {
  asset: FormControl<string>;
}

@Component({
  selector: 'app-bank-account-confirm',
  templateUrl: './bank-account-confirm.component.html',
  styleUrls: ['./bank-account-confirm.component.scss']
})
export class BankAccountConfirmComponent {
  assetGroup!: FormGroup<AssetGroup>;
  assets!: Array<string>;

  isLoading$ = new BehaviorSubject(false);

  routingData: RoutingData = {
    route: 'account-list',
    origin: 'bank-account-connect'
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public code: string,
    public dialogRef: MatDialogRef<BankAccountConfirmComponent>
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.code);
  }
}
