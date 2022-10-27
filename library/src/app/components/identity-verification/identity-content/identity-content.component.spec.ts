import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { HttpLoaderFactory } from '../../../modules/library.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { IdentityContentComponent } from '@components';
import { TestConstants } from '@constants';

describe('IdentityContentComponent', () => {
  let component: IdentityContentComponent;
  let fixture: ComponentFixture<IdentityContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IdentityContentComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(IdentityContentComponent);
    component = fixture.componentInstance;

    // set identity input()
    component.identity = { ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
