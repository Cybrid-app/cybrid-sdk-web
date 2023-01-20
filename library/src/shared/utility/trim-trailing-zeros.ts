export function trimTrailingZeros(value: string) {
  const trailingZeroRegex = /^0*(\d+(?:\.(?:(?!0+$)\d)+)?)/;
  const trim = value.match(trailingZeroRegex);

  return trim ? trim[1] : value;
}
