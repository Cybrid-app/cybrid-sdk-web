/**
 * A utility function that takes a fiat currency value and trims it to 2 decimal places
 * */
export function FiatMask(value: number | null): number | null {
  if (value && value.toString().includes('.')) {
    const split = value.toString().split('.');
    const maskedValue = split[0] + '.' + split[1].slice(0, 2);

    return Number(maskedValue);
  } else return value;
}
