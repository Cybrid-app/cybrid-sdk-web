export function CurrencyMask(value: number | null): number | null {
  if (value && value.toString().includes('.')) {
    const split = value.toString().split('.');
    const maskedValue = split[0] + '.' + split[1].slice(0, 2);

    return Number(maskedValue);
  } else return value;
}
