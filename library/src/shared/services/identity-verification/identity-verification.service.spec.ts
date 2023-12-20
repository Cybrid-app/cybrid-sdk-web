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
  IdentityVerificationListBankModel,
  IdentityVerificationsService,
  IdentityVerificationWithDetailsBankModel,
  PostIdentityVerificationBankModel
} from '@cybrid/cybrid-api-bank-angular';

describe('IdentityVerificationService', () => {
  let service: IdentityVerificationService;
  let MockConfigService = jasmine.createSpyObj('ConfigService', [
    'getCustomer$'
  ]);
  let MockEventService = jasmine.createSpyObj('EventService', [
    'getEvent',
    'handleEvent'
  ]);
  let MockErrorService = jasmine.createSpyObj('ErrorService', [
    'getError',
    'handleError'
  ]);
  let MockIdentityVerificationsService = jasmine.createSpyObj(
    'IdentityVerificationsService',
    [
      'createIdentityVerification',
      'getIdentityVerification',
      'listIdentityVerifications'
    ]
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
        {
          provide: IdentityVerificationsService,
          useValue: MockIdentityVerificationsService
        }
      ]
    });
    service = TestBed.inject(IdentityVerificationService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getCustomer$.and.returnValue(
      of(TestConstants.CUSTOMER_BANK_MODEL)
    );
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockIdentityVerificationsService = TestBed.inject(
      IdentityVerificationsService
    );
    MockIdentityVerificationsService.createIdentityVerification.and.returnValue(
      of(TestConstants.IDENTITY_VERIFICATION_BANK_MODEL)
    );
    MockIdentityVerificationsService.getIdentityVerification.and.returnValue(
      of(TestConstants.IDENTITY_VERIFICATION_BANK_MODEL)
    );
    MockIdentityVerificationsService.listIdentityVerifications.and.returnValue(
      of(TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL)
    );
  });

  afterEach(() => {
    MockErrorService.handleError.calls.reset();
    MockEventService.handleEvent.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when creating an identity verification', () => {
    afterEach(() => {
      MockConfigService.getCustomer$.and.returnValue(
        of(TestConstants.CUSTOMER_BANK_MODEL)
      );
      MockIdentityVerificationsService.createIdentityVerification.and.returnValue(
        of(TestConstants.IDENTITY_VERIFICATION_BANK_MODEL)
      );
    });

    it('should create an identity verification for an individual', () => {
      const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
      customer.type = 'individual';

      const postIdentityVerificationBankModel: PostIdentityVerificationBankModel =
        {
          customer_guid: customer.guid,
          method: PostIdentityVerificationBankModel.MethodEnum.IdAndSelfie,
          type: PostIdentityVerificationBankModel.TypeEnum.Kyc
        };

      MockConfigService.getCustomer$.and.returnValue(of(customer));

      service
        .createIdentityVerification()
        .subscribe((identity: IdentityVerificationWithDetailsBankModel) => {
          expect(identity).toEqual(
            TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
          );
        });

      expect(
        MockIdentityVerificationsService.createIdentityVerification
      ).toHaveBeenCalledWith(postIdentityVerificationBankModel);
    });

    it('should create an identity verification for a business', () => {
      const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
      customer.type = 'business';

      const postIdentityVerificationBankModel: PostIdentityVerificationBankModel =
        {
          customer_guid: customer.guid,
          method:
            PostIdentityVerificationBankModel.MethodEnum.BusinessRegistration,
          type: PostIdentityVerificationBankModel.TypeEnum.Kyc
        };

      MockConfigService.getCustomer$.and.returnValue(of(customer));

      service
        .createIdentityVerification()
        .subscribe((identity: IdentityVerificationWithDetailsBankModel) => {
          expect(identity).toEqual(
            TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
          );
        });

      expect(
        MockIdentityVerificationsService.createIdentityVerification
      ).toHaveBeenCalledWith(postIdentityVerificationBankModel);
    });

    it('should handle errors when getting the customer', () => {
      MockConfigService.getCustomer$.and.returnValue(error$);

      service.createIdentityVerification().subscribe();

      expect(MockErrorService.handleError).toHaveBeenCalled();
      expect(MockEventService.handleEvent).toHaveBeenCalled();
    });

    it('should handle errors when creating an identity verification', () => {
      MockIdentityVerificationsService.createIdentityVerification.and.returnValue(
        error$
      );

      service.createIdentityVerification().subscribe();

      expect(MockErrorService.handleError).toHaveBeenCalled();
      expect(MockEventService.handleEvent).toHaveBeenCalled();
    });
  });

  describe('when getting an identity verification', () => {
    afterEach(() => {
      MockIdentityVerificationsService.getIdentityVerification.and.returnValue(
        TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
      );
    });

    it('should get an identity verification', () => {
      const guid = TestConstants.IDENTITY_VERIFICATION_BANK_MODEL.guid;
      service
        .getIdentityVerification(<string>guid)
        .subscribe((identity: IdentityVerificationWithDetailsBankModel) => {
          expect(identity).toEqual(
            TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
          );
        });

      expect(
        MockIdentityVerificationsService.getIdentityVerification
      ).toHaveBeenCalled();
    });

    it('should handle errors', () => {
      MockIdentityVerificationsService.getIdentityVerification.and.returnValue(
        error$
      );

      service.getIdentityVerification('').subscribe();

      expect(MockErrorService.handleError).toHaveBeenCalled();
      expect(MockEventService.handleEvent).toHaveBeenCalled();
    });
  });

  describe('when listing identity verifications', () => {
    afterEach(() => {
      MockIdentityVerificationsService.listIdentityVerifications.and.returnValue(
        TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
      );
    });

    it('should list identity verifications', () => {
      const page = '0';
      const perPage = '10';

      service
        .listIdentityVerifications(page, perPage)
        .subscribe((list: IdentityVerificationListBankModel) => {
          expect(list).toEqual(
            TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL
          );
        });

      expect(
        MockIdentityVerificationsService.listIdentityVerifications
      ).toHaveBeenCalledWith(page, perPage);
    });

    it('should handle errors', () => {
      MockIdentityVerificationsService.listIdentityVerifications.and.returnValue(
        error$
      );

      service.listIdentityVerifications().subscribe();

      expect(MockErrorService.handleError).toHaveBeenCalled();
      expect(MockEventService.handleEvent).toHaveBeenCalled();
    });
  });
});
