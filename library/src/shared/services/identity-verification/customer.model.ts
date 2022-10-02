import { CustomerBankModel } from '@cybrid/cybrid-api-bank-angular';

export interface Customer extends CustomerBankModel {
  state: Customer.StateEnum;
  kyc_state: Customer.KycStateEnum;
  kyc_checks: [
    type: Customer.KycChecksTypeEnum,
    outcome: Customer.KycChecksOutcomeEnum,
    outcome_reasons?: Customer.KycChecksOutcomeReasons,
    denied_reason?: Customer.KycChecksDeniedReason
  ];
}

export declare namespace Customer {
  type StateEnum = 'storing' | 'created';
  const StateEnum: {
    storing: StateEnum;
    created: StateEnum;
  };
  type KycStateEnum = 'approved' | 'denied' | 'required';
  const KycStateEnum: {
    approved: KycStateEnum;
    denied: KycStateEnum;
    required: KycStateEnum;
  };
  type KycChecksTypeEnum =
    | 'identity_authentication'
    | 'identity_confirmation'
    | 'watchlist_consultation';
  const KycChecksTypeEnum: {
    identity_Authentication: KycChecksTypeEnum;
    identity_Confirmation: KycChecksTypeEnum;
    watchlist_Consultation: KycChecksTypeEnum;
  };
  type KycChecksOutcomeEnum =
    | 'missing'
    | 'approved'
    | 'denied'
    | 'expired'
    | 'invalidated';
  const KycChecksOutcomeEnum: {
    missing: KycChecksOutcomeEnum;
    approved: KycChecksOutcomeEnum;
    denied: KycChecksOutcomeEnum;
    expired: KycChecksOutcomeEnum;
    invalidated: KycChecksOutcomeEnum;
  };
  type KycChecksOutcomeReasons = 'outcome_reason_error';
  const KycChecksOutcomeReasons: {
    reason_error: KycChecksOutcomeReasons;
  };
  type KycChecksDeniedReason = 'denied_reason_error';
  const KycChecksDeniedReason: {
    denied_reason_error: KycChecksDeniedReason;
  };
}
