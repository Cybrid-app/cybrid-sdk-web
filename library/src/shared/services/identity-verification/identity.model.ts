import OutcomeEnum = Identity.OutcomeEnum;
import OutcomeReasonsEnum = Identity.OutcomeReasonsEnum;

export interface Identity {
  type: Identity.TypeEnum;
  provider: 'persona';
  state?: Identity.StateEnum;
  persona_inquiry_id?: string;
  outcome?: OutcomeEnum;
  outcome_reasons?: OutcomeReasonsEnum;
}

export declare namespace Identity {
  type TypeEnum = 'kyc';
  const TypeEnum: {
    Kyc: TypeEnum;
  };
  type ProviderEnum = 'persona';
  const ProviderEnum: {
    Persona: ProviderEnum;
  };
  type StateEnum =
    | 'storing'
    | 'waiting'
    | 'executing'
    | 'reviewing'
    | 'processing'
    | 'completed';
  const StateEnum: {
    Storing: StateEnum;
    Waiting: StateEnum;
    Executing: StateEnum;
    Reviewing: StateEnum;
    Processing: StateEnum;
    Completed: StateEnum;
  };
  type OutcomeEnum = 'expired' | 'cancelled' | 'passed' | 'failed';
  const OutcomeEnum: {
    Expired: OutcomeEnum;
    Cancelled: OutcomeEnum;
    Passed: OutcomeEnum;
    Failed: OutcomeEnum;
  };
  type OutcomeReasonsEnum = 'failed_requested';
  const OutcomeReasonsEnum: {
    Failed_Requested: OutcomeReasonsEnum;
  };
}
