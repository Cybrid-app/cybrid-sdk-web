import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, map, Observable, of, switchMap } from 'rxjs';

interface Customer {
  message: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class IdentityVerificationService {
  templateId = 'itmpl_ArgEXWw8ZYtYLvfC26tr9zmY';

  constructor(private http: HttpClient) {}

  checkBackendForCustomerKycStatus(): Observable<any> {
    return this.http.get('https://dog.ceo/api/breeds/image/random');
  }

  bootstrapIdentityClient(): Observable<any> {
    return this.checkBackendForCustomerKycStatus().pipe(
      map((customer: Customer) => customer.status),
      switchMap((status) => {
        return status === 'success' ? of(this.templateId) : of(this.templateId);
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }
}
