import { Injectable, OnDestroy } from '@angular/core';

import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  Subject,
  switchMap,
  take
} from 'rxjs';

// Models
import {
  IdentityVerificationListBankModel,
  IdentityVerificationsService,
  IdentityVerificationWithDetailsBankModel,
  PostIdentityVerificationBankModel
} from '@cybrid/cybrid-api-bank-angular';
import { Customer } from '@models';

// Services
import { ConfigService } from '../config/config.service';
import { CODE, EventService, LEVEL } from '../event/event.service';
import { ErrorService } from '../error/error.service';

@Injectable({
  providedIn: 'root'
})
export class IdentityVerificationService implements OnDestroy {
  personaClient: BehaviorSubject<any | null> = new BehaviorSubject(null);

  unsubscribe$ = new Subject();

  constructor(
    private identityVerificationService: IdentityVerificationsService,
    private configService: ConfigService,
    private eventService: EventService,
    private errorService: ErrorService
  ) {}

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  createIdentityVerification(): Observable<IdentityVerificationWithDetailsBankModel> {
    return this.configService.getCustomer$().pipe(
      take(1),
      switchMap((customer) => {
        const postIdentityVerificationBankModel: PostIdentityVerificationBankModel =
          {
            customer_guid: customer.guid,
            method:
              customer.type === Customer.TypeEnum.Business
                ? PostIdentityVerificationBankModel.MethodEnum
                    .BusinessRegistration
                : PostIdentityVerificationBankModel.MethodEnum.IdAndSelfie,
            type: PostIdentityVerificationBankModel.TypeEnum.Kyc
          };
        return this.identityVerificationService.createIdentityVerification(
          postIdentityVerificationBankModel
        );
      }),
      catchError((err) => {
        this.eventService.handleEvent(
          LEVEL.ERROR,
          CODE.DATA_ERROR,
          'There was an error creating an identity verification',
          err
        );
        this.errorService.handleError(err);
        return of(err);
      })
    );
  }

  getIdentityVerification(
    guid: string
  ): Observable<IdentityVerificationWithDetailsBankModel> {
    return this.identityVerificationService.getIdentityVerification(guid).pipe(
      catchError((err) => {
        this.eventService.handleEvent(
          LEVEL.ERROR,
          CODE.DATA_ERROR,
          'There was an error fetching the identity verification',
          err
        );
        this.errorService.handleError(err);
        return of(err);
      })
    );
  }

  listIdentityVerifications(
    page?: string,
    perPage?: string
  ): Observable<IdentityVerificationListBankModel> {
    return this.identityVerificationService
      .listIdentityVerifications(page, perPage)
      .pipe(
        catchError((err) => {
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'There was an error listing identity verifications',
            err
          );
          this.errorService.handleError(err);
          return of(err);
        })
      );
  }
}
