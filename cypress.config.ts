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
    CUSTOMER_GUID_PLAID: 'b283116f9f94742dcd1feda21cc0a8cb',
    CLIENT_ID_BACKSTOPPED: 'K7ZEhGfGAf8UYAtC6T3zaxDLzwAN6-0l-2ve1ZdZQCQ',
    CLIENT_SECRET_BACKSTOPPED: 'LhNtF7DUIO6d3xm5K5sR7wanv_yDU3GWR5VyBDrN6I0',
    CUSTOMER_GUID_BACKSTOPPED: '38351d676abba5163a93f2661a8debbf'
  },
  e2e: {
    baseUrl: 'http://localhost:4200',
    excludeSpecPattern: 'cypress/e2e/trade.cy.ts',
    testIsolation: false
  }
});
