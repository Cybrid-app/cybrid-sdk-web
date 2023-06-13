import { CUSTOM_ELEMENTS_SCHEMA, Renderer2 } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '../../../../shared/modules/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

// Services
import {
  BankAccountService,
  ConfigService,
  ErrorService,
  EventService,
  RoutingService
} from '@services';

// Components
import { BankAccountConnectComponent } from '@components';

// Utility
import { TestConstants } from '@constants';
import { MatDialog } from '@angular/material/dialog';
import { PostWorkflowBankModel } from '@cybrid/cybrid-api-bank-angular';
import { MatStepper } from '@angular/material/stepper';

describe('BankAccountConnectComponent', () => {
  let component: BankAccountConnectComponent;
  let fixture: ComponentFixture<BankAccountConnectComponent>;

  let MockEventService = jasmine.createSpyObj('EventService', [
    'getEvent',
    'handleEvent'
  ]);
  let MockErrorService = jasmine.createSpyObj('ErrorService', [
    'getError',
    'handleError'
  ]);
  let MockConfigService = jasmine.createSpyObj('ConfigService', {
    getConfig$: of(TestConstants.CONFIG),
    getCustomer$: of(TestConstants.CUSTOMER_BANK_MODEL)
  });
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  let MockBankAccountService = jasmine.createSpyObj('BankAccountService', [
    'createWorkflow',
    'getWorkflow',
    'getPlaidClient',
    'setPlaidClient',
    'createExternalBankAccount',
    'patchExternalBankAccount'
  ]);
  let MockDialog = jasmine.createSpyObj('Dialog', ['open']);
  const error$ = throwError(() => {
    new Error('Error');
  });

  class MockWindow {
    localStorage = {
      getItem: function () {
        return '';
      },
      setItem: function () {},
      removeItem: function () {}
    };
    location = {
      search: ''
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankAccountConnectComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule,
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
        { provide: RoutingService, useValue: MockRoutingService },
        { provide: BankAccountService, useValue: MockBankAccountService },
        { provide: MatDialog, useValue: MockDialog },
        { provide: Window, useClass: MockWindow },
        Renderer2
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockRoutingService = TestBed.inject(RoutingService);
    MockBankAccountService = TestBed.inject(BankAccountService);
    MockBankAccountService.createWorkflow.and.returnValue(
      of(TestConstants.WORKFLOW_BANK_MODEL)
    );
    MockBankAccountService.getWorkflow.and.returnValue(
      of(TestConstants.WORKFLOW_BANK_MODEL_WITH_DETAILS)
    );
    MockBankAccountService.patchExternalBankAccount.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL)
    );
    MockBankAccountService.createExternalBankAccount.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL)
    );
    MockBankAccountService.getPlaidClient.and.returnValue(of(false));
    MockDialog = TestBed.inject(MatDialog);
    MockDialog.open.and.returnValue({
      afterClosed: () => of('USD')
    });

    fixture = TestBed.createComponent(BankAccountConnectComponent);
    component = fixture.componentInstance;
    component.plaidScriptSrc = '/assets/plaidTestScript.js';
  });

  afterEach(() => {
    MockEventService.handleEvent.calls.reset();
    MockErrorService.handleError.calls.reset();
    MockConfigService.getConfig$.calls.reset();
    MockConfigService.getCustomer$.calls.reset();
    MockRoutingService.handleRoute.calls.reset();
    MockBankAccountService.createWorkflow.calls.reset();
  });

  it('should create', () => {
    component.bootstrapPlaid = () => undefined;
    expect(component).toBeTruthy();
  });

  it('should be disabled on mobile if no redirect uri is undefined', () => {
    const mobileSpy = spyOn(component.mobile$, 'next');
    const config = {
      ...TestConstants.CONFIG,
      redirectUri: undefined
    };
    MockConfigService.getConfig$.and.returnValue(of(config));

    // Emulate mobile
    component.isMobile = () => true;

    component.ngOnInit();
    expect(mobileSpy).toHaveBeenCalledWith(true);
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
  });

  it('should check for supported fiat assets if not a callback from Oauth', () => {
    const checkSupportedFiatAssetsSpy = spyOn(
      component,
      'checkSupportedFiatAssets'
    );

    component.ngOnInit();
    expect(checkSupportedFiatAssetsSpy).toHaveBeenCalled();
  });

  it('should check for supported fiat assets if linkToken is set and oauth_state_id is undefined', () => {
    const checkSupportedFiatAssetsSpy = spyOn(
      component,
      'checkSupportedFiatAssets'
    );

    // Set linkToken
    component['window'].localStorage.getItem = () => 'token';

    component.ngOnInit();
    expect(checkSupportedFiatAssetsSpy).toHaveBeenCalled();
  });

  it('should check for supported fiat assets if oauth_state_id is set and linkToken is undefined', () => {
    const checkSupportedFiatAssetsSpy = spyOn(
      component,
      'checkSupportedFiatAssets'
    );

    // Set query param
    // @ts-ignore
    component['window'].location = {
      search: '?oauth_state_id=4c5cbac5-7b53-46cc-81f2-48df452a5094'
    };

    component.ngOnInit();
    expect(checkSupportedFiatAssetsSpy).toHaveBeenCalled();
  });

  it('should bootstrap Plaid if a callback from Oauth', () => {
    const bootstrapPlaidSpy = spyOn(component, 'bootstrapPlaid');

    // Set linkToken
    component['window'].localStorage.getItem = () => 'token';
    // Set query param
    // @ts-ignore
    component['window'].location = {
      search: '?oauth_state_id=state'
    };

    component.ngOnInit();
    expect(bootstrapPlaidSpy).toHaveBeenCalled();
  });

  it('should check for supported fiat assets', () => {
    const onAddAccountSpy = spyOn(component, 'onAddAccount');

    component.checkSupportedFiatAssets();

    expect(MockConfigService.getConfig$).toHaveBeenCalled();
    expect(onAddAccountSpy).toHaveBeenCalled();
  });

  it('should handle no supported fiat assets', () => {
    let config = { ...TestConstants.CONFIG };
    config.fiat = '';
    MockConfigService.getConfig$.and.returnValue(of(config));

    component.checkSupportedFiatAssets();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();

    // Reset
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
  });

  it('should add account', () => {
    component.bootstrapPlaid = () => undefined;

    component.onAddAccount();
    expect(MockBankAccountService.createWorkflow).toHaveBeenCalled();
  });

  it('should handle errors on addAccount', () => {
    const error$Spy = spyOn(component.error$, 'next');
    component.bootstrapPlaid = () => undefined;
    MockBankAccountService.createWorkflow.and.returnValue(error$);

    component.onAddAccount();
    expect(error$Spy).toHaveBeenCalledWith(true);

    // Reset
    MockBankAccountService.createWorkflow.and.returnValue(
      of(TestConstants.WORKFLOW_BANK_MODEL)
    );
  });

  it('should get the currency code', (done) => {
    component.getCurrencyCode(TestConstants.CONFIG.fiat).subscribe((res) => {
      expect(res).toEqual('USD');
      done();
    });
  });

  it('should create a workflow', (done) => {
    component
      .createWorkflow(PostWorkflowBankModel.KindEnum.Create)
      .subscribe((workflow) => {
        expect(workflow).toEqual(
          TestConstants.WORKFLOW_BANK_MODEL_WITH_DETAILS
        );
        done();
      });
  });

  it('should create an external bank account', () => {
    const isLoadingSpy = spyOn(component.isLoading$, 'next');

    component.createExternalBankAccount({ name: '', id: '' }, '', '');
    expect(MockBankAccountService.createExternalBankAccount).toHaveBeenCalled();
    expect(isLoadingSpy).toHaveBeenCalledWith(false);
  });

  it('should handle errors when creating an external bank account', () => {
    const errorSpy = spyOn(component.error$, 'next');
    MockBankAccountService.createExternalBankAccount.and.returnValue(error$);

    component.createExternalBankAccount({ name: '', id: '' }, '', '');
    expect(errorSpy).toHaveBeenCalledWith(true);

    // Reset
    MockBankAccountService.createExternalBankAccount.and.returnValue(
      of(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL)
    );
  });

  it('should bootstrap the Plaid sdk', () => {
    // Default
    component.bootstrapPlaid('');

    // Previously loaded client
    MockBankAccountService.getPlaidClient.and.returnValue(of(true));
    component.bootstrapPlaid('');

    // Ensure only one client has been loaded
    expect(MockBankAccountService.setPlaidClient).toHaveBeenCalledOnceWith(
      true
    );

    // Reset
    MockBankAccountService.getPlaidClient.and.returnValue(of(false));
  });

  it('should handle errors when bootstrapping plaid', () => {
    MockBankAccountService.getPlaidClient.and.returnValue(error$);

    component.bootstrapPlaid('');

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();

    // Reset
    MockBankAccountService.getPlaidClient.and.returnValue(error$);
  });

  it('should handle plaidOnSuccess() with multiple accounts selected', () => {
    const errorSpy = spyOn(component.error$, 'next');

    component.plaidOnSuccess('', {
      accounts: [
        { name: '', id: '', iso_currency_code: '' },
        { name: '', id: '', iso_currency_code: '' }
      ]
    });
    expect(errorSpy).toHaveBeenCalledWith(true);
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should handle plaidOnSuccess() with a supported currency code', () => {
    component.plaidOnSuccess('', {
      accounts: [{ name: '', id: '', iso_currency_code: 'USD' }]
    });
    expect(MockBankAccountService.createExternalBankAccount).toHaveBeenCalled();
  });

  it('should handle plaidOnSuccess() with an unsupported currency code', () => {
    const errorSpy = spyOn(component.error$, 'next');

    component.plaidOnSuccess('', {
      accounts: [{ name: '', id: '', iso_currency_code: 'CAD' }]
    });
    expect(errorSpy).toHaveBeenCalledWith(true);
  });

  it('should handle plaidOnSuccess() with an undefined iso_currency_code', () => {
    const getCurrencyCodeSpy = spyOn(component, 'getCurrencyCode');

    component.plaidOnSuccess('', {
      accounts: [{ name: '', id: '', iso_currency_code: undefined }]
    });
    expect(getCurrencyCodeSpy).toHaveBeenCalled();
  });

  it('should handle plaidOnSuccess() in update mode', () => {
    // Define an external account guid to trigger update mode
    // @ts-ignore
    component.params = '';

    component.plaidOnSuccess('', {
      accounts: [{ name: '', id: '', iso_currency_code: 'USD' }]
    });

    expect(MockBankAccountService.patchExternalBankAccount).toHaveBeenCalled();
  });

  it('should handle getCurrencyCode() returning undefined', () => {
    // Ensure stepper is defined
    component.stepper = { next: () => {} } as MatStepper;
    const stepperSpy = spyOn(component.stepper, 'next');

    MockDialog.open.and.returnValue({
      afterClosed: () => of(undefined)
    });

    component.plaidOnSuccess('', {
      accounts: [{ name: '', id: '', iso_currency_code: undefined }]
    });
    expect(stepperSpy).toHaveBeenCalled();

    // Reset
    MockDialog.open.and.returnValue({
      afterClosed: () => of('USD')
    });
  });

  it('should handle a successful plaidOnExit()', () => {
    // Ensure stepper is defined
    component.stepper = { next: () => {} } as MatStepper;
    const stepperSpy = spyOn(component.stepper, 'next');

    component.plaidOnExit('', {});
    expect(stepperSpy).toHaveBeenCalled();
  });

  it('should handle plaidOnExit() with metadata', () => {
    component.stepper = { next: () => {} } as MatStepper;
    component.plaidOnExit('', {});

    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should handle plaidOnExit() with an error', () => {
    component.plaidOnExit('error', {});

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should navigate onComplete()', () => {
    component.onComplete();
    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });
});
