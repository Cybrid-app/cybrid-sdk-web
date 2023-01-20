import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountConfirmComponent } from '@components';

describe('BankAccountConfirmComponent', () => {
  let component: BankAccountConfirmComponent;
  let fixture: ComponentFixture<BankAccountConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankAccountConfirmComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BankAccountConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
