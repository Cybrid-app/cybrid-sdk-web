//@ts-ignore
function app() {
    return cy.get('external-wallet-list');
}

function externalWalletListSetup() {
    cy.get('#component')
      .click()
      .get('mat-option')
      .contains('external-wallet-list')
      .click();
}

describe('external-wallet-list test', () => {

    beforeEach(() => {
        //@ts-ignore
        cy.authenticate();
        cy.visit('/');
    
        cy.intercept('GET', 'api/external_wallets*').as('listWallets');
        externalWalletListSetup();
    });

    it('should render details', () => {
        app().should('exist');
    });

    it('should display data', () => {
        app()
          .find('.cybrid-header')
          .should('not.be.empty')
          .should('contain.text', 'My wallets')
    });
      
    it('should handle errors returned by external wallets api', () => {
        // Force trades error
        cy.wait('@listWallets').then(() =>
          cy
            .intercept('GET', 'api/external_wallets*', { forceNetworkError: true })
            .as('listWallets')
        );
    
        cy.wait('@listWallets').then(() =>
          app().find('.cybrid-fatal').should('exist')
        );
    });
});