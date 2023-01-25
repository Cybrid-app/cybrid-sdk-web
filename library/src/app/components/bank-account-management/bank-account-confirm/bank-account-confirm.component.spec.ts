import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Components
import { BankAccountConfirmComponent } from '@components';

// Utility
import { TestConstants } from '@constants';
import { SharedModule } from '../../../../shared/modules/shared.module';
import { BankBankModel } from '@cybrid/cybrid-api-bank-angular';

describe('BankAccountConfirmComponent', () => {
  let component: BankAccountConfirmComponent;
  let fixture: ComponentFixture<BankAccountConfirmComponent>;

  let MockDialog = jasmine.createSpyObj('Dialog', ['open', 'close']);
  let MockBank: BankBankModel = TestConstants.BANK_BANK_MODEL;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankAccountConfirmComponent],
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
        { provide: MatDialogRef, useValue: MockDialog },
        {
          provide: MAT_DIALOG_DATA,
          useValue: MockBank
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BankAccountConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the asset group', () => {
    const isLoadingSpy = spyOn(component.isLoading$, 'next');

    component.initAssetGroup();
    expect(component.assetGroup).toBeDefined();
    expect(isLoadingSpy).toHaveBeenCalled();
  });

  it('should close the dialog onCancel()', () => {
    component.onCancel();
    expect(MockDialog.close).toHaveBeenCalled();
  });

  it('should close the dialog onConfirm()', () => {
    component.onConfirm();
    expect(MockDialog.close).toHaveBeenCalled();
  });

  it('should pass the selected currency code onConfirm()', () => {
    component.initAssetGroup();
    component.onConfirm();
    expect(MockDialog.close).toHaveBeenCalledWith(
      component.assetGroup.value.asset
    );
  });
});
