import { Injectable } from '@angular/core';
import {
  AssetListBankModel,
  AssetsService
} from '@cybrid/cybrid-api-bank-angular';
import { map, Observable, Subject, switchMap, catchError, of } from 'rxjs';
import { CODE, EventService, LEVEL } from '../event/event.service';
import { ErrorService } from '../error/error.service';
import { AssetBankModel } from '@cybrid/cybrid-api-bank-angular/model/asset';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  assetList$ = new Subject<Array<AssetBankModel>>();
  assetList: Array<AssetBankModel> = [];

  constructor(
    private assetsService: AssetsService,
    private authService: AuthService,
    private eventService: EventService,
    private errorService: ErrorService
  ) {
    this.initAssets();
  }

  initAssets(): void {
    this.authService
      .getToken$()
      .pipe(
        switchMap(() => this.assetsService.listAssets()),
        map((list: AssetListBankModel) => {
          this.assetList$.next(list.objects);
          this.assetList = list.objects;
        }),
        catchError((err) => {
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.SERVICE_ERROR,
            'There was a failure initializing the Asset service'
          );
          this.errorService.handleError(err);
          return of(err);
        })
      )
      .subscribe();
  }

  getAssets$(): Observable<Array<AssetBankModel>> {
    return this.assetList$.asObservable();
  }

  getAsset(code: string): any {
    const asset = this.assetList.find((list) => {
      return list.code == code.toUpperCase();
    });
    if (asset) {
      return asset;
    } else {
      this.eventService.handleEvent(
        LEVEL.ERROR,
        CODE.ASSET_ERROR,
        'Error retrieving asset data for: ' + `${code}`
      );
      this.errorService.handleError(
        new Error('Error retrieving asset data for: ' + `${code}`)
      );
    }
  }
}
