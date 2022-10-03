import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';

import {
  BehaviorSubject,
  catchError,
  map,
  merge,
  Observable,
  of,
  repeat,
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
import { Customer } from '../../../shared/services/identity-verification/customer.model';
import { Identity } from '../../../shared/services/identity-verification/identity.model';

// Data
import IDENTITY from '../../../shared/services/identity-verification/identity.data.json';
import CUSTOMER from '../../../shared/services/identity-verification/customer.data.json';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-identity-verification',
  templateUrl: './identity-verification.component.html',
  styleUrls: ['./identity-verification.component.scss']
})
export class IdentityVerificationComponent implements OnInit {
  API_BASE_URL = 'http://localhost:8888/api/';

  customerDataResponseList = Object.keys(CUSTOMER);
  identityDataResponseList = Object.keys(IDENTITY);

  identityDataResponceForm!: FormGroup;

  message$ = new Subject();
  isLoading$ = new BehaviorSubject(false);
  isPolling$ = new BehaviorSubject(false);
  newRequest$ = new Subject();

  // Todo: Add a constant for general polling interval
  pollingInterval$ = timer(5000);
  pollingSession$ = new Subject();
  pollingSubscription = new Subscription();

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

  /*
   * Initiates handling of identity verification if the kyc state is required,
   * otherwise returns the customer.
   *
   * Temporarily takes a Data object with the key
   * of the mock api response to receive.
   * */
  checkIdentityVerification(): void {
    const data = this.identityDataResponceForm.value;
    this.newRequest$.next(true); // Cancel previous request
    this.pollingSubscription.unsubscribe();

    this.getCustomer(data.customerData)
      .pipe(
        switchMap((customer: Customer) => {
          return customer.kyc_state === 'required'
            ? this.handleIdentityVerification(data.identityData)
            : this.handleCustomer(customer);
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

  handleIdentityVerification(data: string): Observable<any> {
    this.startPollingSession();

    return this.http
      .get(this.API_BASE_URL + 'identity_verifications', {
        headers: {
          data: data
        }
      })
      .pipe(
        repeat({ delay: 1000 }),
        map((res) => res as Identity),
        takeWhile((identity) => {
          return identity.state == 'storing' || identity.state == 'processing';
        }, true),
        // Cancel subscription on: new request or when completing the polling interval
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
              this.stopPollingSession();
              this.message$.next('Launching Identity Verification');
              this.bootstrapPersona(identity.persona_inquiry_id!);
              break;
            case 'executing':
              this.stopPollingSession();
              this.message$.next('Checking for session token...');
              if (this.sessionToken) {
                this.message$.next('Session found, launching Persona');
                this.bootstrapPersona(identity.persona_inquiry_id!);
              }
              break;
            case 'processing':
              this.message$.next('Processing verification...');
              break;
            case 'reviewing':
              this.stopPollingSession();
              this.message$.next('Inquiry undergoing manual review');
              break;
            case 'completed':
              this.stopPollingSession();
              this.message$.next('Identity verification completed');
              break;
            default:
              break;
          }
          return identity;
        })
      );
  }

  /*
   * This method will be pulled from the client SDK
   * */
  getCustomer(data: string): Observable<any> {
    return this.http.get(this.API_BASE_URL + 'customers', {
      headers: {
        data: data
      }
    });
  }

  initializeDataForms(): void {
    this.identityDataResponceForm = new FormGroup({
      customerData: new FormControl(this.customerDataResponseList[0], {
        nonNullable: true
      }),
      identityData: new FormControl(this.identityDataResponseList[0], {
        nonNullable: true
      })
    });
  }

  startPollingSession(): void {
    this.isPolling$.next(true);
    this.pollingSubscription = this.pollingInterval$.subscribe({
      complete: () => {
        this.isPolling$.next(false);
        this.pollingSession$.next('');
      }
    });
  }

  stopPollingSession(): void {
    this.isPolling$.next(false);
    this.pollingSubscription.unsubscribe();
  }

  handleCustomer(customer: Customer): Observable<Customer> {
    this.message$.next(customer);
    return of(customer);
  }

  bootstrapPersona(templateId: string): void {
    this.message$.next('Launching Persona...');

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
          onError: (error: any) => console.log(error)
        });
      });
    } else {
      this.personaClient.sessionToken = this.sessionToken;
      this.personaClient.open();
    }
  }
}
