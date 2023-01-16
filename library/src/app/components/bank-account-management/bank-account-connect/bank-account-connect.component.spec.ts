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
    getBank$: of(TestConstants.BANK_BANK_MODEL),
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
    'createExternalBankAccount'
  ]);
  const error$ = throwError(() => {
    new Error('Error');
  });

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
    MockBankAccountService.getPlaidClient.and.returnValue(of(false));

    fixture = TestBed.createComponent(BankAccountConnectComponent);
    component = fixture.componentInstance;
    component.plaidScriptSrc = '/assets/plaidTestScript.js';

    fixture.detectChanges();
  });

  it('should create', () => {
    component.bootstrapPlaid = () => undefined;
    expect(component).toBeTruthy();
  });

  it('should add account', () => {
    component.bootstrapPlaid = () => undefined;
    component.onAddAccount();

    expect(MockConfigService.getConfig$).toHaveBeenCalled();
    expect(MockBankAccountService.createWorkflow).toHaveBeenCalled();
  });

  it('should handle errors on addAccount', () => {
    component.bootstrapPlaid = () => undefined;
    MockBankAccountService.createWorkflow.and.returnValue(error$);

    component.onAddAccount();

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should bootstrap the Plaid sdk', () => {
    // Reset call count
    MockBankAccountService.setPlaidClient.calls.reset();

    // Default
    component.bootstrapPlaid('');

    // Previously loaded client
    MockBankAccountService.getPlaidClient.and.returnValue(of(true));
    component.bootstrapPlaid('');

    // Ensure only one client has been loaded
    expect(MockBankAccountService.setPlaidClient).toHaveBeenCalledOnceWith(
      true
    );
  });

  it('should handle errors when bootstrapping plaid', () => {
    MockBankAccountService.getPlaidClient.and.returnValue(error$);

    component.bootstrapPlaid('');

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should handle plaidOnSuccess()', () => {
    const testPlaidMetadata = {
      accounts: [{ name: 'test', id: 'test', iso_currency_code: 'USD' }]
    };

    component.plaidOnSuccess('', testPlaidMetadata);

    expect(MockBankAccountService.createExternalBankAccount).toHaveBeenCalled();
  });

  it('should handle an undefined asset', () => {
    const testPlaidMetadata = {
      accounts: [{ name: 'test', id: 'test', iso_currency_code: undefined }]
    };

    component.plaidOnSuccess('', testPlaidMetadata);

    expect(MockBankAccountService.createExternalBankAccount).toHaveBeenCalled();
  });

  it('should handle an invalid asset', () => {
    const errorSpy = spyOn(component.error$, 'next');
    const testPlaidMetadata = {
      accounts: [{ name: 'test', id: 'test', iso_currency_code: 'USD' }]
    };

    MockBankAccountService.createExternalBankAccount.calls.reset();

    let bankBankModel = { ...TestConstants.BANK_BANK_MODEL };
    bankBankModel.supported_fiat_account_assets = [];
    MockConfigService.getBank$.and.returnValue(of(bankBankModel));

    component.plaidOnSuccess('', testPlaidMetadata);

    expect(errorSpy).toHaveBeenCalled();
    expect(
      MockBankAccountService.createExternalBankAccount
    ).toHaveBeenCalledTimes(0);

    // Reset
    MockConfigService.getBank$.and.returnValue(
      of(TestConstants.BANK_BANK_MODEL)
    );
  });

  it('should handle an unsupported asset', () => {
    const errorSpy = spyOn(component.error$, 'next');

    // The comparing bank supported asset here is 'USD'
    const testPlaidMetadata = {
      accounts: [{ name: 'test', id: 'test', iso_currency_code: 'CAD' }]
    };

    component.plaidOnSuccess('', testPlaidMetadata);

    expect(errorSpy).toHaveBeenCalled();
  });

  it('should handle plaidOnExit()', () => {
    component.ngOnInit();

    const stepperSpy = spyOn(component.stepper, 'next');

    // Default exit
    component.plaidOnExit('');

    expect(stepperSpy).toHaveBeenCalled();

    // Exit on error
    component.plaidOnExit('error');

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should navigate onComplete()', () => {
    component.onComplete();
    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });

  it('should be disabled on mobile', () => {
    const mobileSpy = spyOn(component.mobile$, 'next');

    // Emulate mobile
    component.isMobile = () => true;

    // Re-initialize component
    component.ngOnInit();

    expect(mobileSpy).toHaveBeenCalledWith(true);
  });
});
