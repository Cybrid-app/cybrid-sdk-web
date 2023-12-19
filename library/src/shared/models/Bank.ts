export namespace Bank {
  export type TypeEnum = 'sandbox' | 'production';
  export const TypeEnum: {
    Sandbox: TypeEnum;
    Production: TypeEnum;
  } = {
    Sandbox: 'sandbox',
    Production: 'production'
  };

  export type FeaturesEnum =
    | 'attestation_identity_records'
    | 'kyc_identity_verifications'
    | 'raw_routing_details'
    | 'individual_customers'
    | 'business_customers';
  export const FeaturesEnum: {
    AttestationIdentityRecords: FeaturesEnum;
    KycIdentityVerifications: FeaturesEnum;
    RawRoutingDetails: FeaturesEnum;
    IndividualCustomers: FeaturesEnum;
    BusinessCustomers: FeaturesEnum;
  } = {
    AttestationIdentityRecords: 'attestation_identity_records',
    KycIdentityVerifications: 'kyc_identity_verifications',
    RawRoutingDetails: 'raw_routing_details',
    IndividualCustomers: 'individual_customers',
    BusinessCustomers: 'business_customers'
  };

  export type RoutableAccountsEnum = 'unsupported' | 'bank' | 'customer';
  export const RoutableAccountsEnum: {
    Unsupported: RoutableAccountsEnum;
    Bank: RoutableAccountsEnum;
    Customer: RoutableAccountsEnum;
  } = {
    Unsupported: 'unsupported',
    Bank: 'bank',
    Customer: 'customer'
  };
}
