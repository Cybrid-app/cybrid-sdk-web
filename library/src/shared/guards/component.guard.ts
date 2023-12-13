import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { BankBankModel } from '@cybrid/cybrid-api-bank-angular';
import { Constants } from '@constants';
import { CODE, ConfigService, EventService, LEVEL } from '@services';

@Injectable({
  providedIn: 'root'
})
export class ComponentGuard  {
  constructor(
    private configService: ConfigService,
    private eventService: EventService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.configService.getConfig$().pipe(
      map((config) => {
        if (
          config.features.includes(
            BankBankModel.FeaturesEnum.AttestationIdentityRecords
          ) &&
          !Constants.COMPONENTS_ATTESTATION.includes(
            <string>route.routeConfig?.path
          )
        ) {
          this.eventService.handleEvent(
            LEVEL.INFO,
            CODE.ROUTING_DENIED,
            'Component: ' +
              route.routeConfig?.path +
              ' is unavailable to attestation banks'
          );
          return false;
        } else {
          return true;
        }
      })
    );
  }
}
