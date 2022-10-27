import { Component, Input } from '@angular/core';
import { CustomerBankModel } from '@cybrid/cybrid-api-bank-angular';

@Component({
  selector: 'app-customer-content',
  templateUrl: './customer-content.component.html',
  styleUrls: ['../identity-verification.component.scss']
})
export class CustomerContentComponent {
  @Input() customer!: CustomerBankModel;
}
