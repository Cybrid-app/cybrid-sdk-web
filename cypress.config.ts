import { defineConfig } from 'cypress';

export default defineConfig({
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  chromeWebSecurity: false,
  requestTimeout: 10000,
  env: {
    CLIENT_ID: '',
    CLIENT_SECRET: '',
    CUSTOMER_GUID: ''
  },
  e2e: {
    baseUrl: 'http://localhost:4200'
  }
});
