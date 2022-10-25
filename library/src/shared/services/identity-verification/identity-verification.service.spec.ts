import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { HttpLoaderFactory } from '../../../app/modules/library.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { IdentityVerificationService } from '@services';

describe('IdentityVerificationService', () => {
  let service: IdentityVerificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ]
    });
    service = TestBed.inject(IdentityVerificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
