import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderFactory } from '../../../modules/library.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

// Client
import { AssetBankModel } from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  ExternalWalletService,
  AssetService,
  ConfigService,
  ErrorService,
  EventService,
  RoutingService
} from '@services';

// Components
import { ExternalWalletDetailComponent } from '@components';

// Utility
import { MockAssetFormatPipe, AssetFormatPipe, AssetIconPipe } from '@pipes';
import { TestConstants } from '@constants';
import { SharedModule } from '../../../../shared/modules/shared.module';

describe('ExternalWalletDetailComponent', () => {
  let component: ExternalWalletDetailComponent;
  let fixture: ComponentFixture<ExternalWalletDetailComponent>;

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
  let MockExternalWalletService = jasmine.createSpyObj(
    'ExternalWalletService',
    ['getExternalWallet', 'deleteExternalWallet']
  );
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  const error$ = throwError(() => {
    new Error('Error');
  });
  class MockAssetService {
    constructor() {}
    getAsset(code: string): AssetBankModel {
      if (code == 'USD') return TestConstants.USD_ASSET;
      else return TestConstants.USD_ASSET;
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ExternalWalletDetailComponent,
        MockAssetFormatPipe,
        AssetIconPipe
      ],
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
        { provide: AssetService, useClass: MockAssetService },
        { provide: AssetFormatPipe, useClass: MockAssetFormatPipe },
        { provide: ExternalWalletService, useValue: MockExternalWalletService },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: RoutingService, useValue: MockRoutingService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));

    MockExternalWalletService = TestBed.inject(ExternalWalletService);
    MockExternalWalletService.getExternalWallet.and.returnValue(
      of(TestConstants.EXTERNAL_WALLET_BANK_MODEL)
    );
    MockExternalWalletService.deleteExternalWallet.and.returnValue(
      of(TestConstants.EXTERNAL_WALLET_BANK_MODEL)
    );
    MockRoutingService = TestBed.inject(RoutingService);

    fixture = TestBed.createComponent(ExternalWalletDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should log an event when the component is initialized', () => {
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('isLoadingWallet toBeFalsy', () => {
    component.currentWallet$.next(TestConstants.EXTERNAL_WALLET_BANK_MODEL);
    component.isLoadingWallet$.subscribe((value) => {
      expect(value).toBeFalsy();
    });
  });

  it('isLoadingWallet toBeTruthy', () => {
    component.currentWallet$.next(null);
    component.isLoadingWallet$.subscribe((value) => {
      expect(value).toBeTruthy();
    });
  });

  describe('when getWallet', () => {
    it('should get wallet', () => {
      component.getWallet();
      expect(MockExternalWalletService.getExternalWallet).toHaveBeenCalled();
    });

    it('should handle get wallet errors', () => {
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');

      MockExternalWalletService.getExternalWallet.and.returnValue(error$);
      component.getWallet();

      expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
    });
  });

  describe('when onDeleteWallet', () => {
    it('should delete wallet', () => {
      component.onDeleteWallet();
      expect(MockExternalWalletService.deleteExternalWallet).toHaveBeenCalled();
    });

    it('should handle delete wallet errors', () => {
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');

      MockExternalWalletService.deleteExternalWallet.and.returnValue(error$);
      component.onDeleteWallet();

      expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
    });
  });
});
