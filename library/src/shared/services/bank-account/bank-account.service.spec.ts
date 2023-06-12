import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { HttpLoaderFactory } from '../../../app/modules/library.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import {
  BankAccountService,
  ConfigService,
  ErrorService,
  EventService
} from '@services';
import { TestConstants } from '@constants';
import {
  ExternalBankAccountsService,
  PostWorkflowBankModel,
  WorkflowsService
} from '@cybrid/cybrid-api-bank-angular';

describe('BankAccountService', () => {
  let service: BankAccountService;
  let MockEventService = jasmine.createSpyObj('EventService', [
    'getEvent',
    'handleEvent'
  ]);
  let MockErrorService = jasmine.createSpyObj('ErrorService', [
    'getError',
    'handleError'
  ]);
  let MockConfigService = jasmine.createSpyObj('ConfigService', {
    getConfig$: of(TestConstants.CONFIG)
  });
  let MockExternalBankAccountService = jasmine.createSpyObj(
    'ExternalBankAccountsService',
    [
      'listExternalBankAccounts',
      'createExternalBankAccount',
      'patchExternalBankAccount',
      'deleteExternalBankAccount'
    ]
  );
  let MockWorkflowService = jasmine.createSpyObj('WorkflowsService', [
    'createWorkflow',
    'getWorkflow'
  ]);
  const error$ = throwError(() => {
    new Error('Error');
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        {
          provide: ExternalBankAccountsService,
          useValue: MockExternalBankAccountService
        },
        { provide: WorkflowsService, useValue: MockWorkflowService }
      ]
    });
    service = TestBed.inject(BankAccountService);
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockExternalBankAccountService = TestBed.inject(
      ExternalBankAccountsService
    );
    MockExternalBankAccountService.listExternalBankAccounts.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_LIST_BANK_MODEL)
    );
    MockExternalBankAccountService.createExternalBankAccount.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL)
    );
    MockExternalBankAccountService.patchExternalBankAccount.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL)
    );
    MockExternalBankAccountService.deleteExternalBankAccount.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL)
    );
    MockWorkflowService = TestBed.inject(WorkflowsService);
    MockWorkflowService.createWorkflow.and.returnValue(
      of(TestConstants.WORKFLOW_BANK_MODEL)
    );
    MockWorkflowService.getWorkflow.and.returnValue(
      of(TestConstants.WORKFLOW_BANK_MODEL_WITH_DETAILS)
    );
  });

  afterEach(() => {
    MockExternalBankAccountService.listExternalBankAccounts.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_LIST_BANK_MODEL)
    );
    MockExternalBankAccountService.createExternalBankAccount.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL)
    );
    MockExternalBankAccountService.patchExternalBankAccount.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL)
    );
    MockExternalBankAccountService.deleteExternalBankAccount.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL)
    );
    MockWorkflowService.createWorkflow.and.returnValue(
      of(TestConstants.WORKFLOW_BANK_MODEL)
    );
    MockWorkflowService.getWorkflow.and.returnValue(
      of(TestConstants.WORKFLOW_BANK_MODEL_WITH_DETAILS)
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list external bank accounts', () => {
    // Default
    service
      .listExternalBankAccounts()
      .subscribe((res) =>
        expect(res).toEqual(TestConstants.EXTERNAL_BANK_ACCOUNT_LIST_BANK_MODEL)
      );

    // With page parameters
    const page = '2';
    const perPage = '20';

    service
      .listExternalBankAccounts(page, perPage)
      .subscribe(() =>
        expect(
          MockExternalBankAccountService.listExternalBankAccounts
        ).toHaveBeenCalledWith(
          page,
          perPage,
          undefined,
          undefined,
          TestConstants.CONFIG.customer
        )
      );
  });

  it('should create an external bank account', () => {
    const name = '';
    const plaid_public_token = '';
    const plaid_account_id = '';
    const asset = '';

    let postExternalBankAccountModel = {
      ...service.postExternalBankAccountModel
    };

    postExternalBankAccountModel.name = name;
    postExternalBankAccountModel.plaid_public_token = plaid_public_token;
    postExternalBankAccountModel.plaid_account_id = plaid_account_id;
    postExternalBankAccountModel.asset = asset;

    service
      .createExternalBankAccount(
        name,
        plaid_public_token,
        plaid_account_id,
        asset
      )
      .subscribe(() =>
        expect(
          MockExternalBankAccountService.createExternalBankAccount
        ).toHaveBeenCalledWith(postExternalBankAccountModel)
      );
  });

  it('should patch an external bank account', () => {
    service.patchExternalBankAccount('').subscribe();
    expect(
      MockExternalBankAccountService.patchExternalBankAccount
    ).toHaveBeenCalled();
  });

  it('should catch any errors on patchExternalBankAccount()', () => {
    MockExternalBankAccountService.patchExternalBankAccount.and.returnValue(
      error$
    );

    service.patchExternalBankAccount('').subscribe();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should delete an external bank account', () => {
    service.deleteExternalBankAccount('').subscribe();
    expect(
      MockExternalBankAccountService.deleteExternalBankAccount
    ).toHaveBeenCalled();
  });

  it('should catch any errors on deleteExternalBankAccount()', () => {
    MockExternalBankAccountService.deleteExternalBankAccount.and.returnValue(
      error$
    );

    service.deleteExternalBankAccount('').subscribe();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should create a link_token_create workflow', () => {
    const kind: PostWorkflowBankModel.KindEnum = 'link_token_create';

    service
      .createWorkflow(kind)
      .subscribe(() =>
        expect(MockWorkflowService.createWorkflow).toHaveBeenCalledWith(
          service.postWorkflowBankModel
        )
      );
  });

  it('should create a link_token_update workflow', () => {
    const kind: PostWorkflowBankModel.KindEnum = 'link_token_update';
    const externalBankAccountGuid = '';

    const postWorkflowBankModel: PostWorkflowBankModel = {
      type: 'plaid',
      kind: kind,
      customer_guid: '',
      external_bank_account_guid: externalBankAccountGuid,
      link_customization_name: 'default',
      language: 'en',
      redirect_uri: TestConstants.CONFIG.redirectUri
    };

    service
      .createWorkflow(kind, externalBankAccountGuid)
      .subscribe(() =>
        expect(MockWorkflowService.createWorkflow).toHaveBeenCalledWith(
          postWorkflowBankModel
        )
      );
  });

  it('should catch any errors on createExternalBankAccount()', () => {
    MockExternalBankAccountService.createExternalBankAccount.and.returnValue(
      error$
    );

    service.createExternalBankAccount('', '', '', '').subscribe();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
  });

  it('should catch any errors on creating a link_token_create workflow', () => {
    MockWorkflowService.createWorkflow.and.returnValue(error$);

    service.createWorkflow(PostWorkflowBankModel.KindEnum.Create).subscribe();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
  });

  it('should catch any errors on creating a link_token_update workflow', () => {
    MockWorkflowService.createWorkflow.and.returnValue(error$);

    service
      .createWorkflow(PostWorkflowBankModel.KindEnum.Create, '')
      .subscribe();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
  });

  it('should get a workflow', () => {
    service.getWorkflow('').subscribe((res) => {
      expect(res).toEqual(TestConstants.WORKFLOW_BANK_MODEL_WITH_DETAILS);
    });
  });

  it('should set the Plaid client status', () => {
    const plaidClientSpy = spyOn(service.plaidClient, 'next');

    service.setPlaidClient(true);
    expect(plaidClientSpy).toHaveBeenCalledWith(true);
  });

  it('should get the Plaid client status', () => {
    const status = service.plaidClient.value;

    service.getPlaidClient().subscribe((res) => expect(res).toEqual(status));
  });
});
