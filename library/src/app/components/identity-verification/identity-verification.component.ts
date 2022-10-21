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
  CODE,
  ConfigService,
  ErrorService,
  EventService,
  IdentityVerificationService,
  LEVEL,
  RoutingService
} from '@services';
import { Poll } from '../../../shared/utility/poll/poll';

//Models
import { IdentityVerificationBankModel } from '@cybrid/cybrid-api-bank-angular';

// Utility
import { Constants } from '@constants';
import CUSTOMER from '../../../shared/services/identity-verification/customer.data.json';

@Component({
  selector: 'app-identity-verification',
  templateUrl: './identity-verification.component.html',
  styleUrls: ['./identity-verification.component.scss']
})
export class IdentityVerificationComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  customerDataResponseList = Object.keys(CUSTOMER);

  identity$ = new BehaviorSubject<IdentityVerificationBankModel | null>(null);
  customer$ = new BehaviorSubject<any | null>(null);

  identityDataResponseForm!: FormGroup;

  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  error$ = new BehaviorSubject(false);

  poll = new Poll(this.error$);

  unsubscribe$ = new Subject();

  personaScriptSrc = Constants.PERSONA_SCRIPT_SRC;

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
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.COMPONENT_INIT,
      'Initializing identity-verification component'
    );
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
      })
    });

    // Reset component on input
    this.identityDataResponseForm.valueChanges.subscribe(() => {
      this.getCustomerStatus();

      this.customer$.next(null);
      this.identity$.next(null);
      this.isLoading$.next(true);
      this.error$.next(false);

      this.stepper.reset();
    });
  }

  getCustomerStatus(): void {
    const data = this.identityDataResponseForm.value;

    this.identityVerificationService
      .getCustomer(data.customerData)
      .pipe(
        take(1),
        map((customer) => {
          this.customer$.next(customer);
          this.isLoading$.next(false);
        }),
        catchError((err) => {
          this.error$.next(true);
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'There was an error fetching customer kyc status'
          );

          this.errorService.handleError(
            new Error('There was an error fetching customer kyc status')
          );
          return of(err);
        })
      )
      .subscribe();
  }

  verifyIdentity(): void {
    this.isLoading$.next(true);

    this.poll
      .start()
      .pipe(
        switchMap(() =>
          this.identityVerificationService.getIdentityVerification()
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
          this.poll.stop();
          this.handleIdentityVerificationState(identity);
          this.identity$.next(identity);
        }),
        catchError((err) => {
          this.error$.next(true);
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'There was an error fetching identity verification'
          );
          this.errorService.handleError(
            new Error('There was an error fetching identity verification')
          );
          return of(err);
        })
      )
      .subscribe();
  }

  handleIdentityVerificationState(
    identity: IdentityVerificationBankModel
  ): void {
    switch (identity.state) {
      case 'completed':
        this.isLoading$.next(false);
        break;
      case 'waiting':
        this.handlePersonaState(identity);
        break;
    }
  }

  handlePersonaState(identity: IdentityVerificationBankModel): void {
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
        this.error$.next(true);
    }
  }

  getPersonaLanguageAlias(locale: string): string {
    return locale == 'fr-CA' ? 'fr' : locale;
  }

  /**
   * Opens a Persona client with applicable configuration settings.
   * If no existing client is found, it instantiates a new client.
   *
   * @param {string} inquiryId - The template Id that Persona will use
   * to launch a certain flow.
   * */
  bootstrapPersona(inquiryId: string): void {
    this.identityVerificationService
      .getPersonaClient()
      .pipe(
        switchMap((personaClient) =>
          combineLatest([of(personaClient), this.configService.getConfig$()])
        ),
        take(1),
        map((obj) => {
          const [personaClient, config] = obj;

          if (!personaClient) {
            let client: any;
            let script = this._renderer2.createElement('script');
            script.type = `text/javascript`;
            script.text = 'text';
            script.src = this.personaScriptSrc;

            this._renderer2.appendChild(this._document.body, script);
            script.addEventListener('load', () => {
              // @ts-ignore
              client = new Persona.Client({
                inquiryId: inquiryId,
                language: this.getPersonaLanguageAlias(config.locale),
                onReady: () => {
                  this.identityVerificationService.setPersonaClient(client);
                  client.open();
                },
                onComplete: () => {
                  this.verifyIdentity();
                },
                onCancel: () => {
                  // Store current instance
                  this.identityVerificationService.setPersonaClient(client);
                  this.isLoading$.next(false);
                  this.stepper.next();
                },
                onError: (error: any) => {
                  this.error$.next(true);
                  this.eventService.handleEvent(
                    LEVEL.ERROR,
                    CODE.DATA_ERROR,
                    'There was an error in the Persona SDK',
                    error
                  );

                  this.errorService.handleError(
                    new Error(`There was an error in the Persona SDK: ${error}`)
                  );
                }
              });
            });
          } else {
            // Re-initialize local references
            personaClient.options.language = this.getPersonaLanguageAlias(
              config.locale
            );
            personaClient.options.onComplete = () => {
              this.isLoading$.next(false);
            };
            personaClient.options.onCancel = () => {
              this.identityVerificationService.setPersonaClient(personaClient);
              this.isLoading$.next(false);
              this.stepper.next();
            };
            personaClient.options.onError = (error: any) => {
              this.error$.next(true);
              this.eventService.handleEvent(
                LEVEL.ERROR,
                CODE.DATA_ERROR,
                'There was an error in the Persona SDK',
                error
              );
              this.errorService.handleError(
                new Error(`"There was an error in the Persona SDK: ${error}"`)
              );
            };
            personaClient.open();
          }
        }),
        catchError((err) => {
          this.error$.next(true);
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'There was an error launching the Persona SDK'
          );
          this.errorService.handleError(
            new Error('There was an error launching the Persona SDK')
          );
          return of(err);
        })
      )
      .subscribe();
  }
}
