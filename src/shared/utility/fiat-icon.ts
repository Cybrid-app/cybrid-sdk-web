import { Constants } from '../constants/constants';

export function getFiatIcon(code: string): string {
  return code === 'USD' ? Constants.USD_ICON : Constants.CAD_ICON;
}
