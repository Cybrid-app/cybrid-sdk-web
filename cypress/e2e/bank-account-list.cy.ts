import { TestConstants } from '@constants';

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
  before(() => {
    let mockBank = { ...TestConstants.BANK_BANK_MODEL };
    mockBank.features = [];
    mockBank.features.push('plaid_funding_source');
    mockBank.features.push('kyc_identity_verifications');

    cy.intercept('GET', 'api/prices*', (req) => {
      req.reply(TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY);
    }).as('listPrices');
    cy.intercept('GET', 'api/assets', (req) => {
      req.reply(TestConstants.ASSET_LIST_BANK_MODEL);
    }).as('listAssets');
    cy.intercept('GET', '/api/banks/*', (req) => {
      req.reply(mockBank);
    }).as('getBank');
    cy.intercept('GET', '/api/customers/*', (req) => {
      req.reply(TestConstants.CUSTOMER_BANK_MODEL);
    }).as('getCustomer');
    cy.intercept('GET', '/api/external_bank_accounts*', (req) => {
      req.reply(TestConstants.EXTERNAL_BANK_ACCOUNT_LIST_BANK_MODEL);
    }).as('listExternalBankAccounts');
    cy.intercept('GET', '/api/external_bank_accounts/*', (req) => {
      req.reply({ forceNetworkError: true });
    }).as('getExternalBankAccount');

    cy.visit('/');
    //@ts-ignore
    cy.login();
  });

  it('should get external bank accounts', () => {
    bankAccountListSetup();
    cy.wait('@listExternalBankAccounts').then(() => {
      app().find('table').should('exist');
    });
  });

  it('should refresh external bank accounts', () => {
    // Mock POST workflow in bank-account-connect component
    cy.intercept('POST', '/api/workflows*', (req) => {
      req.reply({});
    }).as('postWorkflow');

    app().find('#refresh').should('exist').click();
    app().should('not.exist');
    cy.get('app-bank-account-connect').should('exist');
  });

  it('should add an account', () => {
    // Mock POST workflow in bank-account-connect component
    cy.intercept('POST', '/api/workflows*', (req) => {
      req.reply({});
    }).as('postWorkflow');

    bankAccountListSetup();
    app().find('#add-account').should('exist').click();
    app().should('not.exist');
    cy.get('app-bank-account-connect').should('exist');
  });
});
