import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, Observable, of, switchMap } from 'rxjs';
import { Customer } from './customer.model';
import { Identity } from './identity.model';

@Injectable({
  providedIn: 'root'
})
export class IdentityVerificationService {
  API_BASE_URL = 'http://localhost:8888/api/';

  constructor(private http: HttpClient) {}

  /*
   * Initiates a new identity verification workflow if the kyc state is required,
   * otherwise returns the customer.
   *
   * This can create a new flow even if there is one currently in progress!!
   * */
  getIdentityVerification(): Observable<Customer | Identity> {
    return this.getCustomer().pipe(
      switchMap((customer: Customer) => {
        return customer.kyc_state === 'required'
          ? this.createIdentityVerification()
          : of(customer);
      }),
      catchError((err) => {
        //  handleError()
        return of(err);
      })
    );
  }

  getCustomer(): Observable<any> {
    return this.http.get(this.API_BASE_URL + 'customers', {
      headers: {
        data: 'kyc_state_required'
      }
    });
  }

  createIdentityVerification(): Observable<any> {
    return this.http.get(this.API_BASE_URL + 'identity_verifications', {
      headers: {
        data: 'new'
      }
    });
  }
}
