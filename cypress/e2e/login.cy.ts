// @ts-ignore
function app() {
  return cy.get('app-login');
}

describe('login test', () => {
  it('should login', () => {
    // @ts-ignore
    cy.authenticate();
  });
});
