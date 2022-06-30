import { ComponentConfig } from '../services/config/config.service';

export enum THEME {
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}

export class Constants {
  static REPO_URL =
    'https://api.github.com/repos/Cybrid-app/cybrid-sdk-web/releases/latest';
  static ICON_HOST = 'https://images.cybrid.xyz/sdk/assets/svg/color/';

  // The number of times to retry a failed http request
  static RETRY = 3;

  // How often to request new data
  static REFRESH_INTERVAL = 5000;

  static LOCALE = 'en-US';
  static SUPPORTED_LOCALES = ['en-US', 'fr-CA'];

  static THEME = THEME.LIGHT;
  static CUSTOMER = '';

  // Default app configuration
  static DEFAULT_CONFIG: ComponentConfig = {
    refreshInterval: Constants.REFRESH_INTERVAL,
    locale: Constants.LOCALE,
    theme: Constants.THEME,
    customer: Constants.CUSTOMER
  };

  // The time in seconds left on a valid auth token when a session expiry warning event is sent
  static AUTH_EXPIRATION_WARNING = 120;

  // Asset pipe params
  static MIN_INTEGER_DIGITS = 0;
  static MIN_FRACTION_DIGITS = 2;
}
