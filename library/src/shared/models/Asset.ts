export namespace Asset {
  export type TypeEnum = 'fiat' | 'crypto';
  export const TypeEnum: {
    Fiat: TypeEnum;
    Crypto: TypeEnum;
  } = {
    Fiat: 'fiat',
    Crypto: 'crypto',
  };
}
