import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { Customer } from './customer.model';
import { Identity } from './identity.model';

interface Data {
  customerData: string;
  identityData: string;
}

@Injectable({
  providedIn: 'root'
})
export class IdentityVerificationService {
  API_BASE_URL = 'http://localhost:8888/api/';

  constructor(private http: HttpClient) {}

  /*
   * Initiates a new identity verification workflow if the kyc state is required,
   * otherwise returns the customer. Temporarily takes a Data object with the key
   * of the mock api response to receive.
   *
   * This can create a new flow even if there is one currently in progress!!
   * */
  getIdentityVerification(data: Data): Observable<Customer | Identity> {
    return this.getCustomer(data.customerData).pipe(
      switchMap((customer: Customer) => {
        return customer.kyc_state === 'required'
          ? this.createIdentityVerification(data.identityData)
          : of(customer);
      }),
      catchError((err) => {
        //  handleError()
        return of(err);
      })
    );
  }

  getCustomer(data: string): Observable<any> {
    return this.http.get(this.API_BASE_URL + 'customers', {
      headers: {
        data: data
      }
    });
  }

  createIdentityVerification(data: string): Observable<any> {
    return this.http.get(this.API_BASE_URL + 'identity_verifications', {
      headers: {
        data: data
      }
    });
  }
}
