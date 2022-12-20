import { TestBed } from '@angular/core/testing';

import { TestAccountsService } from './test-accounts.service';

describe('TestAccountsService', () => {
  let service: TestAccountsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestAccountsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
