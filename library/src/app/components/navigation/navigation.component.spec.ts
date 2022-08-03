import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationComponent } from '@components';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../modules/library.module';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RoutingData, RoutingService } from '@services';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavigationComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [{ provide: RoutingService, useValue: MockRoutingService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    MockRoutingService = TestBed.inject(RoutingService);

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate', () => {
    const testRoutingData: RoutingData = {
      route: 'test',
      origin: 'karma'
    };
    component.routingData = testRoutingData;

    component.onNavigate();
    expect(MockRoutingService.handleRoute).toHaveBeenCalledWith(
      testRoutingData
    );
  });
});
