import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  TranslateLoader,
  TranslateModule,
  TranslatePipe
} from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogModule as MatDialogModule,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';

// Services
import { Configuration } from '@cybrid/cybrid-api-bank-angular';

// Components
import { TransferDetailsComponent, TransferDetailsData } from '@components';

// Utility
import { AssetFormatPipe, MockAssetFormatPipe, TruncatePipe } from '@pipes';
import { of } from 'rxjs';
import { TestConstants } from '@constants';

describe('TransferDetailsComponent', () => {
  let component: TransferDetailsComponent;
  let fixture: ComponentFixture<TransferDetailsComponent>;

  const mockMatDialogData: TransferDetailsData = {
    transferBankModel: TestConstants.TRANSFER_BANK_MODEL,
    externalBankAccountBankModel:
      TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL,
    asset: TestConstants.USD_ASSET
  };

  let MockDialogRef = jasmine.createSpyObj('MatDialogRef', {
    open: undefined,
    close: undefined,
    afterClosed: of(mockMatDialogData)
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TransferDetailsComponent,
        MockAssetFormatPipe,
        TruncatePipe
      ],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        MatDialogModule,
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
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockMatDialogData
        },
        { provide: AssetFormatPipe, useClass: MockAssetFormatPipe },
        TruncatePipe,
        TranslatePipe,
        Configuration
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(TransferDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
