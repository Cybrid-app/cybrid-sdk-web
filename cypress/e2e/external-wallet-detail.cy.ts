//@ts-ignore
function app() {
    return cy.get('external-wallet-detail');
}

function externalWalletDetailSetup() {
    cy.get('#component')
      .click()
      .get('mat-option')
      .contains('external-wallet-list')
      .click();
    cy.get('tr').contains('BTC').click();
}

describe('external-wallet-detail test', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.authenticate();
        cy.visit('/');
    
        cy.intercept('GET', 'api/external_wallets*').as('listWallets');
        cy.intercept('GET', 'api/external_wallets/*').as('getWallet');
        externalWalletDetailSetup();
    });

    it('should render details', () => {

        /*cy.get('tr').first().click();
        cy.intercept('api/external_wallets*').as('listWallets');
        cy.wait('@listWallets').then(() => {
            cy.get('tr').first().click();
        });*/
        //cy.get('#transferList').find('tr')
        //cy.find('tr').contains('BTC').first().click();
        app().should('exist');
    });

    it('should display data', () => {
        app()
          .find('.cybrid-header')
          .should('not.be.empty')
          .should('contain.text', 'My wallet')

        app()
        .find('.asset')
        .should('contain.text', 'Asset')

        app()
        .find('.name')
        .should('contain.text', 'Name')

        app()
        .find('.address')
        .should('contain.text', 'Address')
    });

    it('should navigate back', () => {
        app().find('app-navigation').find('button').click();
        app().should('not.exist');
    });
});