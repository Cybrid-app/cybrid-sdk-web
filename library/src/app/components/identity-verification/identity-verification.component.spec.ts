import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { HttpLoaderFactory } from '../../modules/library.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { of, throwError } from 'rxjs';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { CustomersService } from '@cybrid/cybrid-api-bank-angular';

import {
  ConfigService,
  ErrorService,
  EventService,
  IdentityVerificationService,
  RoutingService
} from '@services';

import { IdentityVerificationComponent } from '@components';
import { IdentityVerificationWithDetails } from '@models';
import { Constants, TestConstants } from '@constants';
import { SharedModule } from '../../../shared/modules/shared.module';

describe('IdentityVerificationComponent', () => {
  let component: IdentityVerificationComponent;
  let fixture: ComponentFixture<IdentityVerificationComponent>;

  let MockEventService = jasmine.createSpyObj('EventService', [
    'getEvent',
    'handleEvent'
  ]);
  let MockErrorService = jasmine.createSpyObj('ErrorService', [
    'getError',
    'handleError'
  ]);
  let MockConfigService = jasmine.createSpyObj('ConfigService', [
    'getConfig$',
    'getCustomer$'
  ]);
  let MockCustomersService = jasmine.createSpyObj('CustomersService', [
    'getCustomer'
  ]);
  let MockIdentityVerificationService = jasmine.createSpyObj(
    'IdentityVerificationService',
    [
      'createIdentityVerification',
      'getIdentityVerification',
      'listIdentityVerifications'
    ]
  );
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  const error$ = throwError(() => {
    new Error('Error');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IdentityVerificationComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        SharedModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: CustomersService, useValue: MockCustomersService },
        {
          provide: IdentityVerificationService,
          useValue: MockIdentityVerificationService
        },
        { provide: RoutingService, useValue: MockRoutingService }
      ]
    }).compileComponents();
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockConfigService.getCustomer$.and.returnValue(
      of(TestConstants.CUSTOMER_BANK_MODEL)
    );
    MockCustomersService = TestBed.inject(CustomersService);
    MockCustomersService.getCustomer.and.returnValue(
      of(TestConstants.CUSTOMER_BANK_MODEL)
    );
    MockIdentityVerificationService = TestBed.inject(
      IdentityVerificationService
    );
    MockIdentityVerificationService = TestBed.inject(
      IdentityVerificationService
    );
    MockIdentityVerificationService.createIdentityVerification.and.returnValue(
      of(TestConstants.IDENTITY_VERIFICATION_BANK_MODEL)
    );
    MockIdentityVerificationService.getIdentityVerification.and.returnValue(
      of(TestConstants.IDENTITY_VERIFICATION_BANK_MODEL)
    );
    MockIdentityVerificationService.listIdentityVerifications.and.returnValue(
      of(TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL)
    );
    MockRoutingService = TestBed.inject(RoutingService);

    fixture = TestBed.createComponent(IdentityVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.personaScriptSrc = '';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log an event when the component is initialized', () => {
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  describe('when getting the customer state', () => {
    afterEach(() => {
      MockCustomersService.getCustomer.and.returnValue(
        of(TestConstants.CUSTOMER_BANK_MODEL)
      );
      MockConfigService.getCustomer$.and.returnValue(
        of(TestConstants.CUSTOMER_BANK_MODEL)
      );
      MockCustomersService.getCustomer.calls.reset();
      MockConfigService.getCustomer$.calls.reset();
    });

    it('should get the customer', fakeAsync(() => {
      const handleCustomerStateSpy = spyOn(component, 'handleCustomerState');
      let customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
      customer.state = 'unverified';

      MockCustomersService.getCustomer.and.returnValue(of(customer));

      component.getCustomerState();
      tick();

      expect(handleCustomerStateSpy).toHaveBeenCalledWith(customer);
      expect(component.isVerifying).toBeTrue();

      discardPeriodicTasks();
    }));

    it('should poll while the customer state is storing', fakeAsync(() => {
      const handleCustomerStateSpy = spyOn(component, 'handleCustomerState');
      let customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
      customer.state = 'storing';

      MockCustomersService.getCustomer.and.returnValue(of(customer));

      component.getCustomerState();
      tick(Constants.POLL_DURATION);

      expect(MockCustomersService.getCustomer.calls.count()).toBeGreaterThan(1);
      expect(handleCustomerStateSpy).not.toHaveBeenCalled();
      expect(component.isVerifying).toBeFalse();

      discardPeriodicTasks();
    }));

    it('when the state is unverified', fakeAsync(() => {
      const verifyIdentitySpy = spyOn(component, 'verifyIdentity');
      let customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
      customer.state = 'unverified';

      MockCustomersService.getCustomer.and.returnValue(of(customer));

      component.getCustomerState();
      tick();

      expect(verifyIdentitySpy).toHaveBeenCalled();

      discardPeriodicTasks();
    }));

    it('when the state is verified', fakeAsync(() => {
      const customer$spy = spyOn(component.customer$, 'next');
      const isLoading$spy = spyOn(component.isLoading$, 'next');
      let customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
      customer.state = 'verified';

      MockCustomersService.getCustomer.and.returnValue(of(customer));

      component.getCustomerState();
      tick();

      expect(customer$spy).toHaveBeenCalled();
      expect(isLoading$spy).toHaveBeenCalledWith(false);

      discardPeriodicTasks();
    }));

    it('when the state is rejected', fakeAsync(() => {
      const customer$spy = spyOn(component.customer$, 'next');
      const isLoading$spy = spyOn(component.isLoading$, 'next');
      let customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
      customer.state = 'rejected';

      MockCustomersService.getCustomer.and.returnValue(of(customer));

      component.getCustomerState();
      tick();

      expect(MockEventService.handleEvent).toHaveBeenCalled();
      expect(customer$spy).toHaveBeenCalled();
      expect(isLoading$spy).toHaveBeenCalledWith(false);

      discardPeriodicTasks();
    }));

    it('when the state is frozen', fakeAsync(() => {
      const customer$spy = spyOn(component.customer$, 'next');
      const isLoading$spy = spyOn(component.isLoading$, 'next');
      let customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
      customer.state = 'frozen';

      MockCustomersService.getCustomer.and.returnValue(of(customer));

      component.getCustomerState();
      tick();

      expect(MockEventService.handleEvent).toHaveBeenCalled();
      expect(customer$spy).toHaveBeenCalled();
      expect(isLoading$spy).toHaveBeenCalledWith(false);

      discardPeriodicTasks();
    }));

    it('when the state is unknown', fakeAsync(() => {
      const error$spy = spyOn(component.error$, 'next');

      let customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
      customer.state = '';

      MockCustomersService.getCustomer.and.returnValue(of(customer));

      component.getCustomerState();
      tick();

      expect(error$spy).toHaveBeenCalledWith(true);

      discardPeriodicTasks();
    }));

    it('should handle errors when calling the configService', fakeAsync(() => {
      MockConfigService.getCustomer$.and.returnValue(error$);

      component.getCustomerState();
      tick();

      expect(MockErrorService.handleError).toHaveBeenCalled();
      expect(MockEventService.handleEvent).toHaveBeenCalled();

      discardPeriodicTasks();
    }));

    it('should handle errors when calling the customersService', fakeAsync(() => {
      MockCustomersService.getCustomer.and.returnValue(error$);

      component.getCustomerState();
      tick();

      expect(MockErrorService.handleError).toHaveBeenCalled();
      expect(MockEventService.handleEvent).toHaveBeenCalled();

      discardPeriodicTasks();
    }));
  });

  describe('handleIdentityVerificationState', () => {
    describe('with waiting state', () => {
      it('handles Persona state', () => {
        const handlePersonaStateSpy = spyOn(component, 'handlePersonaState');
        const identityVerificationBankModel = {
          ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
        };
        identityVerificationBankModel.state = 'waiting';

        component.handleIdentityVerificationState(
          identityVerificationBankModel
        );

        expect(handlePersonaStateSpy).toHaveBeenCalledWith(
          identityVerificationBankModel
        );
      });
    });

    describe('with completed state', () => {
      const identityVerificationBankModel = {
        ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
      };
      identityVerificationBankModel.state = 'completed';

      it('sets the identity$', () => {
        const identity$Spy = spyOn(component.identity$, 'next');

        component.handleIdentityVerificationState(
          identityVerificationBankModel
        );

        expect(identity$Spy).toHaveBeenCalledWith(
          identityVerificationBankModel
        );
      });

      it('sets the loading state', () => {
        const isLoading$Spy = spyOn(component.isLoading$, 'next');

        component.handleIdentityVerificationState(
          identityVerificationBankModel
        );

        expect(isLoading$Spy).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('with no existing identity verifications', () => {
    beforeEach(() =>
      MockIdentityVerificationService.createIdentityVerification.calls.reset()
    );
    it('should create an identity verification', fakeAsync(() => {
      let identityVerificationListBankModel = JSON.parse(
        JSON.stringify(TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL)
      );
      identityVerificationListBankModel.objects = [];

      MockIdentityVerificationService.listIdentityVerifications.and.returnValue(
        of(identityVerificationListBankModel)
      );

      component.verifyIdentity();

      tick();
      expect(
        MockIdentityVerificationService.createIdentityVerification
      ).toHaveBeenCalled();

      discardPeriodicTasks();

      // Reset
      MockIdentityVerificationService.listIdentityVerifications.and.returnValue(
        of(TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL)
      );
    }));
  });

  describe('with existing identity verifications', () => {
    beforeEach(() => {
      MockIdentityVerificationService.createIdentityVerification.calls.reset();
      MockIdentityVerificationService.listIdentityVerifications.and.returnValue(
        of(TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL)
      );
      MockIdentityVerificationService.getIdentityVerification.and.returnValue(
        of(TestConstants.IDENTITY_VERIFICATION_BANK_MODEL)
      );
    });

    describe('with expired state', () => {
      it('should create an identity verification', fakeAsync(() => {
        let identityVerificationListBankModel = JSON.parse(
          JSON.stringify(TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL)
        );
        identityVerificationListBankModel.objects[0].state = 'expired';

        MockIdentityVerificationService.listIdentityVerifications.and.returnValue(
          of(identityVerificationListBankModel)
        );

        component.verifyIdentity();

        tick();
        expect(
          MockIdentityVerificationService.createIdentityVerification
        ).toHaveBeenCalled();

        discardPeriodicTasks();
      }));
    });

    describe('with completed state', () => {
      it('should create an identity verification', fakeAsync(() => {
        let identityVerificationListBankModel = JSON.parse(
          JSON.stringify(TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL)
        );
        identityVerificationListBankModel.objects[0].state = 'completed';

        MockIdentityVerificationService.listIdentityVerifications.and.returnValue(
          of(identityVerificationListBankModel)
        );

        component.verifyIdentity();

        tick();
        expect(
          MockIdentityVerificationService.createIdentityVerification
        ).toHaveBeenCalled();

        discardPeriodicTasks();
      }));
    });

    describe('with storing state', () => {
      it('should not create an identity verification', fakeAsync(() => {
        let identityVerificationListBankModel = JSON.parse(
          JSON.stringify(TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL)
        );
        identityVerificationListBankModel.objects[0].state = 'storing';

        MockIdentityVerificationService.listIdentityVerifications.and.returnValue(
          of(identityVerificationListBankModel)
        );

        component.verifyIdentity();

        tick();
        expect(
          MockIdentityVerificationService.createIdentityVerification
        ).not.toHaveBeenCalled();

        discardPeriodicTasks();
      }));
    });

    describe('with waiting state', () => {
      it('should not create an identity verification', fakeAsync(() => {
        component.verifyIdentity();

        tick();
        expect(
          MockIdentityVerificationService.createIdentityVerification
        ).not.toHaveBeenCalled();

        discardPeriodicTasks();
      }));
    });

    describe('with pending persona_state', () => {
      it('should create an identity verification', fakeAsync(() => {
        let identityVerificationBankModel = {
          ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
        };
        identityVerificationBankModel.persona_state =
          IdentityVerificationWithDetails.PersonaStateEnum.Pending;

        MockIdentityVerificationService.getIdentityVerification.and.returnValue(
          of(identityVerificationBankModel)
        );

        component.verifyIdentity();

        tick();
        expect(
          MockIdentityVerificationService.createIdentityVerification
        ).toHaveBeenCalled();

        discardPeriodicTasks();
      }));
    });

    describe('with reviewing persona_state', () => {
      it('should not create an identity verification', fakeAsync(() => {
        let identityVerificationBankModel = {
          ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
        };
        identityVerificationBankModel.persona_state =
          IdentityVerificationWithDetails.PersonaStateEnum.Reviewing;

        MockIdentityVerificationService.getIdentityVerification.and.returnValue(
          of(identityVerificationBankModel)
        );

        component.verifyIdentity();

        tick();
        expect(
          MockIdentityVerificationService.createIdentityVerification
        ).not.toHaveBeenCalled();

        discardPeriodicTasks();
      }));
    });
  });

  it('should timeout after polling', fakeAsync(() => {
    const identitySpy = spyOn(component.identity$, 'next');
    let identity = { ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL };
    MockIdentityVerificationService.getIdentityVerification.and.returnValue(
      of(identity)
    );

    // Default res for POST identity_verifications
    identity.state = 'storing';
    component.verifyIdentity();
    tick();

    // Persona is in processing state
    identity.persona_state = 'processing';

    component.verifyIdentity();
    tick();

    // Persona has completed but Cybrid is still in waiting state
    identity.state = 'waiting';
    identity.persona_state = 'completed';

    component.verifyIdentity();
    tick();

    expect(identitySpy).toHaveBeenCalledTimes(1);
    expect(identitySpy).toHaveBeenCalledWith(identity);

    discardPeriodicTasks();

    // Reset
    MockIdentityVerificationService.getIdentityVerification.and.returnValue(
      TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
    );
  }));

  it('should handle errors when calling verifyIdentity()', fakeAsync(() => {
    MockConfigService.getCustomer$.and.returnValue(error$);
    component.getCustomerState();
    MockIdentityVerificationService.createIdentityVerification.and.returnValue(
      error$
    );

    component.verifyIdentity();
    tick();

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();

    discardPeriodicTasks();

    // Reset
    MockConfigService.getCustomer$.and.returnValue(
      of(TestConstants.CUSTOMER_BANK_MODEL)
    );
    MockIdentityVerificationService.createIdentityVerification.and.returnValue(
      of(TestConstants.IDENTITY_VERIFICATION_BANK_MODEL)
    );
  }));

  it('should handle persona state', () => {
    const bootstrapPersonaSpy = spyOn(component, 'bootstrapPersona');
    const isLoading$Spy = spyOn(component.isLoading$, 'next');
    const error$Spy = spyOn(component.error$, 'next');

    let identityVerification = {
      ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
    };

    // State = 'waiting'
    identityVerification.persona_state = 'waiting';
    component.handlePersonaState(identityVerification);
    expect(bootstrapPersonaSpy).toHaveBeenCalled();

    // State = 'pending'
    identityVerification.persona_state = 'pending';
    component.handlePersonaState(identityVerification);
    expect(bootstrapPersonaSpy).toHaveBeenCalled();

    // State = 'reviewing'
    identityVerification.persona_state = 'reviewing';
    component.handlePersonaState(identityVerification);
    expect(isLoading$Spy).toHaveBeenCalled();

    // State = 'unknown'
    identityVerification.persona_state = 'unknown';
    component.handlePersonaState(identityVerification);
    expect(error$Spy).toHaveBeenCalled();
  });

  it('should get the persona language alias', () => {
    // Default language = 'en-US'
    let config = { ...TestConstants.CONFIG };

    expect(component.getPersonaLanguageAlias(config.locale)).toEqual(
      config.locale
    );

    // Set language to French
    config.locale = 'fr-CA';

    expect(component.getPersonaLanguageAlias(config.locale)).toEqual('fr');
  });

  it('should handle Persona callbacks', () => {
    const isLoading$Spy = spyOn(component.isLoading$, 'next');
    const personaClientSpy = spyOn(component.personaClient, 'next');

    // Define Persona client with open method
    let client = {
      options: { inquiryId: '' },
      open: () => {}
    };

    component.personaOnReady(client);
    expect(personaClientSpy).toHaveBeenCalled();

    component.personaOnCancel(client);
    expect(personaClientSpy).toHaveBeenCalled();
    expect(isLoading$Spy).toHaveBeenCalled();

    component.personaOnError(new Error('error'));

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should bootstrap the persona client', () => {
    component.bootstrapPersona(
      TestConstants.IDENTITY_VERIFICATION_BANK_MODEL.persona_inquiry_id!
    );

    expect(MockConfigService.getConfig$).toHaveBeenCalled();
  });

  it('should handle errors when calling bootstrapPersona()', () => {
    component.personaClient.next(error$);

    component.bootstrapPersona(
      TestConstants.IDENTITY_VERIFICATION_BANK_MODEL.persona_inquiry_id!
    );

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();

    component.personaClient.next({});
    MockConfigService.getConfig$.and.returnValue(error$);

    component.bootstrapPersona(
      TestConstants.IDENTITY_VERIFICATION_BANK_MODEL.persona_inquiry_id!
    );

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();

    // Reset
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
  });

  it('should log an event when onComplete', () => {
    component.personaOnComplete();

    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should route when onComplete()', () => {
    component.onComplete();

    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });

  it('should route when onCancel()', () => {
    component.onCancel();

    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });
});
