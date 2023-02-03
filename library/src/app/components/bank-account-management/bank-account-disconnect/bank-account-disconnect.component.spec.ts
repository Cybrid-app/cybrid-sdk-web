import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountDisconnectComponent } from '@components';

describe('BankAccountDisconnectComponent', () => {
  let component: BankAccountDisconnectComponent;
  let fixture: ComponentFixture<BankAccountDisconnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankAccountDisconnectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankAccountDisconnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
