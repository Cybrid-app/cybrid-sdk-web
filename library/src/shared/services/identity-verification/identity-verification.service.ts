import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable, switchMap } from 'rxjs';

import './identity.data.js';
import { Customer } from './customer.model';
import { Identity } from './identity.model';

@Injectable({
  providedIn: 'root'
})
export class IdentityVerificationService {
  API_BASE_URL = 'http://localhost:8888/api/';

  constructor(private http: HttpClient) {}

  checkForKyc(): Observable<string | undefined> {
    return this.getCustomer().pipe(
      map((customer: Customer) => customer.kyc_state == 'required'),
      switchMap(() => this.createIdentityVerificationWorkflow()),
      map((identity: Identity) => identity.persona_inquiry_id)
    );
  }

  getCustomer(): Observable<any> {
    return this.http.get(this.API_BASE_URL + 'customers');
  }

  createIdentityVerificationWorkflow(): Observable<any> {
    return this.http.get(this.API_BASE_URL + 'identity_verifications');
  }
}
