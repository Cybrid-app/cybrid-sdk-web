import { Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  BanksService,
  PostWorkflowBankModel,
  WorkflowsService,
  WorkflowWithDetailsBankModel
} from '@cybrid/cybrid-api-bank-angular';

import {
  BankAccountService,
  CODE,
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

  internalRouting = false;
  routingData: RoutingData = {
    origin: 'bank-account-connect',
    route: 'price-list'
  };

  plaidScriptSrc = Constants.PLAID_SCRIPT_SRC;

  constructor(
    @Inject(DOCUMENT) public _document: Document,
    public configService: ConfigService,
    private errorService: ErrorService,
    private eventService: EventService,
    private bankAccountService: BankAccountService,
    private workflowService: WorkflowsService,
    private banksService: BanksService,
    private route: ActivatedRoute,
    private router: RoutingService,
    private _renderer2: Renderer2
  ) {}

  ngOnInit() {
    this.onAddAccount();
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
      // Ignore incomplete language types
      // @ts-ignore
      language: language,
      onSuccess: (public_token: string, metadata: any) => {
        this.plaidOnSuccess(public_token, metadata);
      },
      onLoad: () => {
        client.open();
      },
      onExit: (err: any) => this.plaidOnExit(client, err)
    });
  }

  plaidOnSuccess(public_token: string, metadata?: any): void {
    let customerGuid: string;

    // TODO: Test iso_currency_code out of sandbox. Set here to 'USD'
    const asset = 'USD';
    // const asset = metadata.accounts[0].iso_currency_code;
    const account = metadata.accounts[0];

    // Validate the asset is iso_currency
    if (asset) {
      this.configService
        .getConfig$()
        .pipe(
          switchMap((config) => {
            customerGuid = config.customer;
            return this.banksService.getBank(config.bank!);
          }),
          switchMap((bank) => {
            if (bank.supported_fiat_account_assets!.includes(asset)) {
              return this.bankAccountService.createExternalBankAccount(
                account.name,
                public_token,
                account.id,
                asset
              );
            } else return throwError(() => new Error());
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
        .subscribe(() => this.isLoading$.next(false));
    } else {
      this.error$.next(true);
    }
  }

  plaidOnExit(client: any, err?: any): void {
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
