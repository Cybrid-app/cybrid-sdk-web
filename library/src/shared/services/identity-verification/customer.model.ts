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
    Storing: StateEnum;
    Created: StateEnum;
  };
  type KycStateEnum = 'approved' | 'denied' | 'required';
  const KycStateEnum: {
    Approved: KycStateEnum;
    Denied: KycStateEnum;
    Required: KycStateEnum;
  };
  type KycChecksTypeEnum =
    | 'identity_authentication'
    | 'identity_confirmation'
    | 'watchlist_consultation';
  const KycChecksTypeEnum: {
    Identity_Authentication: KycChecksTypeEnum;
    Identity_Confirmation: KycChecksTypeEnum;
    Watchlist_Consultation: KycChecksTypeEnum;
  };
  type KycChecksOutcomeEnum =
    | 'missing'
    | 'approved'
    | 'denied'
    | 'expired'
    | 'invalidated';
  const KycChecksOutcomeEnum: {
    Missing: KycChecksOutcomeEnum;
    Approved: KycChecksOutcomeEnum;
    Denied: KycChecksOutcomeEnum;
    Expired: KycChecksOutcomeEnum;
    Invalidated: KycChecksOutcomeEnum;
  };
  type KycChecksOutcomeReasons = 'outcome_reason_error';
  const KycChecksOutcomeReasons: {
    Reason_Error: KycChecksOutcomeReasons;
  };
  type KycChecksDeniedReason = 'denied_reason_error';
  const KycChecksDeniedReason: {
    Denied_Reason_Error: KycChecksDeniedReason;
  };
}
