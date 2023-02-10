import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { HttpLoaderFactory } from '../../../app/modules/library.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import {
  ConfigService,
  ErrorService,
  EventService,
  IdentityVerificationService
} from '@services';
import { TestConstants } from '@constants';
import {
  CustomersService,
  IdentityVerificationsService
} from '@cybrid/cybrid-api-bank-angular';

describe('IdentityVerificationService', () => {
  let service: IdentityVerificationService;
  let MockConfigService = jasmine.createSpyObj('ConfigService', {
    getConfig$: of(TestConstants.CONFIG)
  });
  let MockEventService = jasmine.createSpyObj('EventService', [
    'getEvent',
    'handleEvent'
  ]);
  let MockErrorService = jasmine.createSpyObj('ErrorService', [
    'getError',
    'handleError'
  ]);
  let MockCustomersService = jasmine.createSpyObj('CustomersService', {
    getCustomer: of(TestConstants.CUSTOMER_BANK_MODEL)
  });
  let MockIdentityVerificationsService = jasmine.createSpyObj(
    'IdentityVerificationsService',
    ['createIdentityVerification', 'getIdentityVerification']
  );
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
        { provide: CustomersService, useValue: MockCustomersService },
        {
          provide: IdentityVerificationsService,
          useValue: MockIdentityVerificationsService
        }
      ]
    });
    service = TestBed.inject(IdentityVerificationService);
    MockConfigService = TestBed.inject(ConfigService);
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockCustomersService = TestBed.inject(CustomersService);
    MockIdentityVerificationsService.createIdentityVerification.and.returnValue(
      of(TestConstants.IDENTITY_VERIFICATION_BANK_MODEL)
    );
    MockIdentityVerificationsService.getIdentityVerification.and.returnValue(
      of(TestConstants.IDENTITY_VERIFICATION_BANK_MODEL)
    );
    MockIdentityVerificationsService = TestBed.inject(
      IdentityVerificationsService
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the customer Guid', () => {
    expect(service.customerGuid).toEqual('');
    expect(MockConfigService.getConfig$).toHaveBeenCalled();
  });

  it('should get the customer', () => {
    service.getCustomer();

    expect(MockCustomersService.getCustomer).toHaveBeenCalledWith(
      service.customerGuid
    );
  });

  it('should create an identity verification', () => {
    service
      .createIdentityVerification()
      .subscribe((res) =>
        expect(res).toEqual(TestConstants.IDENTITY_VERIFICATION_BANK_MODEL)
      );
  });

  it('should handle errors on creating an identity verification', () => {
    MockIdentityVerificationsService.createIdentityVerification.and.returnValue(
      error$
    );

    service.createIdentityVerification().subscribe();

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();

    // Reset
    MockIdentityVerificationsService.createIdentityVerification.and.returnValue(
      of(TestConstants.IDENTITY_VERIFICATION_BANK_MODEL)
    );
  });

  it('should get an identity verification', () => {
    // Default with existing identity verification
    service.getIdentityVerification('').subscribe();

    expect(
      MockIdentityVerificationsService.getIdentityVerification
    ).toHaveBeenCalled();
  });

  it('should handle error on getIdentityVerification()', () => {
    MockIdentityVerificationsService.getIdentityVerification.and.returnValue(
      error$
    );

    service.getIdentityVerification('').subscribe();

    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();

    // Reset
    MockIdentityVerificationsService.getIdentityVerification.and.returnValue(
      TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
    );
  });

  it('should set the Persona client', () => {
    const setPersonaSpy = spyOn(service.personaClient, 'next');

    service.setPersonaClient('test');

    expect(setPersonaSpy).toHaveBeenCalledWith('test');
  });

  it('should get the Persona client', () => {
    // Set Persona client
    service.setPersonaClient('test');

    service.getPersonaClient().subscribe((res) => {
      expect(res).toEqual('test');
    });
  });
});
