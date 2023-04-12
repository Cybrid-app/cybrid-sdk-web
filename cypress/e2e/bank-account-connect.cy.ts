import * as translations from 'library/src/shared/i18n/en';
import { Plaid } from '../support/plaid';
import { TestConstants } from '@constants';

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
    // Mock POST Workflow
    cy.intercept('POST', '/api/workflows', (req) => {
      req.reply(TestConstants.WORKFLOW_BANK_MODEL);
    }).as('postWorkflow');

    // Mock GET Workflow
    cy.intercept('GET', '/api/workflows/*', (req) => {
      req.reply(TestConstants.WORKFLOW_BANK_MODEL_WITH_DETAILS);
    }).as('getWorkflow');

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
    app().get('strong').should('contain.text', text.bankAccountConnect.resumeAdding);
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
    app().get('strong').should('contain.text', text.bankAccountConnect.resumeAdding);
    app().get('button').contains(text.cancel).click();

    app().should('not.exist');
  });

  it('should handle success from Plaid with defined iso_currency_code', () => {
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
      .should('contain.text', text.bankAccountConnect.successAdded);

    // Navigate
    app().find('button').contains(text.done).click();
    app().should('not.exist');
  });

  it('should open confirm dialog on success from Plaid with undefined iso_currency_code', () => {
    // Indicates Plaid app is open
    cy.intercept('POST', '/link/heartbeat').as('heartbeat');

    // Set mock Plaid iso_currency_code to undefined
    let mockPlaidSuccess = { ...Plaid };
    // @ts-ignore
    mockPlaidSuccess.PLAID_NEXT_ON_SUCCESS.next_pane.sink.result.metadata.accounts[0][
      'iso_currency_code'
    ] = undefined;

    cy.intercept('POST', '/link/workflow/next', (req) => {
      req.reply(mockPlaidSuccess.PLAID_NEXT_ON_SUCCESS);
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

    cy.get('h1').should('contain.text', text.bankAccountConnect.confirm.title);
    cy.get('p')
      .first()
      .should('contain.text', text.bankAccountConnect.confirm.message);

    // Cancel
    cy.get('mat-dialog-container').contains(text.cancel).click();
  });

  it('should add external bank account on confirm in the confirm dialog', () => {
    // Indicates Plaid app is open
    cy.intercept('POST', '/link/heartbeat').as('heartbeat');

    // Set mock Plaid iso_currency_code to undefined
    let mockPlaidSuccess = { ...Plaid };
    // @ts-ignore
    mockPlaidSuccess.PLAID_NEXT_ON_SUCCESS.next_pane.sink.result.metadata.accounts[0][
      'iso_currency_code'
    ] = undefined;

    cy.intercept('POST', '/link/workflow/next', (req) => {
      req.reply(mockPlaidSuccess.PLAID_NEXT_ON_SUCCESS);
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

    // Confirm
    cy.get('mat-dialog-container').contains(text.confirm).click();

    app()
      .find('strong')
      .should('contain.text', text.bankAccountConnect.successAdded);

    // Navigate
    app().find('button').contains(text.done).click();
    app().should('not.exist');
  });
});
