import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import { of, throwError } from 'rxjs';

// Services
import {
  ConfigService,
  EventService,
  ErrorService,
  AccountService,
  PriceService,
  QuoteService,
  AssetService
} from '@services';

// Components
import { TradeComponent, TradeConfirmComponent } from '@components';

// Utility
import { AssetFormatPipe, AssetPipe } from '@pipes';
import { TestConstants } from '@constants';

describe('TradeComponent', () => {
  let component: TradeComponent;
  let fixture: ComponentFixture<TradeComponent>;

  let MockEventService = jasmine.createSpyObj('EventService', [
    'getEvent',
    'handleEvent'
  ]);
  let MockErrorService = jasmine.createSpyObj('ErrorService', [
    'getError',
    'handleError'
  ]);
  let MockConfigService = jasmine.createSpyObj('ConfigService', ['getConfig$']);
  let MockAccountService = jasmine.createSpyObj('AccountService', [
    'getAccounts'
  ]);
  let MockPriceService = jasmine.createSpyObj('PriceService', ['listPrices']);
  let MockQueryParams = of({
    symbol_pair: 'BTC-USD'
  });
  let MockDialogService = jasmine.createSpyObj('MockDialogService', ['open']);
  const error$ = throwError(() => {
    new Error('Error');
  });
  let MockQuoteService = jasmine.createSpyObj('QuoteService', ['getQuote']);
  let MockAssetService = jasmine.createSpyObj('AssetService', ['getAssets$']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TradeComponent, AssetFormatPipe],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
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
        { provide: AssetService, useValue: MockAssetService },
        { provide: AccountService, useValue: MockAccountService },
        { provide: PriceService, useValue: MockPriceService },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: QuoteService, useValue: MockQuoteService },
        { provide: MatDialog, useValue: MockDialogService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: MockQueryParams
          }
        },
        AssetFormatPipe
      ]
    }).compileComponents();
    MockAssetService = TestBed.inject(AssetService);
    MockAssetService.getAssets$.and.returnValue(of(TestConstants.ASSETS));
    MockAccountService.getAccounts.and.returnValue(
      of(TestConstants.ACCOUNT_LIST_BANK_MODEL)
    );
    MockPriceService = TestBed.inject(PriceService);
    MockPriceService.listPrices.and.returnValue(
      of([TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY])
    );
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
    MockQuoteService = TestBed.inject(QuoteService);
    MockQuoteService.getQuote.and.returnValue(TestConstants.POST_QUOTE);

    fixture = TestBed.createComponent(TradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
