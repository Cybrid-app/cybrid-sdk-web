import { TestBed } from '@angular/core/testing';

import { TestPricesService } from './test-prices.service';

describe('TestPricesService', () => {
  let service: TestPricesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestPricesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
