// @ts-ignore
function app() {
  return cy.get('app-transfer');
}
function transferSetup() {
  cy.get('#component').click().get('mat-option').contains('transfer').click();
}

describe('transfer test', () => {
  beforeEach(() => {
    //@ts-ignore
    cy.authenticate();

    cy.intercept('GET', '/api/customers/*').as('getCustomer');
    cy.intercept('POST', '/api/quotes').as('createQuote');
    cy.intercept('GET', '/api/accounts*').as('getAccount');
    cy.intercept('POST', '/api/transfers').as('createTransfer');
    cy.intercept('GET', '/api/external_bank_accounts*').as(
      'listExternalBankAccounts'
    );

    cy.visit('/');

    transferSetup();
  });

  it('should render the transfer component', () => {
    app().should('exist');
  });

  it('should navigate back to the account list', () => {
    app().find('app-navigation').find('button').click();
    app().should('not.exist');
    cy.get('app-account-list').should('exist');
  });

  it('should display available to trade', () => {
    app().find('.cybrid-balance').should('not.be.empty');
  });

  it('should display a list of accounts', () => {
    app().find('.cybrid-option').should('not.be.empty');
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
    app().find('.mat-tab-labels').contains('WITHDRAW').click({ force: true });
    app().find('#action').should('contain', 'WITHDRAW');
    app().find('.mat-tab-labels').contains('DEPOSIT').click({ force: true });
  });

  it('should invalidate the amount input on withdraw > platform_available', () => {
    app().find('input').type(Number.MAX_SAFE_INTEGER.toString());
    app().find('.mat-tab-labels').contains('WITHDRAW').click();
    app().find('mat-error').should('exist');
  });

  it('should disable the transfer button when amount is invalid', () => {
    app().find('.cybrid-actions').find('button').should('be.disabled');
  });

  it('should open the confirm dialog', () => {
    app().find('input').type('2.00');
    app().find('.mat-tab-labels').contains('DEPOSIT').click();
    app().find('#action').click();

    app()
      .get('app-transfer-confirm')
      .should('exist')
      .should('not.be.empty')
      .should('contain.text', 'USD');
  });

  it('should cancel the confirm dialog', () => {
    app().find('input').type('2.00');
    app().find('.mat-tab-labels').contains('DEPOSIT').click();
    app().find('#action').click();

    app().get('app-transfer-confirm').find('button').contains('CANCEL').click();
    app().get('app-transfer-confirm').should('not.exist');
  });

  it('should open the details dialog', () => {
    app().find('input').type('2.00');
    app().find('#action').click();
    app()
      .get('app-transfer-confirm')
      .find('button')
      .contains('CONFIRM')
      .click();

    app()
      .get('app-transfer-details')
      .should('exist')
      .should('not.be.empty')
      .should('contain.text', 'Processing')
      .should('contain.text', 'USD');
  });

  it('should navigate to the account-list after transfer', () => {
    app().find('input').type('2.00');
    app().find('#action').click();
    app()
      .get('app-transfer-confirm')
      .find('button')
      .contains('CONFIRM')
      .click();

    app().get('app-transfer-details').find('button').contains('DONE').click();
    app().get('app-transfer-details').should('not.exist');

    cy.get('app-account-list').should('exist');
  });

  it('should handle an error on createQuote', () => {
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
