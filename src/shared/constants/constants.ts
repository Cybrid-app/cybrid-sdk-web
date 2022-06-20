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
  static ICON_HOST = 'https://images.cybrid.xyz/color/';
  static CAD_ICON =
    'https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg'; // Temporary Wikipedia svg for demo purposes
  static USD_ICON =
    'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg'; // Temporary Wikipedia svg for demo purposes
  static COUNTER_ASSET: Asset = {
    type: 'fiat',
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: '$',
    decimals: 2,
    url: Constants.CAD_ICON
  };
  static ASSET: Asset = {
    type: 'crypto',
    code: 'BTC',
    name: 'Bitcoin',
    symbol: '₿',
    decimals: 8,
    url: 'https://images.cybrid.xyz/color/btc.svg'
  };
  static BTC_ASSET: Asset = {
    code: 'BTC',
    decimals: 8,
    name: 'Bitcoin',
    symbol: '₿',
    type: 'crypto',
    url: Constants.ICON_HOST + 'btc.svg'
  };
  static ETH_ASSET: Asset = {
    code: 'ETH',
    decimals: 18,
    name: 'Ethereum',
    symbol: 'Ξ',
    type: 'crypto',
    url: Constants.ICON_HOST + 'eth.svg'
  };
  static CAD_ASSET: Asset = {
    code: 'CAD',
    decimals: 2,
    name: 'Canadian Dollar',
    symbol: '$',
    type: 'fiat',
    url: Constants.CAD_ICON
  };
  static USD_ASSET: Asset = {
    code: 'USD',
    decimals: 2,
    name: 'United States Dollar',
    symbol: '$',
    type: 'fiat',
    url: Constants.USD_ICON
  };
  static ASSETS: Asset[] = [
    Constants.BTC_ASSET,
    Constants.ETH_ASSET,
    Constants.CAD_ASSET,
    Constants.USD_ASSET
  ];
}
