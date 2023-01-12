import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

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
import { Poll, PollConfig } from '../../../shared/utility/poll/poll';

//Models
import {
  CustomerBankModel,
  IdentityVerificationBankModel,
  IdentityVerificationWithDetailsBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Utility
import { Constants } from '@constants';

@Component({
  selector: 'app-identity-verification',
  templateUrl: './identity-verification.component.html',
  styleUrls: ['./identity-verification.component.scss']
})
export class IdentityVerificationComponent implements OnInit, OnDestroy {
  identity$ =
    new BehaviorSubject<IdentityVerificationWithDetailsBankModel | null>(null);
  customer$ = new BehaviorSubject<CustomerBankModel | null>(null);

  isVerifying: boolean = false;
  isCanceled: boolean = false;
  isLoading$ = new BehaviorSubject(true);
  error$ = new BehaviorSubject(false);

  pollConfig: PollConfig = {
    timeout: this.error$,
    interval: Constants.POLL_INTERVAL,
    duration: Constants.POLL_DURATION
  };

  unsubscribe$ = new Subject();

  personaScriptSrc = Constants.PERSONA_SCRIPT_SRC;

  constructor(
    @Inject(DOCUMENT) public _document: Document,
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
    this.getCustomerStatus();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  getCustomerStatus(): void {
    const poll = new Poll(this.pollConfig);

    poll
      .start()
      .pipe(
        switchMap(() => this.identityVerificationService.getCustomer()),
        takeUntil(merge(poll.session$, this.unsubscribe$)),
        skipWhile((customer) => customer.state === 'storing'),
        map((customer) => {
          this.isVerifying = true;
          poll.stop();
          this.handleCustomerState(customer);
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

  handleCustomerState(customer: CustomerBankModel): void {
    switch (customer.state) {
      case 'unverified':
        this.verifyIdentity();
        break;
      case 'verified':
        this.customer$.next(customer);
        this.isLoading$.next(false);
        break;
      case 'rejected':
        this.customer$.next(customer);
        this.isLoading$.next(false);
        break;
      default:
        this.error$.next(true);
    }
  }

  verifyIdentity(): void {
    this.isLoading$.next(true);
    const poll = new Poll(this.pollConfig);

    poll
      .start()
      .pipe(
        switchMap(() =>
          this.identityVerificationService.getIdentityVerification()
        ),
        takeUntil(merge(poll.session$, this.unsubscribe$)),
        skipWhile((identity) => identity.state == 'storing'),
        map((identity) => {
          poll.stop();
          this.handleIdentityVerificationState(identity);
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
      case 'waiting':
        this.handlePersonaState(identity);
        break;
      case 'completed':
        this.isLoading$.next(false);
        this.identity$.next(identity);
        break;
    }
  }

  handlePersonaState(identity: IdentityVerificationWithDetailsBankModel): void {
    switch (identity.persona_state) {
      case 'waiting':
        this.bootstrapPersona(identity.persona_inquiry_id!);
        break;
      case 'pending':
        this.bootstrapPersona(identity.persona_inquiry_id!);
        break;
      case 'reviewing':
        this.identity$.next(identity);
        this.isLoading$.next(false);
        break;
      case 'processing':
        this.identity$.next(identity);
        this.isLoading$.next(false);
        break;
      case 'expired':
        this.getCustomerStatus();
        break;
      case 'completed':
        this.identity$.next(identity);
        this.isLoading$.next(false);
        break;
      case 'unknown':
        this.error$.next(true);
    }
  }

  getPersonaLanguageAlias(locale: string): string {
    return locale == 'fr-CA' ? 'fr' : locale;
  }

  personaOnReady(client: any) {
    this.identityVerificationService.setPersonaClient(client);
    client.open();
  }

  personaOnComplete(): void {
    this.verifyIdentity();
  }

  personaOnCancel(client: any): void {
    this.isCanceled = true;
    this.isLoading$.next(false);
    this.identityVerificationService.setPersonaClient(client);
  }

  personaOnError(error: any) {
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
            script.src = this.personaScriptSrc;
            this._renderer2.appendChild(this._document.body, script);

            script.addEventListener('load', () => {
              //@ts-ignore
              client = new Persona.Client({
                inquiryId: inquiryId,
                language: this.getPersonaLanguageAlias(config.locale),
                onReady: () => this.personaOnReady(client),
                onComplete: () => this.personaOnComplete(),
                onCancel: () => this.personaOnCancel(client),
                onError: (error: any) => this.personaOnError(error)
              });
            });
          } else {
            // Re-initialize local references and open client
            personaClient.options.language = this.getPersonaLanguageAlias(
              config.locale
            );
            personaClient.options.onComplete = () => this.personaOnComplete();
            personaClient.options.onCancel = () =>
              this.personaOnCancel(personaClient);
            personaClient.options.onError = (error: any) =>
              this.personaOnError(error);
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

  onComplete(): void {
    this.routingService.handleRoute({
      origin: 'identity-verification',
      route: 'price-list'
    });
  }

  onCancel(): void {
    this.routingService.handleRoute({
      origin: 'identity-verification',
      route: 'price-list'
    });
  }
}
