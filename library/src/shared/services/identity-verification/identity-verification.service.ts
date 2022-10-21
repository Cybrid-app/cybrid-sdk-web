import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, map, Observable, of, switchMap, take } from 'rxjs';

// Models
import { Customer, CustomerList } from './customer.model';
import {
  IdentityVerificationBankModel,
  IdentityVerificationsService
} from '@cybrid/cybrid-api-bank-angular';
import { PostIdentityVerificationBankModel } from '@cybrid/cybrid-api-bank-angular/model/postIdentityVerification';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class IdentityVerificationService {
  personaClient: BehaviorSubject<any | null> = new BehaviorSubject(null);

  postIdentityVerificationBankModel: PostIdentityVerificationBankModel = {
    customer_guid: '',
    method: 'id_and_selfie',
    type: 'kyc'
  };

  API_BASE_URL = 'http://localhost:8888/api/';

  constructor(
    private http: HttpClient,
    private identityVerificationService: IdentityVerificationsService,
    private configService: ConfigService
  ) {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        map((config) => {
          this.postIdentityVerificationBankModel.customer_guid =
            config.customer;
        })
      )
      .subscribe();
  }

  /**
   * Fetches the customer.
   *
   * @param data ``JSON`` key of the mock data that you want to receive
   * @return An ``Observable`` of the response, flattened to ``Customer``.
   * */
  public getCustomer(data: string): Observable<Customer> {
    return this.http
      .get(this.API_BASE_URL + 'customers', {
        headers: {
          data: data
        }
      })
      .pipe(
        map((res) => res as CustomerList),
        map((list) => list.objects[0])
      );
  }

  /**
   * Fetches the most recent identity verification.
   *
   * @param data ``JSON`` key of the mock data that you want to receive
   * @return An ``Observable`` of the response, type: ``IdentityList``.
   * */
  // private listIdentityVerifications(data: string): Observable<IdentityList> {
  //   return this.http
  //     .get(this.API_BASE_URL + 'identity_verifications', {
  //       headers: {
  //         data: data
  //       }
  //     })
  //     .pipe(
  //       map((res) => {
  //         return res as IdentityList;
  //       })
  //     );
  // }

  /**
   * Initializes a new identity verification workflow.
   *
   * @return An ``Observable`` of the response, flattened to ``Identity``.
   * */
  createIdentityVerification(): Observable<IdentityVerificationBankModel> {
    return this.identityVerificationService.createIdentityVerification(
      this.postIdentityVerificationBankModel
    );
  }

  /**
   * Checks for existing identity verifications. If none exist, or it is expired it
   * creates a new one.
   *
   * @return An ``Observable`` of type: ``Identity``
   * */
  public getIdentityVerification(): Observable<IdentityVerificationBankModel> {
    return this.identityVerificationService.listIdentityVerifications().pipe(
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
