//@ts-ignore
function app() {
    return cy.get('app-fiat-account-details');
}

function fiatAccountDetailsSetup() {
    cy.get('#component')
      .click()
      .get('mat-option')
      .contains('account-list')
      .click();
    cy.get('tbody').find('tr:contains("USD")').click();
}

describe('account-details test', () => {
    beforeEach(() => {
      //@ts-ignore
      cy.authenticate();
      cy.visit('/');
  
      cy.intercept('GET', 'api/prices*').as('listPrices');
      cy.intercept('GET', 'api/accounts/*').as('listAccount');
      cy.intercept('GET', 'api/trades*').as('listTrades');
      cy.intercept('GET', 'api/trades/*').as('getTrade');
      cy.intercept('GET', 'api/transfers*').as('listTransfers');
      cy.intercept('GET', 'api/transfers/*').as('getTransfer');
      fiatAccountDetailsSetup();
    });
    
    it('should render account details', () => {
      app().should('exist');
    });
    
    it('should display account data', () => {
      app()
        .find('.cybrid-header')
        .should('not.be.empty')
        .should('contain.text', 'United States Dollar')
        .should('contain.text', 'USD')
    });
    
    it('should display transfer data', () => {
      app()
        .find('tr')
        .should('not.be.empty')
        .should('contain.text', 'Deposit')
        .should('contain.text', 'USD');
    });
    
    it('should display transfer summary', () => {

        var selectedTr = "";
      // Select first trade in the table
      app().get('tbody').find('tr').first().click().invoke('text').then((text) => { selectedTr = text; });

      cy.intercept('api/transfers/*').as('getTransfer');
  
      cy.wait('@getTransfer').then(() => {

        var selectedTrParts = selectedTr.split(' ');
        selectedTrParts = selectedTrParts.filter(part => part);
        if (selectedTrParts[0] === 'outbound') {
            selectedTrParts.shift();
        }
        if (selectedTrParts[0].includes('Deposit')) {
            let match = selectedTrParts[0].match(/Deposit(\w+)/);
            if (match) {
                selectedTrParts.shift();
                selectedTrParts = ['Deposit', match[1], ...selectedTrParts];
            }
        }
        if (selectedTrParts[0].includes('Withdrawal')) {
            let match = selectedTrParts[0].match(/Withdrawal(\w+)/);
            if (match) {
                selectedTrParts.shift();
                selectedTrParts = ['Deposit', match[1], ...selectedTrParts];
            }
        }
        // -- Year and amount split
        if (selectedTrParts[3] !== undefined) {
            let matchYearValue = selectedTrParts[3].match(/(\d{4})\$(\d+\.\d+)/);
            if (matchYearValue) {
                selectedTrParts[3] = matchYearValue[1];
                selectedTrParts[5] = selectedTrParts[4];
                selectedTrParts[4] = matchYearValue[2];
            }
        }
        console.log(selectedTrParts);
        let transferType = selectedTrParts[0];
        let transferMonth = selectedTrParts[1];
        let transferDay = selectedTrParts[2];
        let transferYear = selectedTrParts[3];
        let transferAmount = selectedTrParts[4];
        let transferAsset = selectedTrParts[5];

        cy.get('.mat-dialog-title').should('contain.text', transferType);
        cy.get('.cybrid-subtitle').should('contain.text', `${transferAmount} ${transferAsset}`);
        cy.get('.cybrid-subheader-item')
            .should('not.be.empty')
            .invoke('text')
            .should('include', 'Transaction ID:')
            .should('include', 'Date:')
            .should('include', `${transferMonth} ${transferDay} ${transferYear}`)
        cy.get('.cybrid-list-item')
          .should('not.be.empty')
          .invoke('text')
          .should('include', 'Status')
          .should('include', 'Transfer Place')
          .should('include', `${transferAmount}`)
          .should('include', 'Transaction fee')
          .should('include', `${transferAsset}`);
        cy.get('app-transfer-summary').find('button').click();
      });
    });
    
    it('should navigate back', () => {
      app().find('app-navigation').find('button').click();
      app().should('not.exist');
    });
    
    it('should refresh the account and paginate', () => {
      // Intercept listAccount response
      let account;
      cy.wait('@listAccount').then((interception) => {
        // @ts-ignore
        account = interception.response.body;
      });
      // Intercept listTransfers response
      let transfers;
      cy.wait('@listTransfers').then((interception) => {
        // @ts-ignore
        transfers = interception.response.body;
      });
  
      // Check for new data
      cy.wait('@listAccount').its('response.body').should('not.eq', account);
      cy.wait('@listTransfers').its('response.body').should('not.eq', transfers);
  
      // Paginate: next
      app().find('.mat-paginator-navigation-next').click({ force: true });
  
      // Check for new data
      cy.wait('@listTransfers').its('response.body').should('not.eq', transfers);
  
      // Paginate: previous
      app().find('.mat-paginator-navigation-previous').click({ force: true });
  
      // Check for new data
      cy.wait('@listTransfers').its('response.body').should('not.eq', transfers);
  
      // Paginate: change items per page
      app().find('.mat-paginator-page-size-select').click();
      cy.get('mat-option').contains('10').click();
  
      cy.wait('@listTransfers').its('response.body').should('not.eq', transfers);
      app().find('tr').should('have.length', 11);
    });
    
    it('should handle errors returned by transfers api', () => {
      // Force trades error
      cy.wait('@listTransfers').then(() =>
        cy
          .intercept('GET', 'api/transfers*', { forceNetworkError: true })
          .as('listTransfers')
      );
  
      cy.wait('@listTransfers').then(() =>
        app().find('.cybrid-fatal').should('exist')
      );
    });
});