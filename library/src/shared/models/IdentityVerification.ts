export namespace IdentityVerification {
  export type TypeEnum = 'kyc' | 'bank_account';
  export const TypeEnum: {
    Kyc: TypeEnum;
    BankAccount: TypeEnum;
  } = {
    Kyc: 'kyc',
    BankAccount: 'bank_account'
  };

  export type MethodEnum =
    | 'business_registration'
    | 'id_and_selfie'
    | 'attested'
    | 'plaid_identity_match';
  export const MethodEnum: {
    BusinessRegistration: MethodEnum;
    IdAndSelfie: MethodEnum;
    Attested: MethodEnum;
    PlaidIdentityMatch: MethodEnum;
  } = {
    BusinessRegistration: 'business_registration',
    IdAndSelfie: 'id_and_selfie',
    Attested: 'attested',
    PlaidIdentityMatch: 'plaid_identity_match'
  };

  export type StateEnum = 'storing' | 'waiting' | 'expired' | 'completed';
  export const StateEnum: {
    Storing: StateEnum;
    Waiting: StateEnum;
    Expired: StateEnum;
    Completed: StateEnum;
  } = {
    Storing: 'storing',
    Waiting: 'waiting',
    Expired: 'expired',
    Completed: 'completed'
  };

  export type OutcomeEnum = 'passed' | 'failed';
  export const OutcomeEnum: {
    Passed: OutcomeEnum;
    Failed: OutcomeEnum;
  } = {
    Passed: 'passed',
    Failed: 'failed'
  };
}
