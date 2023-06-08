import { defineConfig } from 'cypress';

export default defineConfig({
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  chromeWebSecurity: false,
  defaultCommandTimeout: 10000,
  requestTimeout: 15000,
  env: {
    CLIENT_ID_PLAID: 'Mq5kJ-jknSUkwZhPRCGqN4kDiLbFtXROsJ27XHi1YwQ',
    CLIENT_SECRET_PLAID: 'iFeLEMFdJNtxcx7s8AtD9X2LeIvdfhVjBjQZ-6Y1dQQ',
    CUSTOMER_GUID_PLAID: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
    CLIENT_ID_BACKSTOPPED: 'K7ZEhGfGAf8UYAtC6T3zaxDLzwAN6-0l-2ve1ZdZQCQ',
    CLIENT_SECRET_BACKSTOPPED: 'LhNtF7DUIO6d3xm5K5sR7wanv_yDU3GWR5VyBDrN6I0',
    CUSTOMER_GUID_BACKSTOPPED: 'fa88c4d8c4a07b100447c86f7187cb8c'
  },
  e2e: {
    baseUrl: 'http://localhost:4200',
    excludeSpecPattern: 'cypress/e2e/trade.cy.ts'
  }
});
