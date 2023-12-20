export namespace Customer {
  export type TypeEnum = 'business' | 'individual';
  export const TypeEnum: {
    Business: TypeEnum;
    Individual: TypeEnum;
  } = {
    Business: 'business',
    Individual: 'individual'
  };
  export type StateEnum =
    | 'storing'
    | 'unverified'
    | 'verified'
    | 'rejected'
    | 'frozen';
  export const StateEnum: {
    Storing: StateEnum;
    Unverified: StateEnum;
    Verified: StateEnum;
    Rejected: StateEnum;
    Frozen: StateEnum;
  } = {
    Storing: 'storing',
    Unverified: 'unverified',
    Verified: 'verified',
    Rejected: 'rejected',
    Frozen: 'frozen'
  };
}
