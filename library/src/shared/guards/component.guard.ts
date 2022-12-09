import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { map, Observable } from 'rxjs';
import { BankBankModel } from '@cybrid/cybrid-api-bank-angular';
import { Constants } from '@constants';
import { CODE, ConfigService, EventService, LEVEL } from '@services';

@Injectable({
  providedIn: 'root'
})
export class ComponentGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private eventService: EventService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.configService.getBank$().pipe(
      map((bank) => {
        const isBackstopped = bank.features.includes(
          BankBankModel.FeaturesEnum.BackstoppedFundingSource
        );
        const isAllowedForBackstopped =
          Constants.COMPONENTS_BACKSTOPPED.includes(
            <string>route.routeConfig?.path
          );

        if (isBackstopped && !isAllowedForBackstopped) {
          this.eventService.handleEvent(
            LEVEL.INFO,
            CODE.ROUTING_DENIED,
            'Component: ' +
              route.routeConfig?.path +
              ' is unavailable to backstopped banks'
          );
          return false;
        } else return true;
      })
    );
  }
}
