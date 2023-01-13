import { TestBed } from '@angular/core/testing';

import { DemoErrorService } from './demo-error.service';

describe('DemoErrorService', () => {
  let service: DemoErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemoErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
