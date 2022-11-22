import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { HttpLoaderFactory } from '../../../app/modules/library.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { BankAccountService, ConfigService } from '@services';
import { TestConstants } from '@constants';
import {
  ExternalBankAccountsService,
  PostWorkflowBankModel,
  WorkflowsService
} from '@cybrid/cybrid-api-bank-angular';

describe('BankAccountManagementService', () => {
  let service: BankAccountService;
  let MockConfigService = jasmine.createSpyObj('ConfigService', {
    getConfig$: of(TestConstants.CONFIG)
  });
  let MockExternalBankAccountService = jasmine.createSpyObj(
    'ExternalBankAccountsService',
    ['listExternalBankAccounts', 'createExternalBankAccount']
  );
  let MockWorkflowService = jasmine.createSpyObj('WorkflowsService', [
    'createWorkflow',
    'getWorkflow'
  ]);

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
        { provide: ConfigService, useValue: MockConfigService },
        {
          provide: ExternalBankAccountsService,
          useValue: MockExternalBankAccountService
        },
        { provide: WorkflowsService, useValue: MockWorkflowService }
      ]
    });
    service = TestBed.inject(BankAccountService);
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
    MockWorkflowService = TestBed.inject(WorkflowsService);
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

  it('should create a workflow', () => {
    const kind: PostWorkflowBankModel.KindEnum = 'link_token_create';

    service
      .createWorkflow(kind)
      .subscribe(() =>
        expect(MockWorkflowService.createWorkflow).toHaveBeenCalledWith(
          service.postWorkflowBankModel
        )
      );
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
