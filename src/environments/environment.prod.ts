/*
 * CircleCi friendly json used to update public user keys
 * (for instant demo) when building the production web demo
 */
import ci from './environment.ci.json';

export const environment = {
  production: true,
  authUrl: 'https://id.demo.cybrid.app/oauth/token',
  grant_type: 'client_credentials',
  credentials: ci.environment.credentials,
  scope:
    'banks:read banks:write accounts:read accounts:execute customers:read customers:write customers:execute prices:read quotes:execute trades:execute trades:read external_bank_accounts:read external_bank_accounts:execute workflows:read workflows:execute transfers:read transfers:execute'
};
