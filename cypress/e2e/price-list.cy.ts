// @ts-ignore
import { beforeEach } from 'mocha';

function app() {
  return cy.get('app-price-list');
}

describe('price-list test', () => {
  before(() => {
    cy.visit('/');
    // @ts-ignore
    cy.login();
  });

  it('should render the price list', () => {
    cy.intercept('/api/prices').as('getPrices');
    cy.wait('@getPrices');
    app()
      .should('exist')
      .get('.cybrid-asset-cell')
      .should('contain', 'BTC')
      .and('contain', 'ETH')
      .find('#price')
      .should('not.equal', '$0.00');
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
    cy.intercept('/api/prices').as('getPrices');
    cy.wait('@getPrices').then((interception) => {
      // @ts-ignore
      prices = interception.response.body;
    });

    cy.wait('@getPrices').its('response.body').should('not.eq', prices);

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
