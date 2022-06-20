import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { AssetBankModel } from '@cybrid/cybrid-api-bank-angular';
import { Constants } from '../constants/constants';
import { Subject } from 'rxjs';
import { formatNumber } from '@angular/common';
import { Big } from 'big.js';
import '@angular/common/locales/global/fr';
import { Asset } from '../services/asset/asset.service';

interface NumberSeparator {
  locale: string;
  char: string;
}

@Pipe({
  name: 'asset'
})
export class MockAssetPipe implements PipeTransform, OnDestroy {
  locale = 'en-US';
  separator: NumberSeparator[] = [
    { locale: 'en-US', char: '.' },
    { locale: 'fr-CA', char: ',' }
  ];
  unsubscribe$: Subject<any> = new Subject();

  constructor() {}

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  transform(
    value: string | number,
    asset: AssetBankModel | Asset,
    unit: 'trade' | 'base' | 'formatted' = 'formatted'
  ): string | number {
    const divisor = new Big(10).pow(asset.decimals);
    const tradeUnit = new Big(value).div(divisor);
    const baseUnit = new Big(value).mul(divisor);

    switch (unit) {
      case 'trade': {
        return tradeUnit.toNumber();
      }
      case 'base': {
        return baseUnit.toNumber();
      }
      case 'formatted': {
        if (tradeUnit.toString().includes('.')) {
          let separator = this.separator.find((value) => {
            return value.locale == this.locale;
          });
          let integer = tradeUnit.toString().split('.')[0];
          let decimal = tradeUnit.toString().split('.')[1];
          if (decimal.length < Constants.MIN_FRACTION_DIGITS) {
            decimal += '0';
          }
          if (asset.type == 'fiat') {
            return (
              asset.symbol +
              formatNumber(new Big(integer).toNumber(), this.locale) +
              separator!.char +
              decimal.slice(0, 2)
            );
          } else {
            return (
              asset.symbol +
              formatNumber(new Big(integer).toNumber(), this.locale) +
              separator!.char +
              decimal
            );
          }
        } else {
          const digitsInfo =
            Constants.MIN_INTEGER_DIGITS.toString() +
            '.' +
            Constants.MIN_FRACTION_DIGITS.toString() +
            '-' +
            asset.decimals.toString();
          return (
            asset.symbol +
            formatNumber(tradeUnit.toNumber(), this.locale, digitsInfo)
          );
        }
      }
    }
  }
}
