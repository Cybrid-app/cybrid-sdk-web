import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import { TradeComponent } from './trade.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { AssetPipe } from '../../../../../src/shared/pipes/asset.pipe';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TestConstants } from '../../../../../src/shared/constants/test.constants';
import { AssetService } from '../../../../../src/shared/services/asset/asset.service';
import { PricesService } from '@cybrid/cybrid-api-bank-angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from '@angular/flex-layout/_private-utils/testing';
import { EventService } from '../../../../../src/shared/services/event/event.service';
import { ErrorService } from '../../../../../src/shared/services/error/error.service';
import { ConfigService } from '../../../../../src/shared/services/config/config.service';

describe('TradeComponent', () => {
  let component: TradeComponent;
  let fixture: ComponentFixture<TradeComponent>;

  let MockAssetService = jasmine.createSpyObj('AssetService', [
    'getAsset',
    'getAssets$'
  ]);
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
    'getConfig$'
  ]);
  let MockPricesService = jasmine.createSpyObj('PricesService', ['listPrices']);
  let MockQueryParams = of({
    asset: JSON.stringify(TestConstants.BTC_ASSET),
    symbol_pair: TestConstants.SYMBOL_PRICE_BANK_MODEL.symbol
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TradeComponent, AssetPipe],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: AssetService, useValue: MockAssetService },
        { provide: PricesService, useValue: MockPricesService },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: MockQueryParams
          }
        },
        AssetPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockAssetService = TestBed.inject(AssetService);
    MockAssetService.getAssets$.and.returnValue(of(TestConstants.ASSETS));
    MockPricesService = TestBed.inject(PricesService);
    MockPricesService.listPrices.and.returnValue(
      of([TestConstants.SYMBOL_PRICE_BANK_MODEL])
    );
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeComponent);
    component = fixture.componentInstance;
    component.isLoading$.next(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get router parameters', () => {
    expect(component.quote.asset).toEqual(TestConstants.BTC_ASSET);
    expect(component.quote.counterAsset.code).toEqual('CAD');
  });

  it('should get assets and filter them', () => {
    const filteredAssetList = [
      TestConstants.BTC_ASSET,
      TestConstants.ETH_ASSET
    ];
    component.ngOnInit();
    expect(component.assetList).toEqual(TestConstants.ASSETS);
    expect(component.filteredAssetList).toEqual(filteredAssetList);
  });

  it('should initialize the quote group', () => {
    const getPriceSpy = spyOn(component, 'getPrice');
    component.ngOnInit();
    expect(getPriceSpy).toHaveBeenCalled();
    expect(component.quote.asset).toEqual(TestConstants.BTC_ASSET);
  });

  it('should get prices', () => {
    // Test with default input of 'fiat'
    component.quoteGroup.patchValue({
      asset: TestConstants.BTC_ASSET,
      amount: 10
    });
    expect(component.price).toEqual(TestConstants.SYMBOL_PRICE_BANK_MODEL);
    expect(component.quote.amount).toEqual(10);
    expect(component.quote.value).toEqual(10);

    // Test with input set to 'crypto'
    component.input = 'crypto';
    component.getPrice();
    expect(component.quote.amount).toEqual(1000);
    expect(component.quote.value).toEqual(1000);
  });

  it('should log an event when getPrice() is called', () => {
    component.ngOnInit();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should log an event and error if getPrice() is unsuccessful', () => {
    const error$ = throwError(() => {
      return new Error('Error');
    });
    MockPricesService.listPrices.and.returnValue(of(error$));
    component.ngOnInit();
    component.getPrice();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
  });

  it('should log an event when it refreshes data', fakeAsync(() => {
    const getPriceSpy = spyOn(component, 'getPrice');
    component.ngOnInit();
    tick(TestConstants.CONFIG.refreshInterval);
    expect(getPriceSpy).toHaveBeenCalledTimes(3);
    discardPeriodicTasks();
  }));

  it('should switch the input between fiat and crypto', () => {
    component.ngOnInit();
    component.onSwitchInput(); // Default starts on 'fiat'
    expect(component.input).toEqual('crypto');
    expect(component.quote.amount).toBeNull();
    component.onSwitchInput();
    expect(component.input).toEqual('fiat');
    expect(component.quote.amount).toBeNull();

    // Test input patch value branch case
    component.quoteGroup.patchValue({
      asset: TestConstants.BTC_ASSET,
      amount: 10
    });
    component.onSwitchInput();
    expect(component.quote.amount).toEqual(1000);
    component.onSwitchInput();
    expect(component.quote.amount).toEqual(10);
  });
});
