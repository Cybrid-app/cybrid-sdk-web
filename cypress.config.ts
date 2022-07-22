import { defineConfig } from 'cypress';

export default defineConfig({
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  chromeWebSecurity: false,
  includeShadowDom: true,
  requestTimeout: 10000,
  env: {
    CLIENT_ID: 'gtlpql9qUwhhhRBKemkWG2aIofhUZBf-J_1QY-nsNg8',
    CLIENT_SECRET: '2eEo_u3MYyzawlB7Cm4-mP397EzOz5tAZwQFTiF6EKc'
  },
  e2e: {
    baseUrl: 'http://localhost:4200'
  }
});
