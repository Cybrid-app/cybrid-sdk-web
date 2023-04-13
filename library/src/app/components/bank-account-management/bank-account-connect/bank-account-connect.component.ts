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
  CustomersService,
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
import { MatDialog } from '@angular/material/dialog';
import { BankAccountConfirmComponent } from '../bank-account-confirm/bank-account-confirm.component';
import { ActivatedRoute, NavigationExtras } from '@angular/router';

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
    route: 'bank-account-list'
  };

  params: NavigationExtras | undefined;

  mobile$: BehaviorSubject<boolean | null> = new BehaviorSubject<
    boolean | null
  >(null);

  plaidScriptSrc = Constants.PLAID_SCRIPT_SRC;

  constructor(
    @Inject(DOCUMENT) public _document: Document,
    public configService: ConfigService,
    private errorService: ErrorService,
    private eventService: EventService,
    private bankAccountService: BankAccountService,
    private workflowService: WorkflowsService,
    private customersService: CustomersService,
    private router: RoutingService,
    private route: ActivatedRoute,
    private _renderer2: Renderer2,
    private platform: Platform,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.COMPONENT_INIT,
      'Initializing bank-account-connect component'
    );
    if (this.isMobile()) {
      this.mobile$.next(true);
    } else this.checkSupportedFiatAssets();
  }

  isMobile(): boolean {
    return this.platform.IOS || this.platform.ANDROID;
  }

  checkSupportedFiatAssets(): void {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        map((config) => {
          if (config.fiat!.length == 0) {
            this.error$.next(true);
            const message = 'Fiat currency code is missing';
            this.eventService.handleEvent(
              LEVEL.ERROR,
              CODE.CONFIG_ERROR,
              message
            );
            this.errorService.handleError(new Error(message));
          } else {
            this.onAddAccount();
          }
        })
      )
      .subscribe();
  }

  onAddAccount(): void {
    this.route.queryParams
      .pipe(
        take(1),
        switchMap((params) => {
          const externalBankAccountGuid = params['externalBankAccountGuid'];
          this.params = externalBankAccountGuid;

          return externalBankAccountGuid
            ? this.createWorkflow(
                PostWorkflowBankModel.KindEnum.Update,
                externalBankAccountGuid
              )
            : this.createWorkflow(PostWorkflowBankModel.KindEnum.Create);
        }),
        map((workflow) => {
          this.bootstrapPlaid(workflow.plaid_link_token!);
        }),
        catchError((err: any) => {
          this.error$.next(true);
          return of(err);
        })
      )
      .subscribe();
  }

  getCurrencyCode(code: string): Observable<string | undefined> {
    return this.dialog
      .open(BankAccountConfirmComponent, {
        data: code
      })
      .afterClosed()
      .pipe(take(1));
  }

  createWorkflow(
    kind: PostWorkflowBankModel.KindEnum,
    externalAccountGuid?: string
  ): Observable<WorkflowWithDetailsBankModel> {
    const poll = new Poll(this.pollConfig);
    let workflow_guid: string;

    return this.bankAccountService
      .createWorkflow(kind, externalAccountGuid)
      .pipe(
        map((workflow) => (workflow_guid = workflow.guid!)),
        switchMap(() => poll.start()),
        takeUntil(merge(poll.session$, this.unsubscribe$)),
        switchMap(() => this.bankAccountService.getWorkflow(workflow_guid)),
        skipWhile((workflow) => !workflow.plaid_link_token),
        tap(() => poll.stop())
      );
  }

  createExternalBankAccount(
    account: any,
    public_token: string,
    code: string
  ): void {
    this.bankAccountService
      .createExternalBankAccount(account.name, public_token, account.id, code)
      .pipe(
        map(() => this.isLoading$.next(false)),
        catchError((err: any) => {
          this.error$.next(true);
          return of(err);
        })
      )
      .subscribe();
  }

  bootstrapPlaid(linkToken: string): void {
    combineLatest([
      this.bankAccountService.getPlaidClient(),
      this.configService.getConfig$().pipe(take(1))
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
    // @ts-ignore
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

  plaidOnSuccess(public_token: string, metadata?: any) {
    if (this.params != null) {
      this.bankAccountService
        .patchExternalBankAccount(<string>this.params)
        .pipe(
          map(() => this.isLoading$.next(false)),
          catchError((err) => {
            this.error$.next(true);
            return of(err);
          })
        )
        .subscribe();
    } else if (!this.params && metadata.accounts.length > 1) {
      this.error$.next(true);
      this.eventService.handleEvent(
        LEVEL.ERROR,
        CODE.DATA_ERROR,
        'Multiple accounts unsupported, select only one account'
      );
      this.errorService.handleError(
        new Error('Multiple accounts unsupported, select only one account')
      );
    } else if (!this.params && metadata.accounts.length == 1) {
      let account = metadata.accounts[0];

      this.configService
        .getConfig$()
        .pipe(
          take(1),
          switchMap((config) => {
            if (account.iso_currency_code) {
              return config.fiat.includes(account.iso_currency_code)
                ? of(account.iso_currency_code)
                : throwError(() => new Error('Unsupported asset'));
            } else {
              return this.getCurrencyCode(config.fiat);
            }
          }),
          map((code) => {
            if (code) {
              this.createExternalBankAccount(account, public_token, code);
            } else {
              this.stepper.next();
            }
          }),
          catchError((err: any) => {
            this.error$.next(true);
            return of(err);
          })
        )
        .subscribe();
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
