import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  PostQuoteBankModel,
  QuoteBankModel,
  QuotesService
} from '@cybrid/cybrid-api-bank-angular';
import { map, take } from 'rxjs';

@Component({
  selector: 'app-trade-quote',
  templateUrl: './trade-quote.component.html',
  styleUrls: ['./trade-quote.component.scss']
})
export class TradeQuoteComponent implements OnInit {
  quoteBankModel!: QuoteBankModel;

  constructor(
    @Inject(MAT_DIALOG_DATA) public postQuoteBankModel: PostQuoteBankModel,
    private quotesService: QuotesService
  ) {}

  ngOnInit() {
    console.log(this.postQuoteBankModel);
    // this.getQuote();
  }

  getQuote(): void {
    this.quotesService
      .createQuote(this.postQuoteBankModel)
      .pipe(
        take(1),
        map((quote) => {
          console.log(quote);
          this.quoteBankModel = quote;
        })
      )
      .subscribe();
  }
}
