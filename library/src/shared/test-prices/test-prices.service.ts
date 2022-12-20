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
  constructor(private clientPricesService: PricesService) {}

  /**
   * Get a list of prices
   * @return An array of SymbolPriceBankModel
   **/
  listPrices(): void {
    this.clientPricesService.listPrices().subscribe();
  }
}
