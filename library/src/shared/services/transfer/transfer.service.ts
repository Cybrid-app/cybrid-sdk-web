import { Injectable, OnDestroy } from '@angular/core';
import {
  catchError,
  EMPTY,
  expand,
  map,
  tap,
  Observable,
  of,
  reduce,
  Subject
} from 'rxjs';

// Client
import {
    TransferBankModel,
    TransferListBankModel,
    TransfersService
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { LEVEL, CODE, EventService, ErrorService } from '@services';

@Injectable({
  providedIn: 'root'
})
export class TransferService implements OnDestroy {
  private unsubscribe$ = new Subject();

  transfersPerPage = 10;

  constructor(
    private eventService: EventService,
    private errorService: ErrorService,
    private trasnfersService: TransfersService
  ) {}

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  listTransfers(
    page?: string,
    perPage?: string,
    customerGuid?: string
  ): Observable<TransferListBankModel> {
    return this.trasnfersService.listTransfers(page, perPage, '', '', '', '', customerGuid).pipe(
      catchError((err) => {
        this.eventService.handleEvent(
          LEVEL.ERROR,
          CODE.DATA_ERROR,
          'There was an error listing transfers'
        );

        this.errorService.handleError(
          new Error('There was an error listing transfers')
        );
        return of(err);
      })
    );
  }

  pageTransfers(perPage: number, list: TransferListBankModel, customerGuid: string) {
    return list.objects.length == perPage
      ? this.trasnfersService.listTransfers(
          (Number(list.page) + 1).toString(),
          perPage.toString(),
          customerGuid
        )
      : EMPTY;
  }

  accumulateTransfers(acc: TransferBankModel[], value: TransferBankModel[]) {
    return [...acc, ...value];
  }

  listAllTransfers(customerGuid: string): Observable<TransferBankModel[]> {
    return this.trasnfersService.listTransfers().pipe(
      expand((list) => this.pageTransfers(this.transfersPerPage, list, customerGuid)),
      map((list) => list.objects),
      reduce((acc, value) => this.accumulateTransfers(acc, value)),
      catchError((err) => {
        this.eventService.handleEvent(
          LEVEL.ERROR,
          CODE.DATA_ERROR,
          'There was an error listing all accounts'
        );

        this.errorService.handleError(
          new Error('There was an error listing all accounts')
        );
        return of(err);
      })
    );
  }

  getTransfer(guid: string): Observable<TransferBankModel> {
    return this.trasnfersService.getTransfer(guid).pipe(
      catchError((err) => {
        this.eventService.handleEvent(
          LEVEL.ERROR,
          CODE.DATA_ERROR,
          `There was an error fetching transfer ${guid}`
        );

        this.errorService.handleError(
          new Error(`There was an error fetching transfer ${guid}`)
        );
        return of(err);
      })
    );
  }
}