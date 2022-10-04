import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CybridSpinnerComponent } from './cybrid-spinner.component';

describe('CybridSpinnerComponent', () => {
  let component: CybridSpinnerComponent;
  let fixture: ComponentFixture<CybridSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CybridSpinnerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CybridSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
