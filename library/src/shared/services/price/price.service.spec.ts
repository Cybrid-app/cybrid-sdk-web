import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Services
import { ErrorService, EventService, PriceService } from '@services';
import { of, throwError } from 'rxjs';
import { TestConstants } from '@constants';
import { PricesService } from '@cybrid/cybrid-api-bank-angular';

describe('PriceService', () => {
  let service: PriceService;

  let MockEventService = jasmine.createSpyObj('EventService', [
    'getEvent',
    'handleEvent'
  ]);
  let MockErrorService = jasmine.createSpyObj('ErrorService', [
    'getError',
    'handleError'
  ]);
  let MockPricesService = jasmine.createSpyObj('PricesService', ['listPrices']);
  const error$ = throwError(() => {
    new Error('Error');
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: ErrorService, useValue: MockErrorService },
        { provide: EventService, useValue: MockEventService },
        { provide: PricesService, useValue: MockPricesService }
      ]
    });
    service = TestBed.inject(PriceService);
    MockErrorService = TestBed.inject(ErrorService);
    MockEventService = TestBed.inject(EventService);
    MockPricesService = TestBed.inject(PricesService);
    MockPricesService.listPrices.and.returnValue(
      of(TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY)
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list prices', () => {
    service.listPrices().subscribe((pricesList) => {
      expect(pricesList).toEqual(TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY);
      expect(MockEventService.handleEvent).toHaveBeenCalled();
    });
  });

  it('should handle errors on list prices', () => {
    MockPricesService.listPrices.and.returnValue(error$);

    service.listPrices().subscribe(() => {
      expect(MockEventService.handleEvent).toHaveBeenCalled();
      expect(MockErrorService.handleError).toHaveBeenCalled();
    });
  });
});
