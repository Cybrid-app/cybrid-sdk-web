import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';
import '@angular/common/locales/global/fr';

import { map, Subject, takeUntil } from 'rxjs';

// Client
import { ConfigService, AssetService } from '@services';
import { Constants } from '@constants';

// Utility
import { Big } from 'big.js';

interface NumberSeparator {
  locale: string;
  char: string;
}

@Pipe({
  name: 'assetFormat'
})
export class AssetFormatPipe implements PipeTransform, OnDestroy {
  locale = '';
  separator: NumberSeparator[] = [
    { locale: 'en-US', char: '.' },
    { locale: 'fr-CA', char: ',' }
  ];
  unsubscribe$: Subject<any> = new Subject();

  constructor(
    private configService: ConfigService,
    private assetService: AssetService
  ) {
    this.initLocale();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  initLocale(): void {
    this.configService
      .getConfig$()
      .pipe(
        takeUntil(this.unsubscribe$),
        map((config) => {
          return (this.locale = config.locale);
        })
      )
      .subscribe();
  }

  transform(
    value: string | number | undefined,
    code: string,
    unit: 'trade' | 'base' | 'trim' | 'formatted' = 'formatted'
  ): string | number | undefined {
    if (value) {
      const asset = this.assetService.getAsset(code);
      const divisor = new Big(10).pow(Number(asset.decimals));
      const tradeUnit = new Big(value).div(divisor);
      const baseUnit = new Big(value).mul(divisor);

      switch (unit) {
        // Takes base units and returns trade units without formatting, ex. 0.0023 BTC
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

        // Takes trade units and trims to the asset decimal places
        case 'trim': {
          return Number(value).toFixed(asset.decimals);
        }

        // Takes base units and returns trade units with formatting, ex. 1,230.22 ETH
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
                formatNumber(new Big(integer).toNumber(), this.locale) +
                separator!.char +
                decimal.slice(0, asset.decimals)
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
    } else return value;
  }
}
