import * as translations from 'library/src/shared/i18n/en';
import { Plaid } from '../support/plaid';

const text = translations.default;

function app() {
  return cy.get('app-bank-account-connect');
}

function plaid() {
  return cy
    .get('iframe')
    .its('0.contentDocument')
    .should('exist')
    .its('body')
    .should('not.be.undefined')
    .then(cy.wrap);
}

function bankAccountConnectSetup() {
  cy.get('#component')
    .click()
    .get('mat-option')
    .contains('bank-account-connect')
    .click();
}

describe('bank-account-connect test', () => {
  beforeEach(() => {
    cy.visit('/');
    //@ts-ignore
    cy.login();
  });

  it('should add an account', () => {
    cy.intercept('POST', '/api/workflows').as('postWorkflow');

    bankAccountConnectSetup();

    cy.wait('@postWorkflow').then(() => {
      app().get('app-loading').should('exist');
      app().find('#bank-connect-button-done').should('be.disabled');
    });
  });

  it('should handle error loading Plaid script', () => {
    // Force loading Plaid script to error
    cy.intercept('GET', '/link/v2/stable/*', (req) => {
      req.reply({ forceNetworkError: true });
    }).as('getPlaidLink');

    bankAccountConnectSetup();

    cy.wait('@getPlaidLink').then(() => {
      app().find('strong').should('contain.text', text.unexpectedError);
    });
  });

  it('should allow resume on Plaid exit', () => {
    // Indicates Plaid app is open
    cy.intercept('POST', '/link/heartbeat').as('heartbeat');

    bankAccountConnectSetup();

    // Exit Plaid
    cy.wait('@heartbeat').then(() => {
      plaid().find('button').first().click();
    });

    // Resume
    app().get('strong').should('contain.text', text.bankAccountConnect.resume);
    app().get('button').contains(text.resume).click();

    app().get('app-bank-account-connect').find('app-loading').should('exist');
  });

  it('should cancel on Plaid exit', () => {
    // Indicates Plaid app is open
    cy.intercept('POST', '/link/heartbeat').as('heartbeat');

    bankAccountConnectSetup();

    // Exit Plaid
    cy.wait('@heartbeat').then(() => {
      plaid().find('button').first().click();
    });

    // Cancel
    app().get('strong').should('contain.text', text.bankAccountConnect.resume);
    app().get('button').contains(text.cancel).click();

    app().should('not.exist');
  });

  it('should handle success from Plaid', () => {
    // Indicates Plaid app is open
    cy.intercept('POST', '/link/heartbeat').as('heartbeat');

    cy.intercept('POST', '/link/workflow/next', (req) => {
      req.reply(Plaid.PLAID_NEXT_ON_SUCCESS);
    });

    // Stop creation of external bank account
    cy.intercept('POST', '/api/external_bank_accounts', (req) => {
      req.reply({});
    });

    bankAccountConnectSetup();

    // Continue
    cy.wait('@heartbeat').then(() => {
      plaid().find('button').last().click();
    });

    app()
      .find('strong')
      .should('contain.text', text.bankAccountConnect.success);

    // Navigate
    app().find('button').contains(text.done).click();
    app().should('not.exist');
  });
});
