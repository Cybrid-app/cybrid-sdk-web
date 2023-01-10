import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';
import '@angular/common/locales/global/fr';

import { map, Subject, takeUntil } from 'rxjs';

// Client
import { ConfigService, AssetService } from '@services';
import { Constants } from '@constants';

// Utility
import { Big } from 'big.js';
import { trimTrailingZeros } from '@utility';

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
  /**
   * Provides common value transformation for trading assets.
   * Note: Pass value: string whenever possible to avoid any JS number formatting
   * */
  transform(
    value: string | number | undefined,
    code: string,
    unit: 'trade' | 'base' | 'trim' | 'formatted' = 'formatted'
  ): string | number | undefined {
    if (value) {
      const asset = this.assetService.getAsset(code);
      const assetDecimals = Number(asset.decimals);
      const divisor = new Big(10).pow(assetDecimals);

      switch (unit) {
        /**
         * Takes base units and returns trade units, fixed to the assets defined decimal places
         * Example: 1 Satoshi => 0.00000001 BTC, 1 Wei => 0.000000000000000001 ETH
         * */
        case 'trade': {
          let trade = new Big(value).div(divisor).toFixed(assetDecimals);
          return trimTrailingZeros(trade);
        }

        /**
         * Takes trade units and returns trade units
         * Example: 1 USD => 100, 1 BTC => 100000000 Satoshi
         * */
        case 'base': {
          let base = new Big(value).mul(divisor).toFixed();
          return trimTrailingZeros(base);
        }

        /**
         * Takes trade units and checks if a decimal and if the values number of decimal digits
         * is greater than the defined number of asset decimals, then trims and returns the value
         * Example: (BTC, 8 Decimals) 1234.1234567891 BTC => 1234.12345679 BTC
         * */
        case 'trim': {
          if (
            value.toString().includes('.') &&
            value.toString().split('.')[1].length > assetDecimals
          ) {
            let fixed = new Big(value).toFixed(assetDecimals);
            return trimTrailingZeros(fixed);
          } else {
            return value;
          }
        }

        /**
         * Takes base units and returns trade units with locale formatting
         * Example: 12345678910.12345678910 Satoshi => 123.45678910 BTC
         * Note: The function formatNumber applies localisation takes the type number,
         * resulting in scientific notation being returned if the value.length > 24
         * */
        case 'formatted': {
          const tradeUnit = new Big(value).div(divisor).toFixed(assetDecimals);

          if (tradeUnit.toString().includes('.')) {
            let separator = this.separator.find((separator) => {
              return separator.locale == this.locale;
            });
            let integer = tradeUnit.toString().split('.')[0];
            let decimal = tradeUnit.toString().split('.')[1];

            if (decimal.length < Constants.MIN_FRACTION_DIGITS) {
              decimal += '0';
            }
            return (
              formatNumber(new Big(integer).toNumber(), this.locale) +
              separator!.char +
              decimal.slice(0, assetDecimals)
            );
          } else {
            const digitsInfo =
              Constants.MIN_INTEGER_DIGITS.toString() +
              '.' +
              Constants.MIN_FRACTION_DIGITS.toString() +
              '-' +
              asset.decimals.toString();
            return formatNumber(Number(tradeUnit), this.locale, digitsInfo);
          }
        }
      }
    } else return value;
  }
}
