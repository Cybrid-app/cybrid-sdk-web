import { TestConstants } from '@constants';

function app() {
  return cy.get('app-transfer');
}
function transferSetup() {
  cy.get('#component').click().get('mat-option').contains('transfer').click();
}

describe('transfer test', () => {
  before(() => {
    cy.intercept('GET', '/api/banks/*', (req) => {
      req.reply(TestConstants.BANK_BANK_MODEL);
    }).as('getBank');

    cy.intercept('GET', '/api/customers/*', (req) => {
      req.reply(TestConstants.CUSTOMER_BANK_MODEL);
    }).as('getCustomer');

    cy.intercept('POST', '/api/quotes', (req) => {
      req.reply(TestConstants.QUOTE_BANK_MODEL_TRANSFER);
    }).as('createQuote');

    cy.visit('/');
    //@ts-ignore
    cy.login();
  });

  it('should render the transfer component', () => {
    transferSetup();
    app().should('exist');
  });

  it('should navigate back to the account list', () => {
    app().find('app-navigation').find('button').click();
    app().should('not.exist');
    cy.get('app-account-list').should('exist');
  });

  it('should display available to trade', () => {
    cy.intercept('GET', '/api/external_bank_accounts*', (req) => {
      req.reply(TestConstants.EXTERNAL_BANK_ACCOUNT_LIST_BANK_MODEL);
    }).as('getExternalBankAccounts');

    cy.intercept('GET', '/api/accounts*', (req) => {
      req.reply(TestConstants.ACCOUNT_LIST_BANK_MODEL);
    });

    transferSetup();

    app().find('.cybrid-balance').should('include.text', '$1.00');
  });

  it('should display a list of accounts', () => {
    app()
      .find('.cybrid-option')
      .should('include.text', 'ins_56 - Plaid Saving (1111)');
  });

  it('should disable the transfer button for a 0.00 value', () => {
    app().find('.cybrid-actions').find('button').should('be.disabled');
  });

  it('should enable the transfer button for valid non-zero values', () => {
    app().find('input').type('2.00');
    app().find('.cybrid-actions').find('button').should('be.enabled');
  });

  it('should swap between deposit/withdraw', () => {
    app().find('#action').should('contain', 'DEPOSIT');
    app().find('.mat-tab-labels').contains('WITHDRAW').click();
    app().find('#action').should('contain', 'WITHDRAW');
    app().find('.mat-tab-labels').contains('DEPOSIT').click();
  });

  it('should invalidate the amount input on withdraw > platform_available', () => {
    // Set 'side' to 'withdraw' and compare to platform_available = $1.00
    app().find('.mat-tab-labels').contains('WITHDRAW').click();
    app().find('mat-error').should('exist');
  });

  it('should disable the transfer button when amount is invalid', () => {
    app().find('.cybrid-actions').find('button').should('be.disabled');
  });

  it('should open the confirm dialog', () => {
    // Mock the silent quote refresh
    cy.intercept('POST', '/api/quotes', (req) => {
      req.reply(TestConstants.QUOTE_BANK_MODEL_TRANSFER);
    }).as('createQuote');

    app().find('.mat-tab-labels').contains('DEPOSIT').click();
    app().find('#action').click();

    app()
      .get('app-transfer-confirm')
      .should('exist')
      .should('contain.text', '$5.00 USD')
      .should('contain.text', 'Nov 30, 2022')
      .should('contain.text', 'Plaid Saving (1111)');
  });

  it('should cancel the confirm dialog', () => {
    app().get('app-transfer-confirm').find('button').contains('CANCEL').click();
    app().get('app-transfer-confirm').should('not.exist');
  });

  it('should open the details dialog', () => {
    // Mock the silent quote refresh
    cy.intercept('POST', '/api/quotes', (req) => {
      req.reply(TestConstants.QUOTE_BANK_MODEL_TRANSFER);
    }).as('createQuote');

    cy.intercept('POST', '/api/transfers', (req) => {
      req.reply(TestConstants.TRANSFER_BANK_MODEL);
    }).as('createTransfer');

    app().find('#action').click();
    app()
      .get('app-transfer-confirm')
      .find('button')
      .contains('CONFIRM')
      .click();

    app()
      .get('app-transfer-details')
      .should('exist')
      .should('contain.text', 'Processing')
      .should('contain.text', '$5.00 USD')
      .should('contain.text', 'Nov 30, 2022')
      .should('contain.text', 'Plaid Saving (1111)');
  });

  it('should navigate to the account-list after transfer', () => {
    app().get('app-transfer-details').find('button').contains('DONE').click();
    app().get('app-transfer-details').should('not.exist');
    cy.get('app-account-list').should('exist');
  });

  it('should handle an error on createQuote', () => {
    transferSetup();

    // Force network error on create quote
    cy.intercept('POST', '/api/quotes', { forceNetworkError: true }).as(
      'createQuote'
    );

    app().find('input').type('2.00');
    app().find('#action').click();

    cy.wait('@createQuote').then(() => {
      cy.get('snack-bar-container').should('exist').find('button').click();
    });
  });

  it('should handle an error on createTransfer', () => {
    transferSetup();

    // Force network error on create transfer
    cy.intercept('POST', '/api/transfers', { forceNetworkError: true }).as(
      'createTransfer'
    );

    app().find('input').type('2.00');
    app().find('#action').click();
    app()
      .get('app-transfer-confirm')
      .find('button')
      .contains('CONFIRM')
      .click();

    cy.wait('@createTransfer').then(() => {
      cy.get('snack-bar-container').should('exist').find('button').click();
    });
  });

  it('should execute a full transfer', () => {
    //No calls are mocked, and transfer is executed against the demo environment
    transferSetup();

    app().find('input').type('2.00');
    app().find('#action').click();
    app()
      .get('app-transfer-confirm')
      .find('button')
      .contains('CONFIRM')
      .click();

    app().get('app-transfer-details').find('button').contains('DONE').click();
    app().should('not.exist');

    cy.get('app-account-list').should('exist');
  });
});
