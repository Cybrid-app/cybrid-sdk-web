import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { TransferConfirmComponent } from '@components';
import { SharedModule } from '../../../../shared/modules/shared.module';
import { TruncatePipe } from '@pipes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { HttpClient } from '@angular/common/http';

describe('TransferConfirmComponent', () => {
  let component: TransferConfirmComponent;
  let fixture: ComponentFixture<TransferConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransferConfirmComponent, TruncatePipe],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        SharedModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { account: { guid: '12344' } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransferConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
