import { Injectable, OnDestroy } from '@angular/core';
import {
  catchError,
  EMPTY,
  expand,
  map,
  Observable,
  of,
  reduce,
  Subject,
  throwError
} from 'rxjs';

// Client
import {
    DepositAddressBankModel,
    DepositAddressListBankModel,
    PostDepositAddressBankModel,
    DepositAddressesService
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { LEVEL, CODE, EventService, ErrorService } from '@services';

@Injectable({
    providedIn: 'root'
})
export class DepositAddressService implements OnDestroy {

    private unsubscribe$ = new Subject();

    constructor(
        private eventService: EventService,
        private errorService: ErrorService,
        private depositAddressesService: DepositAddressesService
    ) {}

    ngOnDestroy() {
        this.unsubscribe$.next('');
        this.unsubscribe$.complete();
    }

    listDepositAddresses(): Observable<DepositAddressListBankModel> {
        return this.depositAddressesService
            .listDepositAddresses()
            .pipe(
                catchError((err) => {
                    this.eventService.handleEvent(
                        LEVEL.ERROR,
                        CODE.DATA_ERROR,
                        'There was an error listing deposit addresses'
                    );

                    this.errorService.handleError(
                        new Error('There was an error listing deposit addresses')
                    );

                    return of(err);
                })
            );
    }

    getDepositAddress(depositAddressGuid: string): Observable<DepositAddressBankModel> {
        return this.depositAddressesService
            .getDepositAddress(<string>depositAddressGuid)
            .pipe(
                catchError((err) => {
                    this.eventService.handleEvent(
                      LEVEL.ERROR,
                      CODE.DATA_ERROR,
                      'There was an error fetching deposit address'
                    );
          
                    this.errorService.handleError(
                      new Error('There was an error fetching deposit address')
                    );
          
                    return of(err);
                  })
            );
    }

    createDepositAddress(postDepositAddressBankModel: PostDepositAddressBankModel): Observable<DepositAddressBankModel> {
        return this.depositAddressesService
            .createDepositAddress(postDepositAddressBankModel)
            .pipe(
                catchError((err) => {
                    this.eventService.handleEvent(
                      LEVEL.ERROR,
                      CODE.DATA_ERROR,
                      'There was an error creating deposit address'
                    );
          
                    this.errorService.handleError(
                      new Error('There was an error creating deposit address')
                    );
          
                    return of(err);
                  })
            );
    }
}