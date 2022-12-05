/*
 * This is an example demo environment configuration.
 *
 * To authenticate the demo environment:
 * - Add your credentials to 'environment.credentials'
 *
 * */

export const environment = {
  production: false,
  authUrl: 'https://id.demo.cybrid.app/oauth/token',
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
    'banks:read banks:write accounts:read accounts:execute customers:read customers:write customers:execute prices:read quotes:execute trades:execute trades:read external_bank_accounts:read external_bank_accounts:execute workflows:read workflows:execute transfers:read transfers:execute'
};
