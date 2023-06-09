//@ts-ignore
function app() {
  return cy.get('app-account-details');
}

function accountDetailsSetup() {
  cy.get('#component')
    .click()
    .get('mat-option')
    .contains('account-list')
    .click();
  cy.get('tr').contains('BTC').click();
}

describe('account-details test', () => {
  beforeEach(() => {
    //@ts-ignore
    cy.authenticate();
    cy.visit('/');

    cy.intercept('GET', 'api/prices*').as('listPrices');
    cy.intercept('GET', 'api/accounts*').as('listAccounts');
    cy.intercept('GET', 'api/trades*').as('listTrades');
    cy.intercept('GET', 'api/trades/*').as('getTrade');

    accountDetailsSetup();
  });

  it('should render account details', () => {
    app().should('exist');
  });

  it('should display account data', () => {
    app()
      .find('.cybrid-header')
      .should('not.be.empty')
      .should('contain.text', 'Bitcoin')
      .should('contain.text', 'BTC')
      .should('contain.text', 'USD');
  });

  it('should display trade data', () => {
    app()
      .find('tr')
      .should('not.be.empty')
      .should('contain.text', 'Buy')
      .should('contain.text', 'BTC');
  });

  it('should display trade summary', () => {
    // Select first trade in the table
    app().find('tr').contains('BTC').first().click();

    cy.intercept('api/trades/*').as('getTrade');

    cy.wait('@getTrade').then(() => {
      cy.get('.cybrid-subtitle').should('contain.text', 'USD in BTC');
      cy.get('.cybrid-subheader-item').should('not.be.empty');
      cy.get('.cybrid-list-item')
        .should('not.be.empty')
        .should('contain.text', 'Status')
        .should('contain.text', 'Settling')
        .should('contain.text', 'Purchased amount')
        .should('contain.text', 'USD')
        .should('contain.text', 'Purchased quantity')
        .should('contain.text', 'BTC')
        .should('contain.text', 'Transaction fee');
      cy.get('app-trade-summary').find('button').click();
    });
  });

  it('should navigate back', () => {
    app().find('app-navigation').find('button').click();
    app().should('not.exist');
  });

  it('should refresh the account list and paginate', () => {
    // Intercept listAccounts response
    let account;
    cy.wait('@listAccounts').then((interception) => {
      // @ts-ignore
      account = interception.response.body;
    });
    // Intercept listTrades response
    let trades;
    cy.wait('@listTrades').then((interception) => {
      // @ts-ignore
      trades = interception.response.body;
    });

    // Check for new data
    cy.wait('@listAccounts').its('response.body').should('not.eq', account);
    cy.wait('@listTrades').its('response.body').should('not.eq', trades);

    // Paginate: next
    app().find('.mat-paginator-navigation-next').click();

    // Check for new data
    cy.wait('@listTrades').its('response.body').should('not.eq', trades);

    // Paginate: previous
    app().find('.mat-paginator-navigation-previous').click();

    // Check for new data
    cy.wait('@listTrades').its('response.body').should('not.eq', trades);

    // Paginate: change items per page
    app().find('.mat-paginator-page-size-select').click();
    cy.get('mat-option').contains('10').click();

    cy.wait('@listTrades').its('response.body').should('not.eq', trades);
    app().find('tr').should('have.length', 11);
  });

  it('should handle errors returned by trades api', () => {
    // Force trades error
    cy.wait('@listTrades').then(() =>
      cy
        .intercept('GET', 'api/trades*', { forceNetworkError: true })
        .as('listTrades')
    );

    cy.wait('@listTrades').then(() => app().find('#warning').should('exist'));
  });

  it('should navigate to onTrade()', () => {
    app().find('#trade').click();
  });
});
