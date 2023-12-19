export namespace Account {
  export type TypeEnum = 'trading' | 'fee' | 'fiat' | 'gas';
  export const TypeEnum: {
    Trading: TypeEnum;
    Fee: TypeEnum;
    Fiat: TypeEnum;
    Gas: TypeEnum;
  } = {
    Trading: 'trading',
    Fee: 'fee',
    Fiat: 'fiat',
    Gas: 'gas'
  };

  export type StateEnum = 'storing' | 'created';
  export const StateEnum: {
    Storing: StateEnum;
    Created: StateEnum;
  } = {
    Storing: 'storing',
    Created: 'created'
  };
}
