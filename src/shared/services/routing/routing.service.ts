import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { CODE, EventService, LEVEL } from '../event/event.service';
import { ComponentConfig, ConfigService } from '../config/config.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  constructor(
    private router: Router,
    private eventService: EventService,
    private configService: ConfigService
  ) {}

  handleRoute(route: string, origin: string, extras?: NavigationExtras): void {
    this.configService
      .getConfig$()
      .pipe(
        map((config: ComponentConfig) => {
          const path = 'app/' + route;

          if (config.routing) {
            this.eventService.handleEvent(
              LEVEL.INFO,
              CODE.ROUTING_START,
              'Routing to: ' + route,
              {
                origin: origin,
                default: route
              }
            );

            this.router.navigate([path], extras).then(() => {
              this.eventService.handleEvent(
                LEVEL.INFO,
                CODE.ROUTING_END,
                'Successfully routed to: ' + route,
                {
                  origin: origin,
                  default: route
                }
              );
            });
          } else {
            this.eventService.handleEvent(
              LEVEL.INFO,
              CODE.ROUTING_REQUEST,
              'Routing has been requested',
              {
                origin: origin,
                default: route
              }
            );
          }
        })
      )
      .subscribe();
  }
}
