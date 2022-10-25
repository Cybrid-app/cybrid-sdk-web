import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CybridLogoComponent } from '@components';

describe('CybridLogoComponent', () => {
  let component: CybridLogoComponent;
  let fixture: ComponentFixture<CybridLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CybridLogoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CybridLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
