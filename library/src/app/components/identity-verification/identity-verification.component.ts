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
import { ConfigService, IdentityVerificationService } from '@services';
import { Poll } from '../../../shared/utility/poll/poll.service';

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

  identity$ = new Subject<Identity | null>();
  customer$ = new Subject<Customer | null>();

  identityDataResponseForm!: FormGroup;

  isRecoverable$ = new BehaviorSubject(true);
  isLoading$ = new BehaviorSubject(true);
  timeout$ = new BehaviorSubject(false);

  poll = new Poll(this.timeout$);

  // personaClient: any = null;

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
      this.isLoading$.next(false);
      this.timeout$.next(false);
      this.customer$.next(null);
      this.identity$.next(null);

      this.stepper.previous();
      this.getCustomerStatus();
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
        this.customer$.next(customer);
        this.isLoading$.next(false);
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
        skipWhile(
          (identity) =>
            identity.state == 'storing' || identity.state == 'processing'
        )
      )
      .subscribe((identity) => {
        this.poll.stop();
        this.handleIdentityVerificationState(identity);
        this.identity$.next(identity);
      });
  }

  handleIdentityVerificationState(identity: Identity): void {
    switch (identity.state) {
      case 'waiting':
        this.bootstrapPersona(identity.persona_inquiry_id!);
        break;
      case 'executing':
        this.bootstrapPersona(identity.persona_inquiry_id!);
        break;
      case 'reviewing':
        this.isLoading$.next(false);
        break;
      case 'completed':
        this.isLoading$.next(false);
        break;
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
        take(1),
        switchMap((personaClient) =>
          combineLatest([of(personaClient), this.configService.getConfig$()])
        ),
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
                  this.isLoading$.next(false);
                },
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
