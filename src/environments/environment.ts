/*
 * This is an example demo environment configuration.
 *
 * To authenticate the demo environment:
 * - Add your credentials to 'environment.credentials'
 *
 * */

export const environment = {
  production: false,
  environments: ['local', 'staging', 'sandbox', 'production'],
  idpBaseUrl: {
    local: 'http://api-idp.local.cybrid.com:3000',
    staging: 'https://id.staging.cybrid.app',
    sandbox: 'https://id.sandbox.cybrid.app',
    production: 'https://id.production.cybrid.app'
  },
  bankBaseUrl: {
    local: 'http://api-platform-bank.local.cybrid.com:3002',
    staging: 'https://bank.staging.cybrid.app',
    sandbox: 'https://bank.sandbox.cybrid.app',
    production: 'https://bank.production.cybrid.app'
  },
  credentials: {
    clientId: '',
    clientSecret: '',
    customerGuid: '',
    publicClientId: '',
    publicClientSecret: '',
    publicCustomerGuid: ''
  },
  grant_type: 'client_credentials',
  scope:
    'banks:read banks:write accounts:read accounts:execute customers:read customers:write customers:execute prices:read quotes:execute trades:execute trades:read external_bank_accounts:read external_bank_accounts:execute external_bank_accounts:write workflows:read workflows:execute transfers:read transfers:execute',
  customerScope:
    'accounts:read accounts:execute customers:read customers:write customers:execute prices:read quotes:execute trades:execute trades:read external_bank_accounts:read external_bank_accounts:execute external_bank_accounts:write workflows:read workflows:execute transfers:read transfers:execute'
};
