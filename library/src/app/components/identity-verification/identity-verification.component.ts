import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';

import {
  BehaviorSubject,
  catchError,
  map,
  merge,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  timer
} from 'rxjs';

// Services
import { IdentityVerificationService } from '@services';

//Models
import {
  Customer,
  CustomerList
} from '../../../shared/services/identity-verification/customer.model';
import {
  Identity,
  IdentityList
} from '../../../shared/services/identity-verification/identity.model';

// Data
import CUSTOMER from '../../../shared/services/identity-verification/customer.data.json';
import IDENTITY from '../../../shared/services/identity-verification/identity.data.json';

@Component({
  selector: 'app-identity-verification',
  templateUrl: './identity-verification.component.html',
  styleUrls: ['./identity-verification.component.scss']
})
export class IdentityVerificationComponent implements OnInit {
  API_BASE_URL = 'http://localhost:8888/api/';

  customerDataResponseList = Object.keys(CUSTOMER);
  identityDataResponseList = Object.keys(IDENTITY);

  identityDataResponseForm!: FormGroup;

  message$ = new Subject();
  isLoading$ = new BehaviorSubject(false);
  isPolling$ = new BehaviorSubject(false);
  newRequest$ = new Subject();

  // Todo: Add a constant for general polling interval
  pollingDuration$ = timer(5000);
  pollingSession$ = new Subject();
  pollingSubscription = new Subscription();
  pollingTime$ = new Subject<number>();

  personaClient: any = null;
  sessionToken: string | null = null;

  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private identityVerificationService: IdentityVerificationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initializeDataForms();
  }

  initializeDataForms(): void {
    this.identityDataResponseForm = new FormGroup({
      customerData: new FormControl(this.customerDataResponseList[0], {
        nonNullable: true
      }),
      identityData: new FormControl(this.identityDataResponseList[0], {
        nonNullable: true
      })
    });
  }

  /*
   * Initiates handling of identity verification if the kyc state is required,
   * otherwise returns the customer.
   *
   * Temporarily takes a Data object with the key
   * of the mock api response to receive.
   * */
  checkIdentityVerification(): void {
    const data = this.identityDataResponseForm.value;
    this.newRequest$.next(true); // Cancel previous request
    this.stopPolling();

    this.getCustomerList(data.customerData)
      .pipe(
        switchMap((list: CustomerList) => {
          return list.objects[0].kyc_state === 'required'
            ? this.handleIdentityVerification(data.identityData)
            : this.handleCustomer(list.objects[0]);
        }),
        catchError((err) => {
          //  handleError()
          return of(err);
        })
      )
      .subscribe((res) => {
        console.log(res);
      });
  }

  /*
   * Queries GET /api/identity_verifications for existing records
   *
   * If no records are found, a POST is made.
   * If state is 'storing' or 'processing' continue polling at the
   * interval until timeout.
   * */
  handleIdentityVerification(data: string): Observable<any> {
    this.startPolling();

    return timer(0, 1000).pipe(
      tap((value) => this.pollingTime$.next(value)),
      switchMap(() => this.getIdentityVerificationList(data)),
      switchMap((list: IdentityList) => {
        return list.total != 0
          ? of(list.objects[0])
          : this.postIdentityVerification('state_storing').pipe(
              map((list) => list.objects[0])
            );
      }),
      takeWhile((identity: Identity) => {
        return identity.state == 'storing' || identity.state == 'processing';
      }, true),
      takeUntil(
        merge(this.newRequest$, this.pollingSession$).pipe(
          tap(() => this.message$.next('Timeout'))
        )
      ),
      map((identity) => {
        switch (identity.state) {
          case 'storing':
            this.message$.next('Storing identity...');
            break;
          case 'waiting':
            this.stopPolling();
            this.message$.next('Launching identity verification...');
            this.bootstrapPersona(identity.persona_inquiry_id!);
            break;

          // SetTimeout for demonstration purposes only
          case 'executing':
            this.message$.next('Checking for session token...');
            setTimeout(() => {
              if (this.sessionToken) {
                this.message$.next('Session found, launching Persona');
                setTimeout(() => {
                  this.bootstrapPersona(identity.persona_inquiry_id!);
                }, 1000);
              } else {
                this.message$.next('No session found, launching Persona');
                this.stopPolling();
                this.bootstrapPersona(identity.persona_inquiry_id!);
              }
            }, 1000);
            break;
          case 'processing':
            this.message$.next('Processing verification...');
            break;
          case 'reviewing':
            this.stopPolling();
            this.message$.next('Inquiry undergoing manual review');
            break;
          case 'completed':
            this.stopPolling();
            this.message$.next('Identity verification completed');
            break;
          default:
            break;
        }
        return identity;
      })
    );
  }

  handleCustomer(customer: Customer): Observable<Customer> {
    this.message$.next(customer);
    return of(customer);
  }

  /*
   * Checks for an existing Persona client.
   *
   * If not found, it instantiates a new client.
   * if found, it checks for an existing session token and recovers the session.
   * */
  bootstrapPersona(templateId: string): void {
    if (!this.personaClient) {
      let script = this._renderer2.createElement('script');
      script.type = `text/javascript`;
      script.text = 'text';
      script.src = 'https://cdn.withpersona.com/dist/persona-v4.6.0.js';

      this._renderer2.appendChild(this._document.body, script);
      script.addEventListener('load', () => {
        // @ts-ignore
        this.personaClient = new Persona.Client({
          templateId: templateId,
          environment: 'sandbox',
          onReady: () => this.personaClient.open(),
          // @ts-ignore
          onComplete: ({ inquiryId, status, fields }) => {
            console.log(
              'onComplete',
              'inquiryId: ' + inquiryId,
              'status: ' + status,
              fields
            );
          },
          // @ts-ignore
          onCancel: ({ inquiryId, sessionToken }) => {
            this.sessionToken = sessionToken;
            this.message$.next({
              inquiryId: inquiryId,
              sessionToken: sessionToken
            });
          },
          // TODO Add error handling. What happens if the session token is invalid?
          onError: (error: any) => console.log(error)
        });
      });
    } else if (this.sessionToken) {
      this.personaClient.sessionToken = this.sessionToken;
      this.personaClient.open();
    } else {
      this.personaClient.open();
    }
  }

  startPolling(): void {
    this.isPolling$.next(true);
    this.pollingSubscription = this.pollingDuration$.subscribe({
      complete: () => {
        this.isPolling$.next(false);
        this.pollingSession$.next('');
      }
    });
  }

  stopPolling(): void {
    this.isPolling$.next(false);
    this.pollingSubscription.unsubscribe();
    this.pollingSession$.next('');
  }

  /*
   * These methods will be pulled from the client SDK
   * */
  getCustomerList(data: string): Observable<any> {
    return this.http.get(this.API_BASE_URL + 'customers', {
      headers: {
        data: data
      }
    });
  }

  getIdentityVerificationList(data: string): Observable<any> {
    return this.http.get(this.API_BASE_URL + 'identity_verifications', {
      headers: {
        data: data
      }
    });
  }

  postIdentityVerification(data: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        data: data
      })
    };
    return this.http.post(
      this.API_BASE_URL + 'identity_verifications',
      {},
      httpOptions
    );
  }
}
