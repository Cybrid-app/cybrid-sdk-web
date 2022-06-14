import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeQuoteComponent } from './trade-quote.component';

describe('TradeQuoteComponent', () => {
  let component: TradeQuoteComponent;
  let fixture: ComponentFixture<TradeQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TradeQuoteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TradeQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
