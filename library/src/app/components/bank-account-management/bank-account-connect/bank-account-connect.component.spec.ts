import { CUSTOM_ELEMENTS_SCHEMA, Renderer2 } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '../../../../shared/modules/shared.module';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
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
  let MockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [
    'queryParams'
  ]);
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
      search: '',
      hash: { indexOf: function () {}, substring: function () {}, search: '' }
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
        { provide: ActivatedRoute, useValue: MockActivatedRoute },
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
    MockActivatedRoute = TestBed.inject(ActivatedRoute);
    MockActivatedRoute.queryParams = of({});
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

  describe('when connecting a new account', () => {
    it('should check for supported fiat assets', () => {
      const checkSupportedFiatAssetsSpy = spyOn(
        component,
        'checkSupportedFiatAssets'
      );

      component.ngOnInit();
      expect(checkSupportedFiatAssetsSpy).toHaveBeenCalled();
    });
  });

  describe('when reconnecting an account', () => {
    describe('before an oauth redirect', () => {
      beforeEach(() => {
        component.externalBankAccountGuid = 'guid';
        component['window'].localStorage.getItem = () => 'localItem';
      });

      it('should process the account', () => {
        const processAccountSpy = spyOn(component, 'processAccount');

        component.ngOnInit();
        expect(processAccountSpy).toHaveBeenCalled();
      });
    });

    describe('after an oauth redirect', () => {
      const localItem = 'localItem';
      const oauthStateId = 'oauth_state_id';

      beforeEach(() => {
        component.externalBankAccountGuid = 'guid';
        component['window'].localStorage.getItem = () => localItem;
        component['getQueryParam'] = () => oauthStateId;
      });

      it('should bootstrap Plaid', () => {
        const bootstrapPlaidSpy = spyOn(component, 'bootstrapPlaid');

        component.ngOnInit();
        expect(bootstrapPlaidSpy).toHaveBeenCalledWith(localItem, oauthStateId);
      });
    });
  });

  describe('when getting a query param', () => {
    const queryParam = 'queryParam';

    it('returns an existing query param', () => {
      component['window'].location.search = `?${queryParam}=value`;

      expect(component.getQueryParam(queryParam)).toEqual('value');
    });
    it('returns null if no query param exists', () => {
      component['window'].location.search = '';

      expect(component.getQueryParam(queryParam)).toBeNull();
    });
  });

  describe('when checking supported fiat assets', () => {
    describe('when a fiat asset exists', () => {
      it('should process the account', () => {
        const processAccountSpy = spyOn(component, 'processAccount');

        component.checkSupportedFiatAssets();

        expect(MockConfigService.getConfig$).toHaveBeenCalled();
        expect(processAccountSpy).toHaveBeenCalled();
      });
    });

    describe('when no fiat asset exists', () => {
      afterEach(() =>
        MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG))
      );

      it('should throw an error', () => {
        const error$Spy = spyOn(component.error$, 'next');
        let config = { ...TestConstants.CONFIG };
        config.fiat = '';
        MockConfigService.getConfig$.and.returnValue(of(config));

        component.checkSupportedFiatAssets();

        expect(error$Spy).toHaveBeenCalled();
        expect(MockEventService.handleEvent).toHaveBeenCalled();
        expect(MockErrorService.handleError).toHaveBeenCalled();
      });
    });
  });

  describe('when processing an account', () => {
    describe('when there is an existing account', () => {
      const externalBankAccountGuid = 'guid';

      beforeEach(() => {
        component.externalBankAccountGuid = externalBankAccountGuid;
      });
      it('should create an update workflow', fakeAsync(() => {
        component.processAccount();
        tick();

        expect(MockBankAccountService.createWorkflow).toHaveBeenCalledWith(
          PostWorkflowBankModel.KindEnum.Update,
          externalBankAccountGuid
        );

        discardPeriodicTasks();
      }));
    });
    describe('when there is no existing account', () => {
      it('should create a create workflow', fakeAsync(() => {
        component.processAccount();
        tick();

        expect(MockBankAccountService.createWorkflow).toHaveBeenCalledWith(
          PostWorkflowBankModel.KindEnum.Create,
          undefined
        );
        discardPeriodicTasks();
      }));
    });
    it('should handle errors', fakeAsync(() => {
      const error$Spy = spyOn(component.error$, 'next');
      MockBankAccountService.createWorkflow.and.returnValue(error$);

      component.processAccount();
      tick();

      expect(error$Spy).toHaveBeenCalledWith(true);

      discardPeriodicTasks();
    }));
  });

  describe('when getting the currency code', () => {
    describe('when the currency code exists', () => {
      it('should return the currency code', (done) => {
        component
          .getCurrencyCode(TestConstants.CONFIG.fiat)
          .subscribe((res) => {
            expect(res).toEqual('USD');
            done();
          });
      });
    });
    describe('when the currency code does not exist', () => {
      beforeEach(() => {
        MockDialog.open.and.returnValue({
          afterClosed: () => of(undefined)
        });
      });
      it('should return undefined', (done) => {
        component.getCurrencyCode('').subscribe((res) => {
          expect(res).toBeUndefined();
          done();
        });
      });
    });
  });

  describe('when creating an external bank account', () => {
    it('should create an external bank account', () => {
      const isLoadingSpy = spyOn(component.isLoading$, 'next');

      component.createExternalBankAccount({ name: '', id: '' }, '', '');

      expect(
        MockBankAccountService.createExternalBankAccount
      ).toHaveBeenCalled();
      expect(isLoadingSpy).toHaveBeenCalledWith(false);
      expect(MockEventService.handleEvent).toHaveBeenCalled();
    });

    it('should handle errors', () => {
      const errorSpy = spyOn(component.error$, 'next');
      MockBankAccountService.createExternalBankAccount.and.returnValue(error$);

      component.createExternalBankAccount({ name: '', id: '' }, '', '');

      expect(errorSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('when bootstrapping Plaid', () => {
    beforeEach(() => {
      MockBankAccountService.setPlaidClient.calls.reset();
    });
    describe('when there is no Plaid client', () => {
      it('should create a Plaid client', () => {
        component.bootstrapPlaid('', '');

        expect(MockBankAccountService.setPlaidClient).toHaveBeenCalledWith(
          true
        );
      });
    });

    describe('when there is a Plaid client', () => {
      beforeEach(() => {
        MockBankAccountService.getPlaidClient.and.returnValue(of(true));
      });

      it('should not create a Plaid client', () => {
        component.bootstrapPlaid('', '');

        expect(MockBankAccountService.setPlaidClient).not.toHaveBeenCalled();
      });
    });

    it('should handle errors', () => {
      const error$Spy = spyOn(component.error$, 'next');
      MockConfigService.getConfig$.and.returnValue(error$);

      component.bootstrapPlaid('', '');

      expect(error$Spy).toHaveBeenCalledWith(true);
      expect(MockEventService.handleEvent).toHaveBeenCalled();
      expect(MockErrorService.handleError).toHaveBeenCalled();
    });
  });

  describe('when Plaid is successful', () => {});

  // it('should bootstrap the Plaid sdk', () => {
  //   // Default
  //   component.bootstrapPlaid('');
  //
  //   // Previously loaded client
  //   MockBankAccountService.getPlaidClient.and.returnValue(of(true));
  //   component.bootstrapPlaid('');
  //
  //   // Ensure only one client has been loaded
  //   expect(MockBankAccountService.setPlaidClient).toHaveBeenCalledOnceWith(
  //     true
  //   );
  //
  //   // Reset
  //   MockBankAccountService.getPlaidClient.and.returnValue(of(false));
  // });
  //
  // it('should handle errors when bootstrapping plaid', () => {
  //   MockBankAccountService.getPlaidClient.and.returnValue(error$);
  //
  //   component.bootstrapPlaid('');
  //
  //   expect(MockErrorService.handleError).toHaveBeenCalled();
  //   expect(MockEventService.handleEvent).toHaveBeenCalled();
  //
  //   // Reset
  //   MockBankAccountService.getPlaidClient.and.returnValue(error$);
  // });
  //
  // it('should handle plaidOnSuccess() with multiple accounts selected', () => {
  //   const errorSpy = spyOn(component.error$, 'next');
  //
  //   component.plaidOnSuccess('', {
  //     accounts: [
  //       { name: '', id: '', iso_currency_code: '' },
  //       { name: '', id: '', iso_currency_code: '' }
  //     ]
  //   });
  //   expect(errorSpy).toHaveBeenCalledWith(true);
  //   expect(MockErrorService.handleError).toHaveBeenCalled();
  //   expect(MockEventService.handleEvent).toHaveBeenCalled();
  // });
  //
  // it('should handle plaidOnSuccess() with a supported currency code', () => {
  //   component.plaidOnSuccess('', {
  //     accounts: [{ name: '', id: '', iso_currency_code: 'USD' }]
  //   });
  //   expect(MockBankAccountService.createExternalBankAccount).toHaveBeenCalled();
  // });
  //
  // it('should handle plaidOnSuccess() with an unsupported currency code', () => {
  //   const errorSpy = spyOn(component.error$, 'next');
  //
  //   component.plaidOnSuccess('', {
  //     accounts: [{ name: '', id: '', iso_currency_code: 'CAD' }]
  //   });
  //   expect(errorSpy).toHaveBeenCalledWith(true);
  // });
  //
  // it('should handle plaidOnSuccess() with an undefined iso_currency_code', () => {
  //   const getCurrencyCodeSpy = spyOn(component, 'getCurrencyCode');
  //
  //   component.plaidOnSuccess('', {
  //     accounts: [{ name: '', id: '', iso_currency_code: undefined }]
  //   });
  //   expect(getCurrencyCodeSpy).toHaveBeenCalled();
  // });
  //
  // it('should handle plaidOnSuccess() in update mode', () => {
  //   // Define an external account guid to trigger update mode
  //   // @ts-ignore
  //   component.externalBankAccountGuid = '';
  //
  //   component.plaidOnSuccess('', {
  //     accounts: [{ name: '', id: '', iso_currency_code: 'USD' }]
  //   });
  //
  //   expect(MockBankAccountService.patchExternalBankAccount).toHaveBeenCalled();
  // });
  //
  // it('should handle getCurrencyCode() returning undefined', () => {
  //   // Ensure stepper is defined
  //   component.stepper = { next: () => {} } as MatStepper;
  //   const stepperSpy = spyOn(component.stepper, 'next');
  //
  //   MockDialog.open.and.returnValue({
  //     afterClosed: () => of(undefined)
  //   });
  //
  //   component.plaidOnSuccess('', {
  //     accounts: [{ name: '', id: '', iso_currency_code: undefined }]
  //   });
  //   expect(stepperSpy).toHaveBeenCalled();
  //
  //   // Reset
  //   MockDialog.open.and.returnValue({
  //     afterClosed: () => of('USD')
  //   });
  // });
  //
  // it('should handle a successful plaidOnExit()', () => {
  //   // Ensure stepper is defined
  //   component.stepper = { next: () => {} } as MatStepper;
  //   const stepperSpy = spyOn(component.stepper, 'next');
  //
  //   component.plaidOnExit('', {});
  //   expect(stepperSpy).toHaveBeenCalled();
  // });
  //
  // it('should handle plaidOnExit() with metadata', () => {
  //   component.stepper = { next: () => {} } as MatStepper;
  //   component.plaidOnExit('', {});
  //
  //   expect(MockEventService.handleEvent).toHaveBeenCalled();
  // });
  //
  // it('should handle plaidOnExit() with an error', () => {
  //   component.plaidOnExit('error', {});
  //
  //   expect(MockErrorService.handleError).toHaveBeenCalled();
  //   expect(MockEventService.handleEvent).toHaveBeenCalled();
  // });
  //
  // it('should navigate onComplete()', () => {
  //   component.onComplete();
  //   expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  // });
});
