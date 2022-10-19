import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  merge,
  of,
  skipWhile,
  Subject,
  switchMap,
  take,
  takeUntil
} from 'rxjs';

// Services
import {
  ConfigService,
  ErrorService,
  EventService,
  IdentityVerificationService,
  RoutingService
} from '@services';
import { Poll } from '../../../shared/utility/poll/poll';

//Models
import { Customer } from '../../../shared/services/identity-verification/customer.model';
import { Identity } from '../../../shared/services/identity-verification/identity.model';

// Data
import CUSTOMER from '../../../shared/services/identity-verification/customer.data.json';
import IDENTITY from '../../../shared/services/identity-verification/identity.data.json';

@Component({
  selector: 'app-identity-verification',
  templateUrl: './identity-verification.component.html',
  styleUrls: ['./identity-verification.component.scss']
})
export class IdentityVerificationComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  customerDataResponseList = Object.keys(CUSTOMER);
  identityDataResponseList = Object.keys(IDENTITY);

  identity$ = new BehaviorSubject<Identity | null>(null);
  customer$ = new BehaviorSubject<Customer | null>(null);

  identityDataResponseForm!: FormGroup;

  isRecoverable$ = new BehaviorSubject(true);
  isLoading$ = new BehaviorSubject(true);
  timeout$ = new BehaviorSubject(false);

  poll = new Poll(this.timeout$);

  unsubscribe$ = new Subject();

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    public configService: ConfigService,
    private eventService: EventService,
    private errorService: ErrorService,
    private identityVerificationService: IdentityVerificationService,
    private routingService: RoutingService,
    private _renderer2: Renderer2
  ) {}

  ngOnInit(): void {
    this.initializeDataForms();
    this.getCustomerStatus();
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
      identityData: new FormControl(this.identityDataResponseList[0], {
        nonNullable: true
      })
    });

    // Reset component on input
    this.identityDataResponseForm.valueChanges.subscribe(() => {
      this.getCustomerStatus();

      this.customer$.next(null);
      this.identity$.next(null);
      this.isLoading$.next(true);
      this.timeout$.next(false);

      this.stepper.reset();
    });
  }

  getCustomerStatus(): void {
    console.log('\n');
    const data = this.identityDataResponseForm.value;

    this.identityVerificationService
      .getCustomer(data.customerData)
      .pipe(
        take(1),
        catchError((err) => {
          return of(err);
        })
      )
      .subscribe((customer) => {
        setTimeout(() => {
          this.customer$.next(customer);
          this.isLoading$.next(false);
        }, 500);
      });
  }

  verifyIdentity(): void {
    this.isLoading$.next(true);

    this.poll
      .start()
      .pipe(
        switchMap(() =>
          this.identityVerificationService.getIdentityVerification(
            this.identityDataResponseForm.value.identityData
          )
        ),
        takeUntil(merge(this.poll.session$, this.unsubscribe$)),
        // Continues polling if the verification is 'storing',
        // or if the Persona state is 'completed', but there is no 'outcome'
        skipWhile(
          (identity) =>
            identity.state == 'storing' ||
            (!identity.outcome && identity.persona_state == 'completed')
        ),
        map((identity) => {
          console.log(identity);
          this.poll.stop();
          this.handleOutcome(identity);
          this.identity$.next(identity);
        })
      )
      .subscribe();
  }

  handleOutcome(identity: Identity): void {
    switch (identity.state) {
      case 'completed':
        this.isLoading$.next(false);
        break;
      case 'waiting':
        this.handlePersonaState(identity);
        break;
    }
  }

  handlePersonaState(identity: Identity): void {
    switch (identity.persona_state) {
      case 'waiting':
        this.bootstrapPersona(identity.persona_inquiry_id!);
        break;
      case 'pending':
        this.bootstrapPersona(identity.persona_inquiry_id!);
        break;
      case 'reviewing':
        this.isLoading$.next(false);
        break;
      case 'unknown':
        this.timeout$.next(true);
    }
  }

  /**
   * Opens a Persona client with applicable configuration settings.
   * If no existing client is found, it instantiates a new client,
   * otherwise it checks for an existing client and recovers the session.
   *
   * @param {string} templateId - The template Id that Persona will use
   * to launch a certain flow.
   * */
  bootstrapPersona(templateId: string): void {
    this.identityVerificationService
      .getPersonaClient()
      .pipe(
        switchMap((personaClient) =>
          combineLatest([of(personaClient), this.configService.getConfig$()])
        ),
        take(1),
        map((obj) => {
          const [personaClient, config] = obj;

          // Alias for Persona language option
          const locale = () =>
            config.locale === 'fr-CA' ? 'fr' : config.locale;

          if (!personaClient) {
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
                language: locale(),
                onReady: () => {
                  this.identityVerificationService.setPersonaClient(client);
                  client.open();
                },
                onComplete: () => {
                  this.verifyIdentity();
                },
                onCancel: () => {
                  // Store current instance including session token
                  this.identityVerificationService.setPersonaClient(client);
                  this.isLoading$.next(false);
                  this.stepper.next();
                },
                onError: (error: any) => {
                  console.log(error);
                }
              });
            });
          } else {
            // Re-initialize local references
            personaClient.options.onComplete = () => {
              this.isLoading$.next(false);
            };
            personaClient.options.onCancel = () => {
              this.identityVerificationService.setPersonaClient(personaClient);
              this.isLoading$.next(false);
              this.stepper.next();
            };
            personaClient.options.language = locale();
            personaClient.open();
          }
        })
      )
      .subscribe();
  }
}
