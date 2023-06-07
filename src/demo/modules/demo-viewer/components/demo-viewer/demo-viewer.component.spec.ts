import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoViewerComponent } from './demo-viewer.component';

describe('DemoViewerComponent', () => {
  let component: DemoViewerComponent;
  let fixture: ComponentFixture<DemoViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DemoViewerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DemoViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
