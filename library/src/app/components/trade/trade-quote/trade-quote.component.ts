import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  PostQuoteBankModel,
  QuoteBankModel,
  QuotesService
} from '@cybrid/cybrid-api-bank-angular';

@Component({
  selector: 'app-trade-quote',
  templateUrl: './trade-quote.component.html',
  styleUrls: ['./trade-quote.component.scss']
})
export class TradeQuoteComponent {
  quoteBankModel!: QuoteBankModel;

  constructor(
    @Inject(MAT_DIALOG_DATA) public postQuoteBankModel: PostQuoteBankModel,
    private quotesService: QuotesService
  ) {}

  // getQuote(): void {
  //   this.quotesService
  //     .createQuote(this.postQuoteBankModel)
  //     .pipe(
  //       take(1),
  //       map((quote) => {
  //         console.log(quote);
  //       })
  //     )
  //     .subscribe();
  // }
}
