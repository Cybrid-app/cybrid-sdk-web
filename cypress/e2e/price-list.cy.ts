// @ts-ignore
function app() {
  return cy.get('app-price-list');
}

function priceListSetup() {
  return cy
    .get('#component')
    .click()
    .get('mat-option')
    .contains('price-list')
    .click();
}

describe('price-list test', () => {
  beforeEach(() => {
    //@ts-ignore
    cy.authenticate();
    cy.visit('/');

    cy.intercept('/api/prices').as('getPrices');

    priceListSetup();
  });

  it('should render the price list', () => {
    cy.wait('@getPrices').then(() => {
      app()
        .should('exist')
        .get('.cybrid-asset-cell')
        .should('contain', 'BTC')
        .and('contain', 'ETH')
        .find('#price')
        .should('not.equal', '$0.00');
    });
  });

  it('should filter results', () => {
    // Search for 'bitcoin'
    app().find('#filter').should('exist').type('bitcoin');
    app().find('tr').should('contain', 'BTC').and('not.contain', 'ETH');

    // Search for non-existent coin
    app()
      .find('#filter')
      .click({ multiple: true })
      .type('test')
      .then(() => {
        app().find('#warning').should('contain', 'No coins found');
        app().find('#filter').click().clear();
        app()
          .find('.cybrid-asset-cell')
          .should('contain', 'BTC')
          .and('contain', 'ETH');
      });
  });

  it('should refresh the price list', () => {
    // Intercept getPrice response
    let prices;
    cy.wait('@getPrices').then((interception) => {
      // @ts-ignore
      prices = interception.response.body;
    });

    cy.wait('@getPrices')
      .its('response.body')
      .should('not.eq', prices)
      .then(() => {
        app()
          .find('tr')
          .should('not.contain', 'Error fetching coins')
          .then(() => {
            app()
              .find('.cybrid-asset-cell')
              .should('contain', 'BTC')
              .and('contain', 'ETH');
          });
      });
  });
});
