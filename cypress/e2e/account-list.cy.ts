// @ts-ignore
import { TestConstants } from '@constants';

function app() {
  return cy.get('app-account-list');
}

function accountListSetup() {
  // Mock prices
  cy.intercept('GET', '/api/prices', (req) => {
    req.reply(TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY);
  }).as('listPrices');
  // Mock accounts
  cy.intercept('GET', 'api/accounts', (req) => {
    req.reply(TestConstants.ACCOUNT_LIST_BANK_MODEL);
  }).as('listAccounts');

  cy.intercept('POST', '/oauth/token', (req) => {
    req.body.client_id = Cypress.env('CLIENT_ID');
    req.body.client_secret = Cypress.env('CLIENT_SECRET');
    req.continue();
  });
  cy.visit('/');
  cy.intercept('/api/prices').as('getPrices');
  cy.wait('@getPrices');
  cy.get('#component')
    .click()
    .get('mat-option')
    .contains('account-list')
    .click();
}

describe('account-list test', () => {
  it('should render the account list', () => {
    accountListSetup();
    app().should('exist');
  });

  it('should display account data', () => {
    // Check for mocked data and labels
    app()
      .find('.cybrid-balance')
      .should('contain.text', 'TOTAL VALUE')
      .should('contain.text', '$12,294,060.30 USD');
    app()
      .find('#assetList')
      .should('contain.text', 'Asset')
      .should('contain.text', 'Market Price')
      .should('contain.text', 'Balance')
      .should('contain.text', 'USD')

      // Check table for ETH account
      .should('contain.text', 'Ethereum')
      .should('contain.text', 'ETH')
      .should('contain.text', '4997.7367924308')
      .should('contain.text', '$1,470.50')
      .should('contain.text', '$7,349,171.95')

      // Check table for BTC account
      .should('contain.text', 'Bitcoin')
      .should('contain.text', 'BTC')
      .should('contain.text', '232.18708499')
      .should('contain.text', '$21,297.00')
      .should('contain.text', '$4,944,888.35');
  });

  it('should navigate back', () => {
    app().find('app-navigation').find('button').click();
    app().should('not.exist');

    // Reset to account-list component
    accountListSetup();
  });

  it('should refresh the account list', () => {
    // Intercept listAccounts response
    let accounts;
    cy.intercept('/api/accounts').as('listAccounts');
    cy.wait('@listAccounts').then((interception) => {
      // @ts-ignore
      accounts = interception.response.body;
    });

    cy.wait('@listAccounts').its('response.body').should('not.eq', accounts);

    app().find('#warning').should('not.exist');
  });

  it('should handle errors returned by accounts api', () => {
    // Force accounts error
    cy.intercept('GET', '/api/accounts', { forceNetworkError: true }).as(
      'listAccounts'
    );
    cy.wait('@listAccounts');

    // Check for error row
    app().find('#warning').should('exist');

    // Reset
    accountListSetup();
  });

  it('should handle errors returned by prices api', () => {
    // Force prices error
    cy.intercept('GET', '/api/prices', { forceNetworkError: true }).as(
      'listPrices'
    );
    cy.wait('@listPrices');

    // Check for error row
    app().find('#warning').should('exist');
  });
});
