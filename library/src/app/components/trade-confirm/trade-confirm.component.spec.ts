import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import { TradeConfirmComponent } from './trade-confirm.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  TranslateLoader,
  TranslateModule,
  TranslatePipe
} from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '../../../shared/services/event/event.service';
import { ErrorService } from '../../../shared/services/error/error.service';
import { ConfigService } from '../../../shared/services/config/config.service';
import { of, throwError } from 'rxjs';
import { TestConstants } from '../../../shared/constants/test.constants';
import { QuotesService, TradesService } from '@cybrid/cybrid-api-bank-angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TradeConfirmComponent', () => {
  let component: TradeConfirmComponent;
  let fixture: ComponentFixture<TradeConfirmComponent>;

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
  let MockQuotesService = jasmine.createSpyObj('QuotesService', [
    'createQuote'
  ]);
  let MockTradesService = jasmine.createSpyObj('TradesService', [
    'createTrade'
  ]);
  let MockSnackbar = jasmine.createSpyObj('Snackbar', ['open']);
  let MockDialogRef = jasmine.createSpyObj('MatDialogRef', ['open', 'close']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TradeConfirmComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        MatDialogModule,
        MatSnackBarModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: MatDialogRef, useValue: MockDialogRef },
        { provide: MatSnackBar, useValue: MockSnackbar },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: QuotesService, useValue: MockQuotesService },
        { provide: TradesService, useValue: MockTradesService },
        TranslatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockDialogRef = TestBed.inject(MatDialogRef);
    MockDialogRef.open.and.returnValue({ afterClosed: () => of({ id: 1 }) });
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockQuotesService = TestBed.inject(QuotesService);
    MockQuotesService.createQuote.and.returnValue(
      of(TestConstants.QUOTE_BANK_MODEL)
    );
    MockTradesService.createTrade.and.returnValue(of({}));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeConfirmComponent);
    component = fixture.componentInstance;
    component.data = {
      model: TestConstants.POST_QUOTE,
      asset: TestConstants.BTC_ASSET,
      counter_asset: TestConstants.USD_ASSET
    };
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch the refresh interval', () => {
    expect(component.refreshInterval).toEqual(
      TestConstants.CONFIG.refreshInterval
    );
  });

  it('should create a quote', () => {
    expect(component.postTradeBankModel.quote_guid).toEqual(
      TestConstants.QUOTE_BANK_MODEL.guid!
    );
    component.quote$.subscribe((quote) => {
      expect(quote).toEqual(TestConstants.QUOTE_BANK_MODEL);
    });
  });

  it('should catch errors when creating a quote', () => {
    const refreshSubSpy = spyOn(component.refreshSub, 'unsubscribe');
    const error$ = throwError(() => {
      new Error('Error');
    });
    MockQuotesService.createQuote.and.returnValue(error$);
    component.createQuote();
    expect(refreshSubSpy).toHaveBeenCalled();
    expect(MockSnackbar.open).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockDialogRef.close).toHaveBeenCalled();
  });

  it('should refresh data', fakeAsync(() => {
    const createQuoteSpy = spyOn(component, 'createQuote');
    component.ngOnInit();
    tick(TestConstants.CONFIG.refreshInterval);
    expect(createQuoteSpy).toHaveBeenCalledTimes(2);
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('should create trade onConfirmTrade()', () => {
    component.onConfirmTrade();
    expect(MockTradesService.createTrade).toHaveBeenCalled();
    expect(MockDialogRef.close).toHaveBeenCalled();
  });

  it('should catch errors when creating a trade', () => {
    const error$ = throwError(() => {
      new Error('Error');
    });
    MockTradesService.createTrade.and.returnValue(error$);
    component.onConfirmTrade();
    expect(MockSnackbar.open).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockDialogRef.close).toHaveBeenCalled();
  });
});
