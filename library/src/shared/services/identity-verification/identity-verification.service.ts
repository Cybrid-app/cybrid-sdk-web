import { Injectable, OnDestroy } from '@angular/core';

import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  Subject,
  takeUntil
} from 'rxjs';

// Models
import {
  CustomerBankModel,
  CustomersService,
  IdentityVerificationListBankModel,
  IdentityVerificationsService,
  IdentityVerificationWithDetailsBankModel,
  PostIdentityVerificationBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { ConfigService } from '../config/config.service';
import { CODE, EventService, LEVEL } from '../event/event.service';
import { ErrorService } from '../error/error.service';

@Injectable({
  providedIn: 'root'
})
export class IdentityVerificationService implements OnDestroy {
  personaClient: BehaviorSubject<any | null> = new BehaviorSubject(null);
  customerGuid: string = '';

  unsubscribe$ = new Subject();

  postIdentityVerificationBankModel: PostIdentityVerificationBankModel = {
    customer_guid: '',
    method: PostIdentityVerificationBankModel.MethodEnum.IdAndSelfie,
    type: PostIdentityVerificationBankModel.TypeEnum.Kyc
  };

  constructor(
    private identityVerificationService: IdentityVerificationsService,
    private customerService: CustomersService,
    private configService: ConfigService,
    private eventService: EventService,
    private errorService: ErrorService
  ) {
    this.getCustomerGuid();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  getCustomerGuid(): void {
    this.configService
      .getConfig$()
      .pipe(
        takeUntil(this.unsubscribe$),
        map((config) => {
          this.customerGuid = config.customer;
          this.postIdentityVerificationBankModel.customer_guid =
            config.customer;
        })
      )
      .subscribe();
  }

  getCustomer(): Observable<CustomerBankModel> {
    return this.customerService.getCustomer(this.customerGuid);
  }

  createIdentityVerification(): Observable<IdentityVerificationWithDetailsBankModel> {
    return this.identityVerificationService
      .createIdentityVerification(this.postIdentityVerificationBankModel)
      .pipe(
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
