import { AssetBankModel } from '@cybrid/cybrid-api-bank-angular';

export enum THEME {
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}

export class Constants {
  // The number of times to retry a failed http request
  static RETRY = 3;
  // How often to request new data
  static REFRESH_INTERVAL = 5000;
  static LOCALE = 'en-US';
  static SUPPORTED_LOCALES = ['en-US', 'fr-CA'];
  // The time in seconds left on a valid auth token when a session expiry warning event is sent
  static AUTH_EXPIRATION_WARNING = 120;
  static MIN_INTEGER_DIGITS = 0;
  static MIN_FRACTION_DIGITS = 2;
  static THEME = THEME.LIGHT;
  static ICON_HOST = 'https://images.cybrid.xyz/color/';
  static COUNTER_ASSET: AssetBankModel = {
    type: 'fiat',
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: '$',
    decimals: 2
  };
  static ASSET: AssetBankModel = {
    type: 'crypto',
    code: 'BTC',
    name: 'Bitcoin',
    symbol: '₿',
    decimals: 8
  };
}
