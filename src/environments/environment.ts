/*
 * This is an example demo environment configuration.
 *
 * To authenticate the demo environment:
 * - Add your credentials to 'environment.credentials'
 *
 * */

export const environment = {
  production: false,
  idpAuthUrl: {
    local: 'http://api-idp.local.cybrid.com:3000/oauth/token',
    staging: 'https://id.staging.cybrid.app/oauth/token',
    sandbox: 'https://id.sandbox.cybrid.app/oauth/token',
    production: 'https://id.production.cybrid.app/oauth/token'
  },
  bankApiCustomerBasePath: {
    local: 'http://api-platform-bank.local.cybrid.com:3002/api/customers/',
    staging: 'https://bank.staging.cybrid.app/api/customers/',
    sandbox: 'https://bank.sandbox.cybrid.app/api/customers/',
    production: 'https://bank.production.cybrid.app/api/customers/'
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
    'banks:read banks:write accounts:read accounts:execute customers:read customers:write customers:execute prices:read quotes:execute trades:execute trades:read external_bank_accounts:read external_bank_accounts:execute external_bank_accounts:write workflows:read workflows:execute transfers:read transfers:execute'
};
