import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';

import {
  BehaviorSubject,
  catchError,
  identity,
  iif,
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
import { ConfigService, IdentityVerificationService } from '@services';

//Models
import { Customer } from '../../../shared/services/identity-verification/customer.model';
import { Identity } from '../../../shared/services/identity-verification/identity.model';

// Data
import CUSTOMER from '../../../shared/services/identity-verification/customer.data.json';
import IDENTITY from '../../../shared/services/identity-verification/identity.data.json';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-identity-verification',
  templateUrl: './identity-verification.component.html',
  styleUrls: ['./identity-verification.component.scss']
})
export class IdentityVerificationComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  customerDataResponseList = Object.keys(CUSTOMER);
  identityDataResponseList = Object.keys(IDENTITY);

  identity$ = new Subject<Identity>();
  customer$ = new Subject<Customer | null>();

  identityDataResponseForm!: FormGroup;

  isRecoverable$ = new BehaviorSubject(true);
  isLoading$ = new BehaviorSubject(true);
  error$ = new BehaviorSubject(false);

  // Todo: Add a constant for general polling interval
  pollingDuration$ = timer(5000);
  pollingSession$ = new Subject();
  pollingSubscription = new Subscription();
  pollingTime$ = new Subject<number>();

  personaClient: any = null;

  locale!: string;

  unsubscribe$ = new Subject();

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _renderer2: Renderer2,
    private identityVerificationService: IdentityVerificationService,
    public configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.initializeDataForms();
    this.getCustomerStatus();

    this.identityVerificationService
      .getPersonaClient()
      .pipe(
        takeUntil(this.unsubscribe$),
        map((client) => {
          this.personaClient = client;
          return client;
        })
      )
      .subscribe((res) => console.log('Persona client: ', res));

    this.configService
      .getConfig$()
      .pipe(
        takeUntil(this.unsubscribe$),
        map((config) => {
          config.locale === 'fr-CA'
            ? (this.locale = 'fr') // Alias for Persona language parameter
            : (this.locale = config.locale);
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  initializeDataForms(): void {
    this.identityDataResponseForm = new FormGroup({
      customerData: new FormControl(this.customerDataResponseList[2], {
        nonNullable: true
      }),
      identityData: new FormControl(this.identityDataResponseList[1], {
        nonNullable: true
      })
    });
  }

  getCustomerStatus(): void {
    const data = this.identityDataResponseForm.value;
    this.customer$.next(null);
    this.isLoading$.next(true);

    this.identityVerificationService
      .getCustomer(data.customerData)
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((err) => {
          //  handleError()
          return of(err);
        })
      )
      .subscribe((customer) => {
        setTimeout(() => {
          console.log('Customer: ', customer);
          this.customer$.next(customer);
          this.isLoading$.next(false);
        }, 1000);
      });
  }

  verifyIdentity(): void {
    this.startPolling()
      .pipe(
        switchMap(() =>
          this.identityVerificationService.getIdentityVerification(
            this.identityDataResponseForm.value.identityData
          )
        ),
        takeWhile(
          (identity) =>
            identity.state == 'storing' || identity.state == 'processing',
          true
        ),
        takeUntil(merge(this.pollingSession$, this.unsubscribe$))
      )
      .subscribe((identity) => {
        console.log('Identity: ', identity);
        this.handleIdentityVerificationState(identity);
        this.identity$.next(identity);
      });
  }

  handleIdentityVerificationState(identity: Identity): void {
    switch (identity.state) {
      case 'waiting':
        this.stopPolling();
        this.bootstrapPersona(identity.persona_inquiry_id!);
        break;
      case 'executing':
        this.stopPolling();
        this.bootstrapPersona(identity.persona_inquiry_id!);
        break;
      case 'reviewing':
        this.stopPolling();
        this.isLoading$.next(false);
        break;
      case 'completed':
        this.stopPolling();
        this.isLoading$.next(false);
        break;
    }
  }

  /**
   * Checks for an existing Persona client.
   *
   * If not found, it instantiates a new client.
   * if found, it checks for an existing client and recovers the session.
   * */
  bootstrapPersona(templateId: string): void {
    if (!this.personaClient) {
      let client: any;
      let script = this._renderer2.createElement('script');
      script.type = `text/javascript`;
      script.text = 'text';
      script.src = 'https://cdn.withpersona.com/dist/persona-v4.6.0.js';

      this._renderer2.appendChild(this._document.body, script);
      script.addEventListener('load', () => {
        // @ts-ignore
        client = new Persona.Client({
          templateId: templateId,
          environment: 'sandbox',
          language: this.locale,
          onReady: () => {
            this.identityVerificationService.setPersonaClient(client);
            client.open();
          },
          // @ts-ignore
          onComplete: () => {
            this.isLoading$.next(false);
          },
          // TODO Map to actual component cancel instead of error state
          // @ts-ignore
          onCancel: () => {
            // Store current instance including session token
            this.identityVerificationService.setPersonaClient(client);
            this.isLoading$.next(false);
            this.stepper.next();
          },
          // TODO Add error handling. What happens if the session token is invalid?
          onError: (error: any) => console.log(error)
        });
      });
    } else {
      // Re-initialize local references
      this.personaClient.options.onComplete = () => {
        this.isLoading$.next(false);
      };
      this.personaClient.options.onCancel = () => {
        this.identityVerificationService.setPersonaClient(this.personaClient);
        this.isLoading$.next(false);
        this.stepper.next();
      };
      this.personaClient.options.language = this.locale;
      this.personaClient.open();
    }
  }
  // @ts-ignore-end

  startPolling(): Observable<number> {
    this.isLoading$.next(true);
    this.pollingSubscription = this.pollingDuration$.subscribe({
      complete: () => {
        this.isLoading$.next(false);
        this.error$.next(true);
        this.pollingSession$.next('');
      }
    });

    return timer(0, 1000);
  }

  stopPolling() {
    this.pollingSubscription.unsubscribe();
    this.pollingSession$.next('');
  }
}
