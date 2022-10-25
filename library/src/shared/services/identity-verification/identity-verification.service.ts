import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil
} from 'rxjs';

// Models
import {
  CustomerBankModel,
  CustomersService,
  IdentityVerificationBankModel,
  PostIdentityVerificationBankModel,
  IdentityVerificationsService
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class IdentityVerificationService implements OnDestroy {
  personaClient: BehaviorSubject<any | null> = new BehaviorSubject(null);
  customerGuid: string = '';

  unsubscribe$ = new Subject();

  postIdentityVerificationBankModel: PostIdentityVerificationBankModel = {
    customer_guid: '',
    method: 'id_and_selfie',
    type: 'kyc'
    // expected_behaviours: ['passed_immediately']
  };

  constructor(
    private http: HttpClient,
    private identityVerificationService: IdentityVerificationsService,
    private customerService: CustomersService,
    private configService: ConfigService
  ) {
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

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  /**
   * Fetches the customer.
   * @return An ``Observable`` of type: ``CustomerBankModel``.
   * */
  getCustomer(): Observable<CustomerBankModel> {
    return this.customerService.getCustomer(this.customerGuid);
  }

  /**
   * Initializes a new identity verification workflow.
   * @return An ``Observable`` of type: ``IdentityVerificationBankModel``.
   * */
  createIdentityVerification(): Observable<IdentityVerificationBankModel> {
    return this.identityVerificationService.createIdentityVerification(
      this.postIdentityVerificationBankModel
    );
  }

  /**
   * Checks for an existing(most recent) identity verification. If none exist,
   * or it is expired it creates a new one.
   * @return An ``Observable`` of type: ``IdentityVerificationBankModel``
   * */
  public getIdentityVerification(): Observable<IdentityVerificationBankModel> {
    return this.identityVerificationService
      .listIdentityVerifications(
        '1',
        '1',
        undefined,
        undefined,
        this.customerGuid
      )
      .pipe(
        switchMap((list) => {
          const identity = list.objects[0];
          return identity
            ? this.handleIdentityVerificationState(identity)
            : this.createIdentityVerification();
        })
      );
  }

  handleIdentityVerificationState(
    identity: IdentityVerificationBankModel
  ): Observable<IdentityVerificationBankModel> {
    if (identity.state == 'expired' || identity.persona_state == 'expired') {
      return this.createIdentityVerification();
    } else return of(identity);
  }

  setPersonaClient(client: any): void {
    this.personaClient.next(client);
  }

  getPersonaClient(): Observable<any> {
    return this.personaClient.asObservable();
  }
}
