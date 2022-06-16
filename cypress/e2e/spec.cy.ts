describe('price-list test', () => {
  it('should render the price list', () => {
    cy.intercept('POST', '/oauth/token', (req) => {
      req.body.client_id = Cypress.env('CLIENT_ID');
      req.body.client_secret = Cypress.env('CLIENT_SECRET');
      req.continue();
    });
    cy.visit('/');
    cy.intercept('/api/prices').as('getPrices');
    cy.wait('@getPrices')
      .get('app-app')
      .should('exist')
      .get('app-list')
      .find('#asset')
      .should('contain', 'BTC')
      .and('contain', 'ETH')
      .find('#price')
      .should('not.equal', '$0.00');
  });
  it('should filter results', () => {
    cy.get('app-app').shadow().find('#filter').should('exist').type('bitcoin');
    cy.get('app-app')
      .shadow()
      .get('app-list')
      .find('tr')
      .should('contain', 'BTC')
      .and('not.contain', 'ETH')
      .click({ multiple: true });
    cy.get('app-app')
      .shadow()
      .find('#filter')
      .type('test')
      .then(() => {
        cy.get('app-app')
          .shadow()
          .find('#warning')
          .should('contain', 'No coins found');
        cy.get('app-app').shadow().find('#filter').click().clear();
        cy.get('app-app')
          .shadow()
          .find('#asset')
          .should('contain', 'BTC')
          .and('contain', 'ETH');
      });
  });
  it('should refresh the price list', () => {
    cy.intercept('/api/prices').as('getPrices');
    cy.wait('@getPrices')
      .get('app-app')
      .shadow()
      .find('tr')
      .should('not.contain', 'Error fetching coins')
      .then(() => {
        cy.get('app-app')
          .shadow()
          .find('#asset')
          .should('contain', 'BTC')
          .and('contain', 'ETH');
      });
  });
});
