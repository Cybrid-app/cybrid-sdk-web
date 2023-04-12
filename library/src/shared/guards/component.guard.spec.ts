import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../app/modules/library.module';
import { HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { of } from 'rxjs';

// Services
import { ConfigService, EventService } from '@services';

// Guards
import { ComponentGuard } from '@guards';

// Utility
import { SharedModule } from '../modules/shared.module';
import { TestConstants } from '@constants';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('ComponentGuard', () => {
  let guard: ComponentGuard;

  let MockEventService = jasmine.createSpyObj('EventService', [
    'getEvent',
    'handleEvent'
  ]);
  let MockConfigService = jasmine.createSpyObj('ConfigService', ['getConfig$']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: ConfigService, useValue: MockConfigService },
        { provide: EventService, useValue: MockEventService }
      ]
    });
    guard = TestBed.inject(ComponentGuard);
    MockEventService = TestBed.inject(EventService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should pass allowed components in a backstopped bank', () => {
    const mockActivatedRouteSnapshot: ActivatedRouteSnapshot = {
      routeConfig: { path: 'price-list' }
    } as unknown as ActivatedRouteSnapshot;

    const mockRouterStateSnapshot: RouterStateSnapshot =
      {} as RouterStateSnapshot;

    let config = TestConstants.CONFIG;
    config.features = ['backstopped_funding_source'];
    MockConfigService.getConfig$.and.returnValue(of(config));

    guard
      .canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      .subscribe((res) => {
        expect(res).toBeTrue();
      });
  });

  it('should fail unavailable components in a backstopped bank', () => {
    const mockActivatedRouteSnapshot: ActivatedRouteSnapshot = {
      routeConfig: { path: 'transfer' }
    } as unknown as ActivatedRouteSnapshot;

    const mockRouterStateSnapshot: RouterStateSnapshot =
      {} as RouterStateSnapshot;

    let config = TestConstants.CONFIG;
    config.features = ['backstopped_funding_source'];
    MockConfigService.getConfig$.and.returnValue(of(config));

    guard
      .canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      .subscribe((res) => {
        expect(res).toBeFalse();
      });
  });

  it('should pass allowed components in an attestation bank', () => {
    const mockActivatedRouteSnapshot: ActivatedRouteSnapshot = {
      routeConfig: { path: 'price-list' }
    } as unknown as ActivatedRouteSnapshot;

    const mockRouterStateSnapshot: RouterStateSnapshot =
      {} as RouterStateSnapshot;

    let config = TestConstants.CONFIG;
    config.features = ['attestation_identity_records'];
    MockConfigService.getConfig$.and.returnValue(of(config));

    guard
      .canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      .subscribe((res) => {
        expect(res).toBeTrue();
      });
  });

  it('should fail unavailable components in a attestation bank', () => {
    const mockActivatedRouteSnapshot: ActivatedRouteSnapshot = {
      routeConfig: { path: 'identity-verification' }
    } as unknown as ActivatedRouteSnapshot;

    const mockRouterStateSnapshot: RouterStateSnapshot =
      {} as RouterStateSnapshot;

    let config = TestConstants.CONFIG;
    config.features = ['attestation_identity_records'];
    MockConfigService.getConfig$.and.returnValue(of(config));

    guard
      .canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      .subscribe((res) => {
        expect(res).toBeFalse();
      });
  });

  it('should issue an event if routing is denied', fakeAsync(() => {
    const mockActivatedRouteSnapshot: ActivatedRouteSnapshot = {
      routeConfig: { path: 'transfer' }
    } as unknown as ActivatedRouteSnapshot;

    const mockRouterStateSnapshot: RouterStateSnapshot =
      {} as RouterStateSnapshot;

    guard
      .canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      .subscribe();

    tick();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  }));
});
