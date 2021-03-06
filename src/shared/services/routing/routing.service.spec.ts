import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { RoutingService } from './routing.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../config/config.service';
import { of } from 'rxjs';
import { CODE, EventService, LEVEL } from '../event/event.service';
import { Router } from '@angular/router';

describe('RoutingService', () => {
  let service: RoutingService;

  let MockEventService = jasmine.createSpyObj('EventService', ['handleEvent']);

  let MockConfigService = jasmine.createSpyObj('ConfigService', ['getConfig$']);

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
    MockRouter = TestBed.inject(Router);
    MockRouter.navigate.and.returnValue(Promise.resolve(true));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle routes if config.routing = true', fakeAsync(() => {
    // Set config.routing
    MockConfigService.getConfig$.and.returnValue(of({ routing: true }));

    service.handleRoute('trade', 'price-list');
    tick();

    expect(MockConfigService.getConfig$).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockRouter.navigate).toHaveBeenCalledWith(['app/trade'], undefined);
  }));

  it('should handle routes of config.routing = false', fakeAsync(() => {
    // Set config.routing
    MockConfigService.getConfig$.and.returnValue(of({ routing: false }));

    service.handleRoute('trade', 'price-list');
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
