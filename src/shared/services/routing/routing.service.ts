import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { CODE, EventService, LEVEL } from '../event/event.service';
import { ComponentConfig, ConfigService } from '../config/config.service';
import { map, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  constructor(
    private router: Router,
    private eventService: EventService,
    private configService: ConfigService
  ) {}

  handleRoute(route: string, extras?: NavigationExtras): void {
    this.configService
      .getConfig$()
      .pipe(
        map((config: ComponentConfig) => {
          if (config.routing) {
            const path = 'app/' + route;

            this.eventService.handleEvent(
              LEVEL.INFO,
              CODE.ROUTING_START,
              'Routing to: ' + route,
              route
            );

            this.router.navigate([path], extras).then(() => {
              this.eventService.handleEvent(
                LEVEL.INFO,
                CODE.ROUTING_END,
                'Successfully routed to: ' + route,
                route
              );
            });
          } else {
            this.eventService.handleEvent(
              LEVEL.INFO,
              CODE.ROUTING_REQUEST,
              'Routing has been requested'
            );
          }
        })
      )
      .subscribe();
  }
}
