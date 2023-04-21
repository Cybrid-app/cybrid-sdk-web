import { TestConstants } from '@constants';

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

    // Mock prices
    cy.intercept('GET', 'api/prices*', (req) => {
      req.reply(TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY);
    }).as('listPrices');
    // Mock accounts
    cy.intercept('GET', 'api/accounts*', (req) => {
      req.reply(TestConstants.ACCOUNT_LIST_BANK_MODEL);
    }).as('listAccounts');
    // Mock trades
    cy.intercept('GET', 'api/trades*', (req) => {
      req.reply(TestConstants.TRADE_LIST_BANK_MODEL);
    }).as('listTrades');
    cy.intercept('GET', 'api/trades/*', (req) => {
      req.reply(TestConstants.TRADE_LIST_BANK_MODEL.objects[0]);
    }).as('getTrade');

    accountDetailsSetup();
  });

  it('should render account details', () => {
    app().should('exist');
  });

  it('should display account data', () => {
    app()
      .find('.cybrid-header')
      .should('contain.text', 'Bitcoin')
      .should('contain.text', 'BTC')
      .should('contain.text', 'USD')
      .should('contain.text', '$21,298.00')
      .should('contain.text', '232.18708499')
      .should('contain.text', '4,944,888.35');
  });

  it('should display trade data', () => {
    app()
      .find('tr')
      .should('contain.text', 'Buy')
      .should('contain.text', 'BTC')
      .should('contain.text', 'Feb 24, 2023')
      .should('contain.text', '0.00004298')
      .should('contain.text', '$1.00')
      .should('contain.text', '0.00004297')
      .should('contain.text', '$1.00');
  });

  it('should display trade summary', () => {
    // Select first trade in the table
    app().find('tr').contains('BTC').first().click();

    cy.wait('@getTrade').then(() => {
      cy.get('.cybrid-subtitle').should('contain.text', '$1.00 USD in BTC');
      cy.get('.cybrid-subheader-item')
        .should('contain.text', '0989a082d...')
        .should('contain.text', 'Feb 24, 2023');
      cy.get('.cybrid-list-item')
        .should('contain.text', 'Status')
        .should('contain.text', 'Settling')
        .should('contain.text', 'Purchased amount')
        .should('contain.text', '$1.00')
        .should('contain.text', 'USD')
        .should('contain.text', 'Purchased quantity')
        .should('contain.text', '0.00004298 BTC')
        .should('contain.text', 'Transaction fee')
        .should('contain.text', '$0.00');
      cy.get('app-trade-summary').find('button').click();
    });
  });

  it('should navigate back', () => {
    app().find('app-navigation').find('button').click();
    app().should('not.exist');
  });

  it('should refresh the account list and paginate', () => {
    // Reset mocks
    cy.intercept('GET', 'api/prices*', (req) => {
      req.continue();
    });
    cy.intercept('GET', 'api/accounts*', (req) => {
      req.continue();
    }).as('listAccounts');
    cy.intercept('GET', 'api/trades*', (req) => {
      req.continue();
    }).as('listTrades');

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
    // Force prices error
    cy.intercept('GET', 'api/trades*', { forceNetworkError: true }).as(
      'listTrades'
    );

    cy.wait('@listTrades').then(() => {
      app().find('#warning').should('exist');
    });
  });

  it('should navigate to onTrade()', () => {
    app().find('#trade').click();
  });
});
