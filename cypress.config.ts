import { defineConfig } from 'cypress';

export default defineConfig({
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  chromeWebSecurity: false,
  defaultCommandTimeout: 10000,
  requestTimeout: 15000,
  env: {
    CLIENT_ID: '',
    CLIENT_SECRET: '',
    CUSTOMER_GUID: '',
    CLIENT_ID_BACKSTOPPED: '',
    CLIENT_SECRET_BACKSTOPPED: '',
    CUSTOMER_GUID_BACKSTOPPED: ''
  },
  e2e: {
    baseUrl: 'http://localhost:4200'
  }
});
