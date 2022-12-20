import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestTradeComponent } from './test-trade.component';

describe('TestTradeComponent', () => {
  let component: TestTradeComponent;
  let fixture: ComponentFixture<TestTradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestTradeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
