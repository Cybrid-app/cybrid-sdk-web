import {
    ComponentFixture,
    TestBed
} from '@angular/core/testing';
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
  AccountService,
  AssetService,
  ConfigService,
  ErrorService,
  EventService,
  RoutingService
} from '@services';

// Components
import { ExternalWalletCreateComponent } from '@components';

// Utility
import { MockAssetFormatPipe, AssetFormatPipe, AssetIconPipe } from '@pipes';
import { TestConstants } from '@constants';
import { SharedModule } from '../../../../shared/modules/shared.module';

describe('ExternalWalletCreateComponent', () => {
    let component: ExternalWalletCreateComponent;
    let fixture: ComponentFixture<ExternalWalletCreateComponent>;

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
        'ExternalWalletService', ['createExternalWallet']
      );
      let MockAccountService = jasmine.createSpyObj(
        'AccountService', ['listAccounts']
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
            ExternalWalletCreateComponent,
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
            { provide: AccountService, useValue: MockAccountService },
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
        MockExternalWalletService.createExternalWallet.and.returnValue(
          of(TestConstants.EXTERNAL_WALLET_BANK_MODEL)
        );

        MockAccountService = TestBed.inject(AccountService);
        MockAccountService.listAccounts.and.returnValue(
            of(TestConstants.ACCOUNT_LIST_BANK_MODEL)
        );

        MockRoutingService = TestBed.inject(RoutingService);
    
        fixture = TestBed.createComponent(ExternalWalletCreateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('it should log an event when the component is initialized', () => {
        expect(MockEventService.handleEvent).toHaveBeenCalled();
      });

      it('isLoadingAccounts toBeFalsy', () => {
        component.accounts$.next(TestConstants.ACCOUNT_LIST_BANK_MODEL.objects);
        component.isLoadingAccounts$.subscribe((value) => {
          expect(value).toBeFalsy();
        });
      });
    
      it('isLoadingAccounts toBeTruthy', () => {
        component.accounts$.next(null);
        component.isLoadingAccounts$.subscribe((value) => {
          expect(value).toBeTruthy();
        });
      });

      describe('when listAccounts', () => {
        it('should list accounts', () => {
          component.listAccounts();
          expect(MockAccountService.listAccounts).toHaveBeenCalled();
        });
    
        it('should handle list accounts errors', () => {
          const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');
    
          MockAccountService.listAccounts.and.returnValue(error$);
          component.listAccounts();
    
          expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
        });
      });

      describe('when onCreateWallet', () => {

        it('should create wallet', () => {

            component.onCreateWallet();

            component.newWalletFormGroup.controls['account'].setValue(TestConstants.ACCOUNT_BANK_MODEL_BTC);
            component.newWalletFormGroup.controls['name'].setValue("Test");
            component.newWalletFormGroup.controls['address'].setValue("Test");
            component.newWalletFormGroup.controls['tag'].setValue("Test");
            component.onCreateWallet();
            expect(MockExternalWalletService.createExternalWallet).toHaveBeenCalled();
          });
    
        it('should handle create wallet errors', () => {

            component.newWalletFormGroup.controls['account'].setValue(TestConstants.ACCOUNT_BANK_MODEL_BTC);
            component.newWalletFormGroup.controls['name'].setValue("Test");
            component.newWalletFormGroup.controls['address'].setValue("Test");
            component.newWalletFormGroup.controls['tag'].setValue("Test");
          const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');
    
          MockExternalWalletService.createExternalWallet.and.returnValue(error$);
          component.onCreateWallet();
    
          expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
        });
      });

      describe('when validateForm', () => {
        it('should return with empty name', () => {
            expect(component.validateForm("", "")).toBeFalsy();
            expect(component.validateForm(undefined, "")).toBeFalsy();
        });

        it('should return with empty address', () => {
            expect(component.validateForm("Test", "")).toBeFalsy();
            expect(component.validateForm("Test", undefined)).toBeFalsy();
        });

        it('should return true', () => {
            expect(component.validateForm("Test", "Test")).toBeTruthy();
        });
      });

      describe('when createPostExternalWalletBankModel', () => {
        it('with empty tag', () => {
            let post = component.createPostExternalWalletBankModel("BTC", "123", "456", "")
            expect(post.name).toEqual("123");
            expect(post.tag).toBeNull();
        });
        it('with tag', () => {
            let post = component.createPostExternalWalletBankModel("BTC", "123", "456", "999")
            expect(post.name).toEqual("123");
            expect(post.tag).toEqual("999");
        });
      });

      it('onWallets()', () => {
        component.onWallets();
        // Test default config.routing=true
        expect(MockRoutingService.handleRoute).toHaveBeenCalledWith({
          route: 'external-wallet-list',
          origin: 'external-wallet-create',
          extras: {
            queryParams: {}
          }
        });
      });
});