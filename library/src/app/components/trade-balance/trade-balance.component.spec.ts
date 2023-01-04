import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeBalanceComponent } from '@components';

describe('TradeBalanceComponent', () => {
  let component: TradeBalanceComponent;
  let fixture: ComponentFixture<TradeBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TradeBalanceComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TradeBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
