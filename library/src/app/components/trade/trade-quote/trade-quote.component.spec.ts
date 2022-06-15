import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeQuoteComponent } from './trade-quote.component';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('TradeQuoteComponent', () => {
  let component: TradeQuoteComponent;
  let fixture: ComponentFixture<TradeQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        MatDialogModule
      ],
      declarations: [TradeQuoteComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TradeQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
