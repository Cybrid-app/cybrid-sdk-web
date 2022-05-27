export const environment = {
  production: false,
  authUrl: 'https://id.demo.cybrid.app/oauth/token',
  credentials: {
    clientId: '',
    clientSecret: ''
  },
  grant_type: 'client_credentials',
  scope:
    'banks:read banks:write accounts:read accounts:execute customers:read customers:write customers:execute prices:read quotes:execute trades:execute trades:read'
};
