import { Injectable, OnDestroy } from '@angular/core';

import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  Subject,
  takeUntil
} from 'rxjs';

import {
  ExternalBankAccountListBankModel,
  ExternalBankAccountsService,
  PostExternalBankAccountBankModel,
  PostWorkflowBankModel,
  WorkflowBankModel,
  WorkflowsService,
  WorkflowWithDetailsBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  CODE,
  ConfigService,
  ErrorService,
  EventService,
  LEVEL
} from '@services';

// Utility
import { getLanguageFromLocale } from '../../utility/locale-language';

@Injectable({
  providedIn: 'root'
})
export class BankAccountService implements OnDestroy {
  plaidClient: BehaviorSubject<boolean> = new BehaviorSubject(false);
  customerGuid: string = '';

  postExternalBankAccountModel: PostExternalBankAccountBankModel = {
    name: '',
    account_kind: 'plaid',
    customer_guid: '',
    asset: ''
  };

  postWorkflowBankModel: PostWorkflowBankModel = {
    type: 'plaid',
    kind: PostWorkflowBankModel.KindEnum.Create,
    customer_guid: '',
    external_bank_account_guid: undefined,
    link_customization_name: 'default'
  };

  config$ = this.configService.getConfig$();

  unsubscribe$ = new Subject();

  constructor(
    private configService: ConfigService,
    private externalBankAccountService: ExternalBankAccountsService,
    private workflowService: WorkflowsService,
    private eventService: EventService,
    private errorService: ErrorService
  ) {
    this.setModels();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  setModels(): void {
    this.configService
      .getConfig$()
      .pipe(
        takeUntil(this.unsubscribe$),
        map((config) => {
          this.customerGuid = config.customer;

          this.postExternalBankAccountModel.customer_guid = config.customer;
          this.postWorkflowBankModel.customer_guid = config.customer;
          this.postWorkflowBankModel.language = getLanguageFromLocale(
            config.locale
          ) as PostWorkflowBankModel.LanguageEnum;
        })
      )
      .subscribe();
  }

  listExternalBankAccounts(
    page?: string,
    perPage?: string
  ): Observable<ExternalBankAccountListBankModel> {
    return this.externalBankAccountService.listExternalBankAccounts(
      page,
      perPage,
      undefined,
      undefined,
      this.customerGuid
    );
  }

  createExternalBankAccount(
    name: string,
    plaid_public_token: string,
    plaid_account_id: string,
    asset: string
  ) {
    const postExternalBankAccount = { ...this.postExternalBankAccountModel };
    postExternalBankAccount.name = name;
    postExternalBankAccount.plaid_public_token = plaid_public_token;
    postExternalBankAccount.plaid_account_id = plaid_account_id;
    postExternalBankAccount.asset = asset;

    return this.externalBankAccountService
      .createExternalBankAccount(postExternalBankAccount)
      .pipe(
        catchError((err: any) => {
          let message = 'There was an error creating a bank account';
          this.eventService.handleEvent(LEVEL.ERROR, CODE.DATA_ERROR, message);
          this.errorService.handleError(new Error(message));
          return of(err);
        })
      );
  }

  createWorkflow(
    kind: PostWorkflowBankModel.KindEnum,
    externalAccountGuid?: string
  ): Observable<WorkflowBankModel> {
    const postWorkflowBankModel = { ...this.postWorkflowBankModel };
    postWorkflowBankModel.kind = kind;
    postWorkflowBankModel.external_bank_account_guid = externalAccountGuid;
    return this.workflowService.createWorkflow(postWorkflowBankModel).pipe(
      catchError((err: any) => {
        let message =
          externalAccountGuid == undefined
            ? 'There was an error reconnecting a bank account'
            : 'There was an error creating a bank account';
        this.eventService.handleEvent(LEVEL.ERROR, CODE.DATA_ERROR, message);
        this.errorService.handleError(new Error(message));
        return of(err);
      })
    );
  }

  getWorkflow(guid: string): Observable<WorkflowWithDetailsBankModel> {
    return this.workflowService.getWorkflow(guid);
  }

  setPlaidClient(state: boolean): void {
    this.plaidClient.next(state);
  }

  getPlaidClient(): Observable<boolean> {
    return this.plaidClient.asObservable();
  }
}
