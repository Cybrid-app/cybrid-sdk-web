import { SymbolPriceBankModel } from '@cybrid/cybrid-api-bank-angular';

export function filterPrices(
  priceList: SymbolPriceBankModel[],
  symbol: string
): SymbolPriceBankModel | undefined {
  return priceList.find((prices) => prices.symbol?.includes(symbol));
}
