import { Pipe, PipeTransform } from '@angular/core';
import { Asset, AssetService } from '@services';

@Pipe({
  name: 'assetIcon'
})
/**
 * Provides the url for an assets icon
 * @param code The asset code, for example 'USD' or 'BTC'
 * @returns string - The image src for the asset if it exists or an empty string
 * */
export class AssetIconPipe implements PipeTransform {
  constructor(private assetService: AssetService) {}
  transform(code: string | undefined): string {
    if (code) {
      const url = (this.assetService.getAsset(code) as Asset).url;
      return url ? url : '';
    } else return '';
  }
}
