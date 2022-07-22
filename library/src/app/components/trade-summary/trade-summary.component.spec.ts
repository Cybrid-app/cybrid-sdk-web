import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeSummaryComponent } from './trade-summary.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  TranslateLoader,
  TranslateModule,
  TranslatePipe
} from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { EventService } from '../../../shared/services/event/event.service';
import { ErrorService } from '../../../shared/services/error/error.service';
import { ConfigService } from '../../../shared/services/config/config.service';
import { TradesService } from '@cybrid/cybrid-api-bank-angular';
import { TestConstants } from '../../../shared/constants/test.constants';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RoutingService } from '../../../shared/services/routing/routing.service';
import { PriceListComponent } from '../price-list/price-list.component';

describe('TradeSummaryComponent', () => {
  let component: TradeSummaryComponent;
  let fixture: ComponentFixture<TradeSummaryComponent>;

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
  let MockTradesService = jasmine.createSpyObj('TradesService', ['getTrade']);
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  let MockSnackbar = jasmine.createSpyObj('Snackbar', ['open']);
  let MockDialogRef = jasmine.createSpyObj('MatDialogRef', ['open', 'close']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        MatDialogModule,
        MatSnackBarModule,
        RouterTestingModule.withRoutes([
          {
            path: 'app',
            children: [
              {
                path: 'price-list',
                component: PriceListComponent
              }
            ]
          }
        ]),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      declarations: [TradeSummaryComponent],
      providers: [
        { provide: TradesService, useValue: MockTradesService },
        { provide: RoutingService, useValue: MockRoutingService },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            model: TestConstants.QUOTE_BANK_MODEL,
            asset: TestConstants.BTC_ASSET,
            counter_asset: TestConstants.USD_ASSET
          }
        },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: MatDialogRef, useValue: MockDialogRef },
        { provide: MatSnackBar, useValue: MockSnackbar },
        TranslatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockTradesService = TestBed.inject(TradesService);
    MockTradesService.getTrade.and.returnValue(
      of(TestConstants.TRADE_BANK_MODEL)
    );
    MockRoutingService = TestBed.inject(RoutingService);
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should getTrade()', () => {
    const trade$Spy = spyOn(component.trade$, 'next');
    component.ngOnInit();
    expect(MockTradesService.getTrade).toHaveBeenCalled();
    expect(trade$Spy).toHaveBeenCalled();
  });

  it('should catch errors when fetching a trade', () => {
    const error$ = throwError(() => {
      new Error('Error');
    });
    MockTradesService.getTrade.and.returnValue(error$);
    component.ngOnInit();
    expect(MockSnackbar.open).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockDialogRef.close).toHaveBeenCalled();
  });

  it('should route to the price-list onDialogClose()', () => {
    component.onDialogClose();
    expect(MockRoutingService.handleRoute).toHaveBeenCalled();
  });
});
