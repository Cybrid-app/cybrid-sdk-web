import { ComponentFixture, TestBed } from '@angular/core/testing';

// Components
import { BankAccountDetailsComponent } from '@components';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '../../../../shared/modules/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TruncatePipe } from '@pipes';

describe('BankAccountDetailsComponent', () => {
  let component: BankAccountDetailsComponent;
  let fixture: ComponentFixture<BankAccountDetailsComponent>;

  let MockDialogRef = jasmine.createSpyObj('MatDialogRef', ['open', 'close']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankAccountDetailsComponent, TruncatePipe],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: MockDialogRef }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BankAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
