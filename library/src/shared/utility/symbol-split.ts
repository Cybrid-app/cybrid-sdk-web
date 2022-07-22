export function symbolSplit(symbol: string) {
  const asset = symbol.split('-')[0];
  const counter_asset = symbol.split('-')[1];
  return [asset, counter_asset] as const;
}
