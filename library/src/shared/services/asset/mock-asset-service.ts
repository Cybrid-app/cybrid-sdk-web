import { Injectable } from '@angular/core';
import { TestConstants } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class MockAssetService {
  assetList = TestConstants.ASSETS;

  constructor() {}
  getAsset(code: string): any {
    const asset = this.assetList.find((list) => {
      return list.code == code.toUpperCase();
    });
    if (asset) {
      return asset;
    }
  }
}
