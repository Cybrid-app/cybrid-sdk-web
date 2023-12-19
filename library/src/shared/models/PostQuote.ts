export namespace PostQuote {
  export type ProductTypeEnum = 'trading' | 'funding' | 'book_transfer' | 'crypto_transfer';
  export const ProductTypeEnum: {
    Trading: ProductTypeEnum;
    Funding: ProductTypeEnum;
    BookTransfer: ProductTypeEnum;
    CryptoTransfer: ProductTypeEnum;
  } = {
    Trading: 'trading',
    Funding: 'funding',
    BookTransfer: 'book_transfer',
    CryptoTransfer: 'crypto_transfer',
  };

  export type SideEnum = 'buy' | 'sell' | 'deposit' | 'withdrawal';
  export const SideEnum: {
    Buy: SideEnum;
    Sell: SideEnum;
    Deposit: SideEnum;
    Withdrawal: SideEnum;
  } = {
    Buy: 'buy',
    Sell: 'sell',
    Deposit: 'deposit',
    Withdrawal: 'withdrawal',
  };
}
