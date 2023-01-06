export function symbolSplit(symbol: string): readonly [string, string] {
  let split = symbol.split('-');
  return [split[0], split[1]] as const;
}
