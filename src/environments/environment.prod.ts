/*
 * CircleCi friendly json used to update public user keys
 * (for instant demo) when building the production web demo
 */
import ci from './environment.ci.json';

export const environment = {
  production: true,
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
  grant_type: 'client_credentials',
  credentials: ci.environment.credentials,
  scope:
    'banks:read banks:write accounts:read accounts:execute customers:read customers:write customers:execute prices:read quotes:execute trades:execute trades:read external_bank_accounts:read external_bank_accounts:execute external_bank_accounts:write workflows:read workflows:execute transfers:read transfers:execute'
};
