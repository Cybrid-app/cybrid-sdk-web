import { Injectable } from '@angular/core';
import { catchError, tap, Observable, of } from 'rxjs';

// Services
import {
  PricesService,
  SymbolPriceBankModel
} from '@cybrid/cybrid-api-bank-angular';

import { CODE, EventService, LEVEL } from '../event/event.service';
import { ErrorService } from '../error/error.service';

@Injectable({
  providedIn: 'root'
})
export class PriceService {
  constructor(
    private pricesService: PricesService,
    private eventService: EventService,
    private errorService: ErrorService
  ) {}

  /**
   * Get a list of prices
   * @return An array of SymbolPriceBankModel
   **/
  listPrices(symbol?: string): Observable<SymbolPriceBankModel[]> {
    return this.pricesService.listPrices(symbol).pipe(
      tap((priceList) => {
        this.eventService.handleEvent(
          LEVEL.INFO,
          CODE.DATA_REFRESHED,
          'Price successfully updated'
        );

        return priceList;
      }),
      catchError((err) => {
        this.eventService.handleEvent(
          LEVEL.ERROR,
          CODE.DATA_ERROR,
          'There was an error fetching price'
        );
        this.errorService.handleError(
          new Error('There was an error fetching price')
        );
        return of(err);
      })
    );
  }
}
