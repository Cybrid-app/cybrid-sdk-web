import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map, Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { Identity, IdentityList } from './identity.model';
import { Customer, CustomerList } from './customer.model';

@Injectable({
  providedIn: 'root'
})
export class IdentityVerificationService {
  personaClient = new ReplaySubject(1);

  API_BASE_URL = 'http://localhost:8888/api/';

  constructor(private http: HttpClient) {}

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
  private listIdentityVerifications(data: string): Observable<IdentityList> {
    return this.http
      .get(this.API_BASE_URL + 'identity_verifications', {
        headers: {
          data: data
        }
      })
      .pipe(
        map((res) => {
          return res as IdentityList;
        })
      );
  }

  /**
   * Initializes a new identity verification workflow.
   *
   * @param data ``JSON`` key of the mock data that you want to receive
   * @return An ``Observable`` of the response, flattened to ``Identity``.
   * */
  createIdentityVerification(data: string): Observable<Identity> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        data: data
      })
    };
    return this.http
      .post(this.API_BASE_URL + 'identity_verifications', {}, httpOptions)
      .pipe(
        map((res) => res as IdentityList),
        map((list) => list.objects[0])
      );
  }

  /**
   * Checks for existing identity verifications. If none exists, creates a new one.
   *
   * @param data ``JSON`` key of the mock data that you want to receive
   * @return An ``Observable`` of type: ``Identity``
   * */
  public getIdentityVerification(data: string): Observable<Identity> {
    return this.listIdentityVerifications(data).pipe(
      switchMap((list) => {
        return list.total != 0
          ? of(list.objects[0])
          : this.createIdentityVerification('state_storing');
      })
    );
  }

  setPersonaClient(client: any): void {
    this.personaClient.next(client);
  }

  getPersonaClient(): Observable<any> {
    return this.personaClient.asObservable();
  }
}
