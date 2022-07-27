import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';
import '@angular/common/locales/global/fr';

import { Subject } from 'rxjs';
import { Big } from 'big.js';

// Client
import { AssetBankModel } from '@cybrid/cybrid-api-bank-angular';

// Services
import { Asset } from '@services';

// Utility
import { Constants } from '@constants';

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
    const divisor = new Big(10).pow(Number(asset.decimals));
    const tradeUnit = new Big(value).div(divisor);
    const baseUnit = new Big(value).mul(divisor);

    switch (unit) {
      // Whole coin unit without formatting, ex. 0.0023 BTC
      case 'trade': {
        return tradeUnit.toNumber();
      }

      // Base coin unit without formatting, ex. 2000000000 Wei
      // Type 'string' is returned here to disable scientific notation from JS 'number' Type
      case 'base': {
        const defaultPE = Big.PE;

        // Set the positive exponent value at and above which toString returns exponential notation.
        Big.PE = 100;

        let base = baseUnit.toString();

        // Reset to default
        Big.PE = defaultPE;
        return base;
      }

      // Returns a formatted (localized) whole coin unit, ex. 1,230.22 ETH
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
              formatNumber(new Big(integer).toNumber(), this.locale) +
              separator!.char +
              decimal.slice(0, 2)
            );
          } else {
            return (
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
          return formatNumber(tradeUnit.toNumber(), this.locale, digitsInfo);
        }
      }
    }
  }
}
