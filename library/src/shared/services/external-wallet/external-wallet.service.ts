import { Injectable, OnDestroy } from '@angular/core';
import {
  catchError,
  Observable,
  of,
  Subject
} from 'rxjs';

// Client
import {
    ExternalWalletBankModel,
    ExternalWalletListBankModel,
    PostExternalWalletBankModel,
    ExternalWalletsService
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { LEVEL, CODE, EventService, ErrorService } from '@services';

@Injectable({
    providedIn: 'root'
})
export class ExternalWalletService implements OnDestroy {
    private unsubscribe$ = new Subject();

    constructor(
        private eventService: EventService,
        private errorService: ErrorService,
        private externalWalletsService: ExternalWalletsService
    ) {}

    ngOnDestroy() {
        this.unsubscribe$.next('');
        this.unsubscribe$.complete();
    }

    listExternalWallets(): Observable<ExternalWalletListBankModel> {
        return this.externalWalletsService.listExternalWallets().pipe(
            catchError((err) => {
                this.eventService.handleEvent(
                    LEVEL.ERROR,
                    CODE.DATA_ERROR,
                    'There was an error listing external wallets'
                );

                this.errorService.handleError(
                    new Error('There was an error listing external wallets')
                );

                return of(err);
            })
        );
    }

    getExternalWallet(externalWAlletGuid: string): Observable<ExternalWalletBankModel> {
        return this.externalWalletsService
            .getExternalWallet(<string>externalWAlletGuid)
            .pipe(
                catchError((err) => {
                    this.eventService.handleEvent(
                        LEVEL.ERROR,
                        CODE.DATA_ERROR,
                        'There was an error fetching external wallet'
                    );

                    this.errorService.handleError(
                        new Error('There was an error fetching external wallet')
                    );

                    return of(err);
                })
            )
    }

    createExternalWallet(postExternalWalletBankModel: PostExternalWalletBankModel): Observable<ExternalWalletBankModel> {
        return this.externalWalletsService
            .createExternalWallet(postExternalWalletBankModel)
            .pipe(
                catchError((err) => {
                    this.eventService.handleEvent(
                        LEVEL.ERROR,
                        CODE.DATA_ERROR,
                        'There was an error creating external wallet'
                    );

                    this.errorService.handleError(
                        new Error('There was an error creating external wallet')
                    );

                    return of(err);
                })
            )
    }
}