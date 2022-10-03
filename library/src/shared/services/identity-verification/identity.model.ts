import OutcomeEnum = Identity.OutcomeEnum;
import OutcomeReasonsEnum = Identity.OutcomeReasonsEnum;

export interface Identity {
  type: Identity.TypeEnum;
  provider: Identity.ProviderEnum;
  state?: Identity.StateEnum;
  persona_inquiry_id?: string;
  outcome?: OutcomeEnum;
  outcome_reasons?: OutcomeReasonsEnum;
}

export declare namespace Identity {
  type TypeEnum = 'kyc';
  const TypeEnum: {
    kyc: TypeEnum;
  };
  type ProviderEnum = 'persona';
  const ProviderEnum: {
    persona: ProviderEnum;
  };
  type StateEnum =
    | 'storing'
    | 'waiting'
    | 'executing'
    | 'reviewing'
    | 'processing'
    | 'completed';
  const StateEnum: {
    storing: StateEnum;
    waiting: StateEnum;
    executing: StateEnum;
    reviewing: StateEnum;
    processing: StateEnum;
    completed: StateEnum;
  };
  type OutcomeEnum = 'expired' | 'cancelled' | 'passed' | 'failed';
  const OutcomeEnum: {
    expired: OutcomeEnum;
    cancelled: OutcomeEnum;
    passed: OutcomeEnum;
    failed: OutcomeEnum;
  };
  type OutcomeReasonsEnum = 'failed_requested';
  const OutcomeReasonsEnum: {
    failed_requested: OutcomeReasonsEnum;
  };
}
