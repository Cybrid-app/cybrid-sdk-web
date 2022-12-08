import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { of } from 'rxjs';

// Services
import {
  ConfigService,
  EventService,
  CODE,
  LEVEL,
  RoutingService
} from '@services';

// Utility
import { TranslateService } from '@ngx-translate/core';
import { TestConstants } from '@constants';

describe('RoutingService', () => {
  let service: RoutingService;

  let MockEventService = jasmine.createSpyObj('EventService', ['handleEvent']);

  let MockConfigService = jasmine.createSpyObj('ConfigService', [
    'getConfig$',
    'getBank$',
    'setComponent'
  ]);

  let MockTranslateService = jasmine.createSpyObj('TranslateService', [
    'setTranslation',
    'setDefaultLang',
    'use'
  ]);

  let MockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: TranslateService, useValue: MockTranslateService },
        { provide: EventService, useValue: MockEventService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: Router, useValue: MockRouter }
      ]
    });
    service = TestBed.inject(RoutingService);
    MockTranslateService = TestBed.inject(TranslateService);
    MockEventService = TestBed.inject(EventService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getBank$.and.returnValue(
      of(TestConstants.BANK_BANK_MODEL)
    );
    MockRouter = TestBed.inject(Router);
    MockRouter.navigate.and.returnValue(Promise.resolve(true));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle routes if config.routing = true', fakeAsync(() => {
    // Set config.routing
    MockConfigService.getConfig$.and.returnValue(of({ routing: true }));

    service.handleRoute({ route: 'trade', origin: 'price-list' });
    tick();

    expect(MockConfigService.getConfig$).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockRouter.navigate).toHaveBeenCalledWith(['app/trade'], undefined);
  }));

  it('should handle routes of config.routing = false', fakeAsync(() => {
    // Set config.routing
    MockConfigService.getConfig$.and.returnValue(of({ routing: false }));

    service.handleRoute({ route: 'trade', origin: 'price-list' });
    tick();

    expect(MockConfigService.getConfig$).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalledWith(
      LEVEL.INFO,
      CODE.ROUTING_REQUEST,
      'Routing has been requested',
      {
        origin: 'price-list',
        default: 'trade'
      }
    );
  }));
});
