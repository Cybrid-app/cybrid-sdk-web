// @ts-ignore
function app() {
  return cy.get('app-login');
}

describe('login test', () => {
  it('should render the login card', () => {
    // Navigate to login
    cy.visit('/');

    app().should('exist').get('#clientId').type(Cypress.env('CLIENT_ID'));
    app().get('#clientSecret').type(Cypress.env('CLIENT_SECRET'));
    app().get('#customerGuid').type(Cypress.env('CUSTOMER_GUID'));
    app().get('#login').click();
  });
});
