import { Injectable } from '@angular/core';

import { map, ReplaySubject } from 'rxjs';

import {
  PricesService,
  SymbolPriceBankModel
} from '@cybrid/cybrid-api-bank-angular';

@Injectable({
  providedIn: 'root'
})
export class TestPricesService {
  prices$: ReplaySubject<SymbolPriceBankModel[]> = new ReplaySubject(1);

  constructor(private clientPricesService: PricesService) {
    this.listPrices();
  }

  /**
   * Get a list of prices
   * @return An array of SymbolPriceBankModel
   **/
  listPrices(): void {
    this.clientPricesService
      .listPrices()
      .pipe(map((prices) => this.prices$.next(prices)))
      .subscribe();
  }
}
