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

import {
  ConfigService,
  ErrorService,
  EventService,
  IdentityVerificationService
} from '@services';

import { IdentityVerificationComponent } from '@components';
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
  let MockConfigService = jasmine.createSpyObj('ConfigService', ['getConfig$']);
  let MockIdentityVerificationService = jasmine.createSpyObj(
    'IdentityVerificationService',
    [
      'getCustomer',
      'getIdentityVerification',
      'getPersonaClient',
      'setPersonaClient'
    ]
  );
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
        {
          provide: IdentityVerificationService,
          useValue: MockIdentityVerificationService
        }
      ]
    }).compileComponents();
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockIdentityVerificationService = TestBed.inject(
      IdentityVerificationService
    );
    MockIdentityVerificationService.getCustomer.and.returnValue(
      of(TestConstants.CUSTOMER_BANK_MODEL)
    );
    MockIdentityVerificationService.getIdentityVerification.and.returnValue(
      of(TestConstants.IDENTITY_VERIFICATION_MODEL)
    );

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

  it('should get the customer status', fakeAsync(() => {
    const customer$Spy = spyOn(component.customer$, 'next');

    component.getCustomerStatus();
    tick();

    expect(customer$Spy).toHaveBeenCalled();
    component.isLoading$.subscribe((res) => expect(res).toBeFalse());

    discardPeriodicTasks();
  }));

  it('should verify identity', fakeAsync(() => {
    const handleIdentityVerificationStateSpy = spyOn(
      component,
      'handleIdentityVerificationState'
    );
    const identity$Spy = spyOn(component.identity$, 'next');

    component.verifyIdentity();
    tick(5000);

    expect(handleIdentityVerificationStateSpy).toHaveBeenCalledWith(
      TestConstants.IDENTITY_VERIFICATION_MODEL
    );
    expect(identity$Spy).toHaveBeenCalledWith(
      TestConstants.IDENTITY_VERIFICATION_MODEL
    );

    discardPeriodicTasks();
  }));

  it('should timeout after polling when persona has completed, but state = waiting', fakeAsync(() => {
    let identity = { ...TestConstants.IDENTITY_VERIFICATION_MODEL };
    identity.state = 'waiting';
    identity.persona_state = 'completed';
    MockIdentityVerificationService.getIdentityVerification.and.returnValue(
      of(identity)
    );
    const identitySpy = spyOn(component.identity$, 'next');

    component.verifyIdentity();
    tick();

    expect(identitySpy).toHaveBeenCalledTimes(0);

    discardPeriodicTasks();
  }));

  it('should handle errors when calling getCustomerStatus()', fakeAsync(() => {
    MockIdentityVerificationService.getCustomer.and.returnValue(error$);
    component.getCustomerStatus();
    tick();

    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();

    discardPeriodicTasks();
  }));

  it('should handle errors when calling verifyIdentity()', fakeAsync(() => {
    MockIdentityVerificationService.getIdentityVerification.and.returnValue(
      error$
    );

    component.verifyIdentity();
    tick();

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();

    discardPeriodicTasks();
  }));

  it('should handle identity verification state', () => {
    const handlePersonaStateSpy = spyOn(component, 'handlePersonaState');
    let identityVerification = TestConstants.IDENTITY_VERIFICATION_MODEL;

    // State = 'waiting'
    component.handleIdentityVerificationState(identityVerification);
    expect(handlePersonaStateSpy).toHaveBeenCalled();

    // State = 'completed'
    identityVerification.state = 'completed';
    component.handleIdentityVerificationState(identityVerification);
    component.isLoading$.subscribe((res) => expect(res).toBeFalse());
  });

  it('should handle persona state', () => {
    const bootstrapPersonaSpy = spyOn(component, 'bootstrapPersona');
    const isLoading$Spy = spyOn(component.isLoading$, 'next');
    const error$Spy = spyOn(component.error$, 'next');

    let identityVerification = TestConstants.IDENTITY_VERIFICATION_MODEL;

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
    const stepperSpy = spyOn(component.stepper, 'next');

    // Define Persona client with open method
    let client = {
      open: () => undefined
    };

    component.personaOnReady(client);

    expect(
      MockIdentityVerificationService.setPersonaClient
    ).toHaveBeenCalledWith(client);

    component.personaOnCancel(client);

    expect(
      MockIdentityVerificationService.setPersonaClient
    ).toHaveBeenCalledWith(client);
    expect(isLoading$Spy).toHaveBeenCalled();
    expect(stepperSpy).toHaveBeenCalled();

    component.personaOnError(new Error('error'));

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should bootstrap the persona client', fakeAsync(() => {
    MockIdentityVerificationService.getPersonaClient.and.returnValue(of(false));
    component.personaScriptSrc = Constants.PERSONA_SCRIPT_SRC;

    component.bootstrapPersona(
      TestConstants.IDENTITY_VERIFICATION_MODEL.persona_inquiry_id!
    );

    tick();
    expect(MockConfigService.getConfig$).toHaveBeenCalled();
    expect(MockIdentityVerificationService.getPersonaClient).toHaveBeenCalled();

    MockIdentityVerificationService.getPersonaClient.and.returnValue(of(true));

    component.bootstrapPersona(
      TestConstants.IDENTITY_VERIFICATION_MODEL.persona_inquiry_id!
    );

    tick();
    expect(MockConfigService.getConfig$).toHaveBeenCalled();
    expect(MockIdentityVerificationService.getPersonaClient).toHaveBeenCalled();

    discardPeriodicTasks();
  }));

  it('should handle errors when calling bootstrapPersona()', () => {
    MockIdentityVerificationService.getPersonaClient.and.returnValue(error$);

    component.bootstrapPersona(
      TestConstants.IDENTITY_VERIFICATION_MODEL.persona_inquiry_id!
    );

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();

    MockIdentityVerificationService.getPersonaClient.and.returnValue(of(null));
    MockConfigService.getConfig$.and.returnValue(error$);

    component.bootstrapPersona(
      TestConstants.IDENTITY_VERIFICATION_MODEL.persona_inquiry_id!
    );

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });
});
