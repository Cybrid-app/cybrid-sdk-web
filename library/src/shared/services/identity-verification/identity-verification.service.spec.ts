import { TestBed } from '@angular/core/testing';

import { IdentityVerificationService } from './identity-verification.service';

describe('IdentityVerificationService', () => {
  let service: IdentityVerificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IdentityVerificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
