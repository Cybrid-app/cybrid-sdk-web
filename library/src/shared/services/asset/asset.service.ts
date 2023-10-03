import { Injectable } from '@angular/core';
import {
  AssetListBankModel,
  AssetsService
} from '@cybrid/cybrid-api-bank-angular';
import {
  map,
  Observable,
  switchMap,
  catchError,
  of,
  ReplaySubject,
  take
} from 'rxjs';
import { CODE, EventService, LEVEL } from '../event/event.service';
import { ErrorService } from '../error/error.service';
import { AssetBankModel } from '@cybrid/cybrid-api-bank-angular/model/asset';
import { ConfigService } from '../config/config.service';
import { Constants } from '@constants';

export interface Asset extends AssetBankModel {
  type: AssetBankModel.TypeEnum;
  code: string;
  name: string;
  symbol: string;
  decimals: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  assets$: ReplaySubject<AssetBankModel[]> = new ReplaySubject<
    AssetBankModel[]
  >(1);
  assetList$ = new ReplaySubject<Asset[]>(1);
  assetList: Asset[] = [];

  constructor(
    private assetsService: AssetsService,
    private configService: ConfigService,
    private eventService: EventService,
    private errorService: ErrorService
  ) {
    this.initAssets();
  }

  initAssets(): void {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        switchMap(() => this.assetsService.listAssets()),
        map((list: AssetListBankModel) => {
          this.assets$.next(list.objects);
          const assetList: Asset[] = list.objects.map(
            (asset: AssetBankModel) => {
              return {
                type: asset.type,
                code: asset.code,
                name: asset.name,
                symbol: asset.symbol,
                decimals: asset.decimals,
                url: Constants.ICON_HOST + asset.code.toLowerCase() + '.svg'
              } as Asset;
            }
          );
          this.assetList$.next(assetList);
          this.assetList = assetList;
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

  getAssets$(): Observable<Asset[]> {
    return this.assetList$.asObservable();
  }

  getAsset(code: string): any | null {
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

      return null;
    }
  }
}
