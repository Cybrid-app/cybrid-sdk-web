import { TestBed } from '@angular/core/testing';

import { DemoViewerService } from './demo-viewer.service';

describe('DemoViewerService', () => {
  let service: DemoViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemoViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
