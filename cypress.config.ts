import { defineConfig } from 'cypress';

export default defineConfig({
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  chromeWebSecurity: false,
  includeShadowDom: true,
  env: {
    CLIENT_ID: '',
    CLIENT_SECRET: ''
  },
  e2e: {
    baseUrl: 'http://localhost:4200'
  }
});
