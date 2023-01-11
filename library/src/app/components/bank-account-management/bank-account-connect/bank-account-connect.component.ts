import { Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { MatStepper } from '@angular/material/stepper';

import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  merge,
  Observable,
  of,
  skipWhile,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  throwError
} from 'rxjs';

// Services
import {
  BankBankModel,
  BanksService,
  CustomersService,
  PostWorkflowBankModel,
  WorkflowsService,
  WorkflowWithDetailsBankModel
} from '@cybrid/cybrid-api-bank-angular';

import {
  BankAccountService,
  CODE,
  ComponentConfig,
  ConfigService,
  ErrorService,
  EventService,
  LEVEL,
  RoutingData,
  RoutingService
} from '@services';

// Utility
import { Constants } from '@constants';
import { Poll, PollConfig } from '../../../../shared/utility/poll/poll';
import { getLanguageFromLocale } from '../../../../shared/utility/locale-language';

@Component({
  selector: 'app-bank-account-connect',
  templateUrl: './bank-account-connect.component.html',
  styleUrls: ['./bank-account-connect.component.scss']
})
export class BankAccountConnectComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  isLoading$ = new BehaviorSubject(true);

  isRecoverable$ = new BehaviorSubject(true);
  error$ = new BehaviorSubject(false);
  unsubscribe$ = new Subject();

  pollConfig: PollConfig = {
    timeout: this.error$,
    interval: Constants.POLL_INTERVAL,
    duration: Constants.POLL_DURATION
  };

  routingData: RoutingData = {
    origin: 'bank-account-connect',
    route: 'price-list'
  };

  mobile$: BehaviorSubject<boolean | null> = new BehaviorSubject<
    boolean | null
  >(null);

  plaidScriptSrc = Constants.PLAID_SCRIPT_SRC;

  config!: ComponentConfig;

  constructor(
    @Inject(DOCUMENT) public _document: Document,
    public configService: ConfigService,
    private errorService: ErrorService,
    private eventService: EventService,
    private bankAccountService: BankAccountService,
    private workflowService: WorkflowsService,
    private customersService: CustomersService,
    private banksService: BanksService,
    private router: RoutingService,
    private _renderer2: Renderer2,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.COMPONENT_INIT,
      'Initializing bank-account-connect component'
    );
    if (this.isMobile()) {
      this.mobile$.next(true);
    } else this.onAddAccount();

    this.configService
      .getConfig$()
      .pipe(
        take(1),
        map((config) => (this.config = config))
      )
      .subscribe();
  }

  isMobile(): boolean {
    return this.platform.IOS || this.platform.ANDROID;
  }

  onAddAccount(): void {
    this.createWorkflow(PostWorkflowBankModel.KindEnum.Create)
      .pipe(
        map((workflow) => {
          this.bootstrapPlaid(workflow.plaid_link_token!);
        }),
        catchError((err: any) => {
          this.error$.next(true);
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'There was an error creating a bank account'
          );

          this.errorService.handleError(
            new Error('There was an error creating a bank account')
          );
          return of(err);
        })
      )
      .subscribe();
  }

  createWorkflow(
    kind: PostWorkflowBankModel.KindEnum
  ): Observable<WorkflowWithDetailsBankModel> {
    const poll = new Poll(this.pollConfig);
    let workflow_guid: string;

    return this.bankAccountService.createWorkflow(kind).pipe(
      map((workflow) => (workflow_guid = workflow.guid!)),
      switchMap(() => poll.start()),
      takeUntil(merge(poll.session$, this.unsubscribe$)),
      switchMap(() => this.bankAccountService.getWorkflow(workflow_guid)),
      skipWhile((workflow) => !workflow.plaid_link_token),
      tap(() => poll.stop())
    );
  }

  bootstrapPlaid(linkToken: string): void {
    combineLatest([
      this.bankAccountService.getPlaidClient(),
      this.configService.getConfig$()
    ])
      .pipe(
        take(1),
        map((obj) => {
          const [plaidClient, config] = obj;
          const language = getLanguageFromLocale(config.locale);

          if (!plaidClient) {
            this.bankAccountService.setPlaidClient(true);

            let script = this._renderer2.createElement('script');
            script.src = this.plaidScriptSrc;
            this._renderer2.appendChild(this._document.body, script);

            // Handle error loading the Plaid script
            script.onerror = () => {
              this.error$.next(true);
            };

            script.addEventListener('load', () => {
              this.plaidCreate(linkToken, language);
            });
          } else this.plaidCreate(linkToken, language);
        }),
        catchError((err) => {
          this.error$.next(true);
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'There was an error launching the Plaid SDK'
          );
          this.errorService.handleError(
            new Error('There was an error launching the Plaid SDK')
          );
          return of(err);
        })
      )
      .subscribe();
  }

  plaidCreate(linkToken: string, language: string) {
    //@ts-ignore
    const client = Plaid.create({
      token: linkToken,
      language: language,
      onSuccess: (public_token: string, metadata: any) => {
        this.plaidOnSuccess(public_token, metadata);
      },
      onLoad: () => {
        client.open();
      },
      onExit: (err: any) => this.plaidOnExit(err)
    });
  }

  plaidOnSuccess(public_token: string, metadata?: any): void {
    if (metadata.accounts.length == 1) {
      const account = metadata.accounts[0];

      this.configService
        .getBank$()
        .pipe(
          take(1),
          switchMap((bank) => {
            // Default asset to 'USD' for non-production banks
            const asset =
              bank.type == BankBankModel.TypeEnum.Sandbox
                ? bank.supported_fiat_account_assets![0]
                : account.iso_currency_code;

            if (bank.supported_fiat_account_assets!.includes(asset)) {
              return this.bankAccountService.createExternalBankAccount(
                account.name,
                public_token,
                account.id,
                asset
              );
            } else return throwError(() => new Error('Unsupported asset'));
          }),
          catchError((err: any) => {
            this.error$.next(true);
            this.eventService.handleEvent(
              LEVEL.ERROR,
              CODE.DATA_ERROR,
              err.message
            );

            this.errorService.handleError(
              new Error('There was an error creating a bank account')
            );
            return of(err);
          })
        )
        .subscribe(() => this.isLoading$.next(false));
    } else {
      this.error$.next(true);
      this.eventService.handleEvent(
        LEVEL.ERROR,
        CODE.DATA_ERROR,
        'Multiple accounts unsupported, select only one account'
      );
      this.errorService.handleError(
        new Error('Multiple accounts unsupported, select only one account')
      );
    }
  }

  plaidOnExit(err?: any): void {
    if (err) {
      this.error$.next(true);
      this.eventService.handleEvent(
        LEVEL.ERROR,
        CODE.DATA_ERROR,
        'There was an error in the Plaid SDK',
        err
      );
      this.errorService.handleError(
        new Error('There was an error in the Plaid SDK')
      );
    } else {
      this.stepper.next();
    }
  }

  onComplete(): void {
    this.router.handleRoute(this.routingData);
  }
}
