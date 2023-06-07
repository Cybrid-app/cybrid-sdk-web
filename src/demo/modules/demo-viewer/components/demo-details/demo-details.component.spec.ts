import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoDetailsComponent } from './demo-details.component';

describe('DemoDetailsComponent', () => {
  let component: DemoDetailsComponent;
  let fixture: ComponentFixture<DemoDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DemoDetailsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DemoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
