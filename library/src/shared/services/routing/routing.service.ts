import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { CODE, EventService, LEVEL } from '../event/event.service';
import { ComponentConfig, ConfigService } from '../config/config.service';
import { map } from 'rxjs';

export interface RoutingData {
  route: string;
  origin: string;
  extras?: NavigationExtras;
}

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  constructor(
    private router: Router,
    private eventService: EventService,
    private configService: ConfigService
  ) {}

  handleRoute(routingData: RoutingData): void {
    this.configService
      .getConfig$()
      .pipe(
        map((config: ComponentConfig) => {
          const path = 'app/' + routingData.route;

          if (config.routing) {
            this.eventService.handleEvent(
              LEVEL.INFO,
              CODE.ROUTING_START,
              'Routing to: ' + routingData.route,
              {
                origin: routingData.origin,
                default: routingData.route
              }
            );

            this.router.navigate([path], routingData.extras).then(() => {
              this.eventService.handleEvent(
                LEVEL.INFO,
                CODE.ROUTING_END,
                'Successfully routed to: ' + routingData.route,
                {
                  origin: routingData.origin,
                  default: routingData.route
                }
              );
            });
          } else {
            this.eventService.handleEvent(
              LEVEL.INFO,
              CODE.ROUTING_REQUEST,
              'Routing has been requested',
              {
                origin: routingData.origin,
                default: routingData.route
              }
            );
          }
        })
      )
      .subscribe();
  }
}
