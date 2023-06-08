import * as translations from 'library/src/shared/i18n/en';
import { TestConstants } from '@constants';

const text = translations.default;

function app() {
  return cy.get('app-bank-account-list');
}

function bankAccountListSetup() {
  cy.get('#component')
    .click()
    .get('mat-option')
    .contains('bank-account-list')
    .click();
}

describe('bank-account-list-test', () => {
  beforeEach(() => {
    //@ts-ignore
    cy.authenticate();
    cy.visit('/');

    cy.intercept('GET', 'api/assets').as('listAssets');
    cy.intercept('GET', '/api/customers/*').as('getCustomer');
    cy.intercept('GET', '/api/external_bank_accounts*').as(
      'listExternalBankAccounts'
    );
    cy.intercept('GET', '/api/external_bank_accounts/*').as(
      'getExternalBankAccount'
    );
    cy.intercept('DELETE', '/api/external_bank_accounts/*');
    cy.intercept('POST', '/api/workflows*').as('postWorkflow');

    bankAccountListSetup();
  });

  it('should list external bank accounts', () => {
    cy.wait('@listExternalBankAccounts').then(() => {
      app().find('table').should('exist');
    });
  });

  it('should display an external bank accounts details', () => {
    app().find('tbody').find('tr').first().click();
    cy.get('app-bank-account-details').should('exist').find('#cancel').click();
    cy.get('app-bank-account-details').should('not.exist');
  });

  it('should confirm disconnecting a bank account', () => {
    app().find('tbody').find('tr').first().click();
    cy.get('app-bank-account-details').find('#disconnect').click();
    cy.get('app-bank-account-disconnect')
      .should('exist')
      .find('#cancel')
      .click();
  });

  it('should disconnect a bank account', () => {
    cy.wait('@listExternalBankAccounts').then(() =>
      cy.intercept('DELETE', '/api/external_bank_accounts/*', (req) => {
        req.reply(TestConstants.EXTERNAL_BANK_ACCOUNT_BANK_MODEL);
      })
    );

    app().find('tbody').find('tr').first().click();
    cy.get('app-bank-account-details').find('#disconnect').click();
    cy.get('app-bank-account-disconnect').find('#disconnect').click();
    cy.get('snack-bar-container').contains(
      text.bankAccountList.details.success
    );
    cy.get('snack-bar-container').find('button').click();
  });

  it('should handle an error on disconnecting a bank account', () => {
    // Ensure table exists in dom
    cy.wait('@listExternalBankAccounts').then(() =>
      cy.intercept('DELETE', '/api/external_bank_accounts/*', (req) => {
        req.reply({ forceNetworkError: true });
      })
    );

    cy.wait('@listExternalBankAccounts').then(() => {
      app().find('tbody').find('tr').first().click();
      cy.get('app-bank-account-details').find('#disconnect').click();
      cy.get('app-bank-account-disconnect').find('#disconnect').click();
      cy.get('snack-bar-container').contains(
        text.bankAccountList.details.error
      );
      cy.get('snack-bar-container').should('exist').find('button').click();
    });
  });

  it('should add a bank account', () => {
    app().find('#add-account').should('exist').click();
    app().should('not.exist');
    cy.get('app-bank-account-connect').should('exist');
  });

  it('should refresh the bank accounts list', () => {
    let accounts = {};
    cy.intercept('GET', '/api/external_bank_accounts*', (req) => {
      accounts = req;
      req.continue();
    }).as('listExternalBankAccounts');

    cy.wait('@listExternalBankAccounts').then((res) => {
      //@ts-ignore
      accounts = res.response.body;
    });

    cy.wait('@listExternalBankAccounts')
      .its('response.body')
      .should('not.eq', accounts);
  });
});
