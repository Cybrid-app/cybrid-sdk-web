import { Asset } from '../services/asset/asset.service';

export enum THEME {
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}

export class Constants {
  static REPO_URL =
    'https://api.github.com/repos/Cybrid-app/cybrid-sdk-web/releases/latest';
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
  static ICON_HOST = 'https://images.cybrid.xyz/sdk/assets/svg/color/';
  static BTC_ICON = 'https://images.cybrid.xyz/sdk/assets/svg/color/btc.svg';
  static BTC_ASSET: Asset = {
    code: 'BTC',
    decimals: 8,
    name: 'Bitcoin',
    symbol: '₿',
    type: 'crypto',
    url: Constants.BTC_ICON
  };
}
