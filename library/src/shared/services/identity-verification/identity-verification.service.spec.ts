import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { HttpLoaderFactory } from '../../../app/modules/library.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ConfigService, IdentityVerificationService } from '@services';
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
  let MockCustomersService = jasmine.createSpyObj('CustomersService', {
    getCustomer: of(TestConstants.CUSTOMER_BANK_MODEL)
  });
  let MockIdentityVerificationsService = jasmine.createSpyObj(
    'IdentityVerificationsService',
    {
      createIdentityVerification: of(
        TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
      ),
      listIdentityVerifications: of(
        TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL
      ),
      getIdentityVerification: of(
        TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
      )
    }
  );

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
        { provide: CustomersService, useValue: MockCustomersService },
        {
          provide: IdentityVerificationsService,
          useValue: MockIdentityVerificationsService
        }
      ]
    });
    service = TestBed.inject(IdentityVerificationService);
    MockConfigService = TestBed.inject(ConfigService);
    MockCustomersService = TestBed.inject(CustomersService);
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
    service.createIdentityVerification();

    expect(
      MockIdentityVerificationsService.createIdentityVerification
    ).toHaveBeenCalledWith(service.postIdentityVerificationBankModel);
  });

  it('should get an identity verification', () => {
    // Default with existing identity verification
    service.getIdentityVerification().subscribe();

    expect(
      MockIdentityVerificationsService.listIdentityVerifications
    ).toHaveBeenCalled();

    // No existing identity verification
    let emptyList = { ...TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL };
    emptyList.objects = [];
    MockIdentityVerificationsService.listIdentityVerifications.and.returnValue(
      of(emptyList)
    );

    service.getIdentityVerification().subscribe();

    expect(
      MockIdentityVerificationsService.listIdentityVerifications
    ).toHaveBeenCalled();
  });

  it('should handle an identity verification', () => {
    // Valid identity and Persona state
    let identity = service.handleIdentityVerificationState(
      TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
    );

    identity.subscribe((res) => {
      expect(res).toEqual(TestConstants.IDENTITY_VERIFICATION_BANK_MODEL);
    });

    // Expired identity state
    let expiredIdentity = {
      ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
    };
    expiredIdentity.state = 'expired';
    MockIdentityVerificationsService.getIdentityVerification.and.returnValue(
      of(expiredIdentity)
    );

    service.handleIdentityVerificationState(expiredIdentity).subscribe(() => {
      expect(
        MockIdentityVerificationsService.getIdentityVerification
      ).toHaveBeenCalled();
    });

    // Expired Persona state
    let expiredPersona = { ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL };
    expiredPersona.persona_state = 'expired';
    MockIdentityVerificationsService.getIdentityVerification.and.returnValue(
      of(expiredIdentity)
    );

    service
      .handleIdentityVerificationState(expiredIdentity)
      .subscribe(() =>
        expect(
          MockIdentityVerificationsService.getIdentityVerification
        ).toHaveBeenCalled()
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
