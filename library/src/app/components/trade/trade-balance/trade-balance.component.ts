import { Component, Input } from '@angular/core';
import { AccountBankModel } from '@cybrid/cybrid-api-bank-angular';

@Component({
  selector: 'app-trade-balance',
  templateUrl: './trade-balance.component.html',
  styleUrls: ['./trade-balance.component.scss']
})
export class TradeBalanceComponent {
  @Input() account: AccountBankModel | null = null;
  constructor() {}
}
