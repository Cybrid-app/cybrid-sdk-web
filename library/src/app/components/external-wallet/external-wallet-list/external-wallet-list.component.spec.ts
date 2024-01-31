import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSort } from '@angular/material/sort';

import { HttpLoaderFactory } from '../../../modules/library.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

// Client
import {
  AssetBankModel,
  ExternalWalletBankModel
} from '@cybrid/cybrid-api-bank-angular';

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
import { ExternalWalletListComponent } from '@components';

// Utility
import { MockAssetFormatPipe, AssetFormatPipe, AssetIconPipe } from '@pipes';
import { Constants, TestConstants } from '@constants';
import { SharedModule } from '../../../../shared/modules/shared.module';

describe('ExternalWalletListComponent', () => {
  let component: ExternalWalletListComponent;
  let fixture: ComponentFixture<ExternalWalletListComponent>;

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
    ['listExternalWallets']
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
        ExternalWalletListComponent,
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
    MockExternalWalletService.listExternalWallets.and.returnValue(
      of(TestConstants.EXTERNAL_WALLET_LIST_BANK_MODEL)
    );
    MockRoutingService = TestBed.inject(RoutingService);

    fixture = TestBed.createComponent(ExternalWalletListComponent);
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
    component.walletList$.next(TestConstants.EXTERNAL_WALLET_LIST_BANK_MODEL);
    component.isLoadingWallets$.subscribe((value) => {
      expect(value).toBeFalsy();
    });
  });

  it('isLoading toBeTruthy', () => {
    component.walletList$.next(null);
    component.isLoadingWallets$.subscribe((value) => {
      expect(value).toBeTruthy();
    });
  });

  describe('when listExternalWallets', () => {
    it('should list external wallets', () => {
      component.refreshData();
      expect(MockExternalWalletService.listExternalWallets).toHaveBeenCalled();
    });

    it('should handle list deposit addresses errors', () => {
      const isRecoverable$Spy = spyOn(component.isRecoverable$, 'next');

      MockExternalWalletService.listExternalWallets.and.returnValue(error$);
      component.listExternalWallets();

      expect(isRecoverable$Spy).toHaveBeenCalledWith(false);
    });
  });

  describe('when paginating', () => {
    it('should update the current page', () => {
      const pageIndex = 1;
      const pageEvent: PageEvent = {
        pageIndex: pageIndex,
        pageSize: component.pageSize,
        length: component.totalRows
      };

      component.pageChange(pageEvent);

      expect(component.currentPage).toBe(pageIndex);
    });

    it('should update the page size', () => {
      const pageSize = 20;
      const pageEvent: PageEvent = {
        pageIndex: 0,
        pageSize: pageSize,
        length: component.totalRows
      };

      component.pageChange(pageEvent);

      expect(component.pageSize).toBe(pageSize);
    });

    it('should list wallets', () => {
      const listExternalWalletsSpy = spyOn(component, 'listExternalWallets');
      const pageEvent: PageEvent = {
        pageIndex: component.currentPage,
        pageSize: component.pageSize,
        length: component.totalRows
      };
      component.pageChange(pageEvent);
      expect(listExternalWalletsSpy).toHaveBeenCalled();
    });
  });

  it('should sort', () => {
    component.dataSource.sort = null;

    component.sortChange();

    expect(component.dataSource.sort).toBeDefined();
  });

  describe('when sorting wallets', () => {
    it('should sort by name', () => {
      let wallet: ExternalWalletBankModel =
        TestConstants.EXTERNAL_WALLET_BANK_MODEL;
      let sort = component.sortingWalletsDataAccessor(wallet, 'name');
      expect(sort).toEqual(<string>wallet.name);
    });

    it('should sort by state', () => {
      let wallet: ExternalWalletBankModel =
        TestConstants.EXTERNAL_WALLET_BANK_MODEL;
      let sort = component.sortingWalletsDataAccessor(wallet, 'state');
      expect(sort).toEqual(<string>wallet.state);
    });

    it('should sort by default', () => {
      let wallet: ExternalWalletBankModel =
        TestConstants.EXTERNAL_WALLET_BANK_MODEL;
      let sort = component.sortingWalletsDataAccessor(wallet, '');
      expect(sort).toEqual('');
    });
  });

  it('onAddWallet', () => {
    component.onAddWallet();

    // Test default config.routing=true
    expect(MockRoutingService.handleRoute).toHaveBeenCalledWith({
      route: 'external-wallet-create',
      origin: 'external-wallet-list',
      extras: {
        queryParams: {}
      }
    });
  });

  it('onWalletClick', () => {
    component.onWalletClick(TestConstants.EXTERNAL_WALLET_BANK_MODEL);

    // Test default config.routing=true
    expect(MockRoutingService.handleRoute).toHaveBeenCalledWith({
      route: 'external-wallet-detail',
      origin: 'external-wallet-list',
      extras: {
        queryParams: {
          walletGuid: TestConstants.EXTERNAL_WALLET_BANK_MODEL.guid
        }
      }
    });
  });
});
