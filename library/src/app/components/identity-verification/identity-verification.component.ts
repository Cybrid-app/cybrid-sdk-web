import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
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
import { Poll, PollConfig } from '../../../shared/utility/poll/poll';

//Models
import {
  CustomerBankModel,
  IdentityVerificationBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Utility
import { Constants } from '@constants';

@Component({
  selector: 'app-identity-verification',
  templateUrl: './identity-verification.component.html',
  styleUrls: ['./identity-verification.component.scss']
})
export class IdentityVerificationComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  identity$ = new BehaviorSubject<IdentityVerificationBankModel | null>(null);
  customer$ = new BehaviorSubject<CustomerBankModel | null>(null);

  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
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
          poll.stop();
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
    const poll = new Poll(this.pollConfig);
    this.isLoading$.next(true);

    poll
      .start()
      .pipe(
        switchMap(() =>
          this.identityVerificationService.getIdentityVerification()
        ),
        takeUntil(merge(poll.session$, this.unsubscribe$)),
        // Continues polling if the verification is 'storing',
        // or if the Persona state is 'completed', but there is no 'outcome'
        skipWhile(
          (identity) =>
            identity.state == 'storing' ||
            (identity.state == 'waiting' &&
              identity.persona_state == 'completed')
        ),
        map((identity) => {
          poll.stop();
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

  personaOnReady(client: any) {
    this.identityVerificationService.setPersonaClient(client);
    client.open();
  }

  personaOnComplete(): void {
    this.verifyIdentity();
  }

  personaOnCancel(client: any): void {
    this.identityVerificationService.setPersonaClient(client);
    this.isLoading$.next(false);
    this.stepper.next();
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
