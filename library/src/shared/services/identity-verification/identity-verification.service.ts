import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  catchError,
  map,
  merge,
  Observable,
  of,
  repeat,
  Subject,
  switchMap,
  takeUntil,
  takeWhile,
  timer
} from 'rxjs';

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

  newRequest$ = new Subject();

  constructor(private http: HttpClient) {}

  /*
   * Initiates a new identity verification workflow if the kyc state is required,
   * otherwise returns the customer. Temporarily takes a Data object with the key
   * of the mock api response to receive.
   *
   * This can create a new flow even if there is one currently in progress!!
   * */
  checkIdentityVerification(data: Data): Observable<any> {
    this.newRequest$.next(true); // Cancel any open polling on /api/identity

    return this.getCustomer(data.customerData).pipe(
      switchMap((customer: Customer) => {
        return customer.kyc_state === 'required'
          ? this.startVerificationProcess(data.identityData)
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

  getIdentityVerification(data: string): Observable<any> {
    return this.http.get(this.API_BASE_URL + 'identity_verifications', {
      headers: {
        data: data
      }
    });
  }

  startVerificationProcess(data: string): Observable<any> {
    return this.getIdentityVerification(data).pipe(
      repeat({ delay: 1000 }),
      map((res) => res as Identity),
      takeWhile(
        (identity) => identity.state == ('storing' || 'processing'),
        true
      ),
      // Cancel subscription on: new request or reaching the polling interval
      takeUntil(merge(this.newRequest$, timer(5000)))
      // tap((res) => console.log(res))
    );
  }
}
