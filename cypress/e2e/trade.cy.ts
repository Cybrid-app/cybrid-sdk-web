import { TestConstants } from '../../library/src/shared/constants/test.constants';

function app() {
  return cy.get('app-trade');
}

function tradeSetup() {
  cy.intercept('POST', '/oauth/token', (req) => {
    req.body.client_id = Cypress.env('CLIENT_ID');
    req.body.client_secret = Cypress.env('CLIENT_SECRET');
    req.continue();
  });
  cy.visit('/');
  cy.intercept('/api/prices').as('getPrices');
  cy.wait('@getPrices');
  cy.get('#component').click().get('mat-option').contains('trade').click();
}

describe('trade test', () => {
  it('should render the trade component', () => {
    tradeSetup();
    app().should('exist');
  });

  it('should navigate back to the price list', () => {
    app().find('.cybrid-navigation').click();
    app().should('not.exist');
    cy.get('app-list').should('exist');

    // Reset to trade component
    tradeSetup();
  });

  it('should swap between buy/sell', () => {
    app().find('#action').should('contain', 'BUY');
    app().find('#mat-tab-label-0-1').click();
    app().find('#action').should('contain', 'SELL');
    app().find('#mat-tab-label-0-0').click();
  });

  it('should swap between assets', () => {
    // Check for initial display
    app().find('.cybrid-approx').should('contain', 'BTC');

    // Swap asset to ETH
    app().find('#asset').click();
    cy.get('mat-option').filter(':contains("Ethereum")').click();
    app().find('#asset').should('contain', 'Ethereum');
    app().find('.cybrid-approx').should('contain', 'ETH');
  });

  it('should display the approximate value and swap between amount units', () => {
    // Add amount and check for prefix
    app().find('#amount').type('1', { force: true });
    app().find('.cybrid-approx').should('contain', 'USD');

    // Swap units
    app().find('#swap').click();
    app().find('.cybrid-approx').should('contain', 'ETH');

    // Clear amount
    app().find('#amount').clear();
  });

  it('should handle an invalid amount', () => {
    // No amount
    app().find('#action').should('be.disabled');

    // Negative amount
    app().find('#amount').type('-1', { force: true });
    // Workaround for Cypress bug: https://github.com/cypress-io/cypress/issues/21433
    // Click outside the input to force validation update
    // eq here is selecting the index of returned form fields
    app().get('.mat-form-field-wrapper').eq(1).dblclick();
    app().get('#action').should('be.disabled');
    app().find('mat-error').should('exist');

    // NaN
    app().find('#amount').clear();
    app().find('#amount').type('test', { force: true });
    // Workaround for Cypress bug: https://github.com/cypress-io/cypress/issues/21433
    // Click outside the input to force validation update
    // eq here is selecting the index of returned form fields
    app().get('.mat-form-field-wrapper').eq(1).dblclick();
    app().get('#action').should('be.disabled');

    // Amount = 0
    app().find('#amount').type('0', { force: true });
    app().get('#action').click();
    cy.get('snack-bar-container').should('exist').find('button').click();

    // Small amounts
    app().find('#amount').clear();
    app().find('#amount').type('0.001', { force: true });
    app().get('#action').click();
    cy.get('snack-bar-container').should('exist').find('button').click();
    app().find('#amount').clear();
  });

  it('should handle any error returned by createQuote()', () => {
    // Force createQuote() network error
    cy.intercept('POST', '/api/quotes', { forceNetworkError: true });

    app().find('#amount').type('1', { force: true });
    app().find('#action').click();
    cy.get('snack-bar-container').should('exist').find('button').click();
  });

  it('should fetch a quote onTrade()', () => {
    // Mock quote
    cy.intercept('POST', 'api/quotes', (req) => {
      req.reply(TestConstants.QUOTE_BANK_MODEL);
    });
    app().find('#action').click();

    // Intercept quote and check for loading spinner
    cy.intercept('POST', '/api/quotes', (req) => {
      cy.get('app-loading').should('exist');
      req.continue();
    });
    cy.get('app-loading').should('not.exist');

    // Check order quote dialog
    app()
      .get('app-trade-confirm')
      .find('.cybrid-list-item')
      .should('contain.text', 'Purchase')
      .should('contain.text', 'ETH')
      .should('contain.text', 'USD')
      .should('contain.text', '$1,033.31');
  });

  it('should exit the dialog on cancel', () => {
    cy.get('#cancel').click();
    cy.get('mat-dialog-container').should('not.exist');
  });

  it('should refresh the quote', () => {
    app().find('#action').click();
    let quote;
    cy.intercept('/api/quotes').as('getQuote');
    cy.wait('@getQuote').then((interception) => {
      // @ts-ignore
      quote = interception.response.body;
    });
    cy.wait('@getQuote').its('request.body').should('not.eq', quote);
    cy.get('#cancel').click();
  });

  it('should should handle any error returned by createTrade()', () => {
    // Force createTrade() network error
    cy.intercept('POST', '/api/trades', { forceNetworkError: true });

    app().find('#action').click();
    cy.get('#confirm').click();
    cy.get('snack-bar-container').should('exist').find('button').click();
  });

  it('should submit the trade on confirm', () => {
    // Mock trade
    cy.intercept('POST', 'api/trades', (req) => {
      req.reply(TestConstants.TRADE_BANK_MODEL);
    });

    // Re-open dialog and confirm quote
    app().find('#action').click();
    cy.get('#confirm').click();

    // Intercept quote and check for loading spinner
    cy.intercept('POST', '/api/trades', () => {
      cy.get('.loading-wrapper').should('exist');
    });

    // Mock getTrade()
    cy.intercept('GET', '/api/trades', (req) => {
      req.reply(TestConstants.TRADE_BANK_MODEL);
    });
    cy.get('app-loading').should('not.exist');
  });

  it('should display the order summary', () => {
    // Check order submitted dialog
    app()
      .get('app-trade-summary')
      .find('.cybrid-list-item')
      .should('contain.text', 'Purchased')
      .should('contain.text', 'ETH')
      .should('contain.text', 'USD')
      .should('contain.text', '$1,033.31');
  });

  it('should exit the dialog and navigate to the price-list on done', () => {
    cy.get('#done').click();
    cy.get('app-list').should('exist');
  });
});
