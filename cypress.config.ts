import { defineConfig } from 'cypress';

export default defineConfig({
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  chromeWebSecurity: false,
  defaultCommandTimeout: 10000,
  requestTimeout: 15000,
  env: {
    CLIENT_ID_PLAID: '',
    CLIENT_SECRET_PLAID: '',
    CUSTOMER_GUID_PLAID: '',
    CLIENT_ID_BACKSTOPPED: '',
    CLIENT_SECRET_BACKSTOPPED: '',
    CUSTOMER_GUID_BACKSTOPPED: ''
  },
  e2e: {
    baseUrl: 'http://localhost:4200',
    excludeSpecPattern: 'cypress/e2e/trade.cy.ts',
    testIsolation: false
  }
});
