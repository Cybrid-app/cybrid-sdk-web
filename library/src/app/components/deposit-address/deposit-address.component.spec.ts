import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { QRCodeModule } from 'angularx-qrcode';

// Client
import { AssetBankModel } from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  AccountService,
  AssetService,
  DepositAddressService,
  ConfigService,
  ErrorService,
  EventService,
  RoutingService
} from '@services';

// Components
import { DepositAddressComponent } from '@components';

// Utility
import { MockAssetFormatPipe, AssetFormatPipe, AssetIconPipe } from '@pipes';
import { Constants, TestConstants } from '@constants';

describe('DepositAddressComponent', () => {
  let component: DepositAddressComponent;
  let fixture: ComponentFixture<DepositAddressComponent>;

  let MockEventService = jasmine.createSpyObj('EventService', [
    'getEvent',
    'handleEvent'
  ]);
  let MockErrorService = jasmine.createSpyObj('ErrorService', [
    'getError',
    'handleError'
  ]);
  let MockConfigService = jasmine.createSpyObj('ConfigService', [
    'setConfig',
    'getConfig$',
    'getComponent$'
  ]);
  let queryParams = of({
    accountGuid: TestConstants.ACCOUNT_GUID
  });
  let MockAccountService = jasmine.createSpyObj('AccountService', [
    'getAccount'
  ]);
  let MockDepositAddressService = jasmine.createSpyObj(
    'DepositAddressService',
    ['listDepositAddresses', 'getDepositAddress', 'createDepositAddress']
  );
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  let MockDialogService = jasmine.createSpyObj('MockDialogService', ['open']);
  const error$ = throwError(() => {
    new Error('Error');
  });

  class MockAssetService {
    constructor() {}
    getAsset(code: string): AssetBankModel {
      if (code == 'BTC') return TestConstants.BTC_ASSET;
      else return TestConstants.BTC_ASSET;
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DepositAddressComponent,
        MockAssetFormatPipe,
        AssetIconPipe
      ],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        QRCodeModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: AssetService, useClass: MockAssetService },
        { provide: AccountService, useValue: MockAccountService },
        { provide: DepositAddressService, useValue: MockDepositAddressService },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: RoutingService, useValue: MockRoutingService },
        { provide: AssetFormatPipe, useClass: MockAssetFormatPipe },
        { provide: MatDialog, useValue: MockDialogService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParams
          }
        },
        AssetIconPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockDialogService = TestBed.inject(MatDialog);
    MockDialogService.open.and.returnValue({
      afterClosed: () =>
        of({
          hasAccepted: true
        })
    });

    MockDepositAddressService = TestBed.inject(DepositAddressService);
    MockDepositAddressService.listDepositAddresses.and.returnValue(
      of(TestConstants.DEPOSIT_ADDRESS_LIST_BANK_MODEL)
    );
    MockDepositAddressService.getDepositAddress.and.returnValue(
      of(TestConstants.DEPOSIT_ADDRESS_BANK_MODEL)
    );
    MockDepositAddressService.createDepositAddress.and.returnValue(
      of(TestConstants.DEPOSIT_ADDRESS_BANK_MODEL)
    );

    MockAccountService = TestBed.inject(AccountService);
    MockAccountService.getAccount.and.returnValue(
      of(TestConstants.ACCOUNT_BANK_MODEL_BTC)
    );
    MockRoutingService = TestBed.inject(RoutingService);

    fixture = TestBed.createComponent(DepositAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should log an event when the component is initialized', () => {
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('isLoading toBeFalsy', () => {
    component.account$.next(TestConstants.ACCOUNT_BANK_MODEL_BTC);
    component.depositAddress$.next(TestConstants.DEPOSIT_ADDRESS_BANK_MODEL);
    component.isLoading$.subscribe((value) => {
      expect(value).toBeFalsy();
    });
  });

  it('isLoading toBeTruthy', () => {
    component.account$.next(null);
    component.depositAddress$.next(null);
    component.isLoading$.subscribe((value) => {
      expect(value).toBeTruthy();
    });
  });

  describe('when getting an account', () => {
    it('should get account', () => {
      expect(MockAccountService.getAccount).toHaveBeenCalled();
    });

    it('should get assets', () => {
      component.asset = null;
      component.getAccount();
      expect(component.asset).toBeDefined();
    });

    it('should set account', () => {
      const account$spy = spyOn(component.account$, 'next');
      component.getAccount();
      expect(account$spy).toHaveBeenCalled();
    });

    it('should handle get account errors', () => {
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');
      MockAccountService.getAccount.and.returnValue(error$);

      component.getAccount();

      expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
    });
  });

  describe('when listDepositAddresses', () => {
    it('should list deposit addresses', () => {
      component.refreshData();
      expect(MockDepositAddressService.listDepositAddresses).toHaveBeenCalled();
    });

    it('should handle list deposit addresses errors', () => {
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');

      MockDepositAddressService.listDepositAddresses.and.returnValue(error$);
      component.listDepositAddresses();

      expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
    });
  });

  describe('when getDepositAddress', () => {
    it('should get depositAddress', () => {
      const depositAddress$spy = spyOn(component.depositAddress$, 'next');

      component.getDepositAddress('');

      expect(MockDepositAddressService.getDepositAddress).toHaveBeenCalled();
      expect(depositAddress$spy).toHaveBeenCalled();
    });

    it('should handle errors', () => {
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');

      MockDepositAddressService.getDepositAddress.and.returnValue(error$);
      component.getDepositAddress('');

      expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
    });
  });

  describe('when createDepositAddress', () => {
    it('should create deposit address', () => {
      const depositAddress$spy = spyOn(component.depositAddress$, 'next');

      component.createDepositAddress();

      expect(MockDepositAddressService.createDepositAddress).toHaveBeenCalled();
      expect(depositAddress$spy).toHaveBeenCalled();
    });

    it('should handle errors', () => {
      const depositAddress$spy = spyOn(component.depositAddress$, 'next');
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');

      MockDepositAddressService.createDepositAddress.and.returnValue(error$);
      component.createDepositAddress();

      expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
    });
  });

  describe('when verifyingAtLeastHaveOneAddress', () => {
    it('should createDepositAddress', () => {
      const depositAddresses =
        TestConstants.DEPOSIT_ADDRESS_LIST_BANK_MODEL.objects;
      const createDepositAddressSpy = spyOn(component, 'createDepositAddress');

      component.verifyingAtLeastHaveOneAddress(depositAddresses);

      expect(createDepositAddressSpy).toHaveBeenCalled();
    });

    it('should getDepositAddress', () => {
      const depositAddresses =
        TestConstants.DEPOSIT_ADDRESS_LIST_BANK_MODEL.objects;
      const getDepositAddressSpy = spyOn(component, 'getDepositAddress');

      component.accountGuid = '123456789';
      component.verifyingAtLeastHaveOneAddress(depositAddresses);

      expect(getDepositAddressSpy).toHaveBeenCalled();
    });
  });

  describe('when checkDepositAddressValue', () => {
    it('should not call createAddressUrl', () => {
      const depositAddress = TestConstants.STORING_DEPOSIT_ADDRESS_BANK_MODEL;
      const createAddressUrlSpy = spyOn(component, 'createAddressUrl');

      component.checkDepositAddressValue(depositAddress);

      expect(createAddressUrlSpy).toHaveBeenCalledTimes(0);
    });

    it('should call createAddressUrl', () => {
      const depositAddress = TestConstants.DEPOSIT_ADDRESS_BANK_MODEL;
      const createAddressUrlSpy = spyOn(component, 'createAddressUrl');

      component.checkDepositAddressValue(depositAddress);

      expect(createAddressUrlSpy).toHaveBeenCalled();
    });

    it('should call createAddressUrl with undefined address and asset', () => {
      const depositAddress = TestConstants.DEPOSIT_ADDRESS_BANK_MODEL;
      depositAddress.asset = undefined;
      depositAddress.address = undefined;
      const createAddressUrlSpy = spyOn(component, 'createAddressUrl');

      component.checkDepositAddressValue(depositAddress);

      expect(createAddressUrlSpy).toHaveBeenCalled();
    });
  });

  describe('when createAddressUrl', () => {
    it('should create url for BTC', () => {
      component.createAddressUrl('string', 'BTC');
      expect(component.depositAddressUrl$.value).toEqual('bitcoin:string');

      component.createAddressUrl('12345', 'BTC', '1');
      expect(component.depositAddressUrl$.value).toEqual(
        'bitcoin:12345&amount=1'
      );

      component.createAddressUrl('12345', 'BTC', '1', 'Hello');
      expect(component.depositAddressUrl$.value).toEqual(
        'bitcoin:12345&amount=1?message=Hello'
      );
    });

    it('should create url for default', () => {
      component.createAddressUrl('1234', 'DOGE');
      expect(component.depositAddressUrl$.value).toEqual('1234');
    });
  });

  describe('when openPaymentDialog', () => {
    it('should open', () => {
      //fixture.detectChanges();
      component.openPaymentDialog();
      expect(MockDialogService.open).toHaveBeenCalled();
    });
  });
});
