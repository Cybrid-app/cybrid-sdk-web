// @ts-ignore
function app() {
  return cy.get('app-account-list');
}

function accountListSetup() {
  cy.get('#component')
    .click()
    .get('mat-option')
    .contains('account-list')
    .click();
}

describe('account-list test', () => {
  beforeEach(() => {
    //@ts-ignore
    cy.authenticate();
    cy.visit('/');

    accountListSetup();
  });

  it('should render the account list', () => {
    app().should('exist');
  });

  it('should display account data', () => {
    app()
      .find('#account-value')
      .should('not.be.empty')
      .should('contain.text', 'Account Value');

    app()
      .find('#accountList')
      .should('contain.text', 'Asset')
      .should('contain.text', 'Market Price')
      .should('contain.text', 'Balance')
      .should('contain.text', 'USD')

      // Check table for ETH account
      .should('not.be.empty')
      .should(
        'contain.text',
        'ETH account for e8dc9202e0e96a33b5b6a7b0cfb66c60'
      )
      .should('contain.text', 'ETH')

      // Check table for BTC account
      .should('not.be.empty')
      .should(
        'contain.text',
        'BTC account for e8dc9202e0e96a33b5b6a7b0cfb66c60'
      )
      .should('contain.text', 'BTC');
  });

  it('should navigate back', () => {
    app().find('app-navigation').find('button').click();
    app().should('not.exist');
  });

  it('should refresh the account list', () => {
    // Intercept listAccounts response
    let accounts: any;

    cy.intercept('GET', 'api/accounts*').as('listAccounts');
    cy.wait('@listAccounts').then((interception) => {
      // @ts-ignore
      accounts = interception.response.body;
    });

    cy.wait('@listAccounts').its('response.body').should('not.eq', accounts);

    app().find('#warning').should('not.exist');
  });

  it('should handle errors returned by accounts api', () => {
    // Force accounts error
    cy.intercept('GET', '/api/accounts*').as('listAccounts');

    cy.wait('@listAccounts').then(() =>
      cy
        .intercept('GET', '/api/accounts*', { forceNetworkError: true })
        .as('listAccounts')
    );

    // Check for error row
    cy.wait('@listAccounts').then(() =>
      app().find('.cybrid-fatal').should('exist')
    );
  });

  it('should handle errors returned by prices api', () => {
    // Force prices error
    cy.intercept('GET', '/api/prices*').as('listPrices');

    cy.wait('@listPrices').then(() =>
      cy
        .intercept('GET', '/api/prices*', { forceNetworkError: true })
        .as('listPrices')
    );

    // Check for error row
    cy.wait('@listPrices').then(() =>
      app().find('.cybrid-fatal').should('exist')
    );
  });
});
