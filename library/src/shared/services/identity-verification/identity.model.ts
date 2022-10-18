import OutcomeEnum = Identity.OutcomeEnum;
import OutcomeReasonsEnum = Identity.OutcomeReasonsEnum;
import { List } from './list.model';

export interface Identity {
  guid: string;
  customer_guid: string;
  type: Identity.TypeEnum;
  method: Identity.MethodEnum;
  state?: Identity.StateEnum;
  outcome?: OutcomeEnum;
  outcome_reasons?: OutcomeReasonsEnum;
  persona_inquiry_id?: string;
  persona_state: Identity.PersonaEnum;
}

export interface IdentityList extends List {
  objects: [Identity];
}

export declare namespace Identity {
  type TypeEnum = 'kyc';
  const TypeEnum: {
    kyc: TypeEnum;
  };
  type MethodEnum = 'id_and_selfie';
  const MethodEnum: {
    id_and_selfie: MethodEnum;
  };
  type ProviderEnum = 'persona';
  const ProviderEnum: {
    persona: ProviderEnum;
  };
  type StateEnum = 'storing' | 'waiting' | 'expired' | 'completed';
  const StateEnum: {
    storing: StateEnum;
    waiting: StateEnum;
    expired: StateEnum;
    completed: StateEnum;
  };
  type OutcomeEnum = 'passed' | 'failed';
  const OutcomeEnum: {
    passed: OutcomeEnum;
    failed: OutcomeEnum;
  };
  type OutcomeReasonsEnum = 'requested_failure';
  const OutcomeReasonsEnum: {
    requested_failure: OutcomeReasonsEnum;
  };
  type PersonaEnum =
    | 'waiting'
    | 'pending'
    | 'reviewing'
    | 'expired'
    | 'completed'
    | 'unknown';
  const PersonaEnum: {
    waiting: PersonaEnum;
    pending: PersonaEnum;
    reviewing: PersonaEnum;
    expired: PersonaEnum;
    completed: PersonaEnum;
    unknown: PersonaEnum;
  };
}
