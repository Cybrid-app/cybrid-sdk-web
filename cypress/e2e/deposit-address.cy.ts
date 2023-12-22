//@ts-ignore
function app() {
    return cy.get('app-deposit-address');
}

function accountDetailsSetup() {
    cy.get('#component')
      .click()
      .get('mat-option')
      .contains('account-list')
      .click();
    cy.get('tr').contains('BTC').click();
    cy.get('button').contains('Get Deposit Address').click();
  }

  describe('account-details test', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.authenticate();
        cy.visit('/');
    
        cy.intercept('GET', 'api/accounts/*').as('listAccount');
        cy.intercept('GET', 'api/deposit_addresses*').as('listDepositAddresses');
        cy.intercept('GET', 'api/deposit_addresses/*').as('getDepositAddress');
        cy.intercept('POST', 'api/deposit_addresses*').as('createDepositAddress');
        accountDetailsSetup();
    });

    it('should render account details', () => {
        app().should('exist');
    });

    it('should display account deposit address data', () => {

        var qrCodeData: string = "";
        app()
          .find('.cybrid-header')
          .find('.cybrid-account')
          .should('not.be.empty')
          .should('contain.text', 'Deposit BTC')

        app()
          .find('.qrcode')
          .should('exist');
        
        app()
          .find('qrcode[ng-reflect-qrdata]')
          .invoke('attr', 'ng-reflect-qrdata')
          .should('include', 'bitcoin:');

        app()
          .find('qrcode[ng-reflect-qrdata]')
          .invoke('attr', 'ng-reflect-qrdata')
          .then(qrData => {

            qrCodeData = qrData ?? "";
            var qrParts = qrCodeData.split('bitcoin:');
            var address = qrParts[1];

            app()
                .find('.address')
                .should('not.be.empty')
                .should('contain.text', 'BTC Deposit Address')
                .should('contain.text', address);
        });

        app()
          .find('.cybrid-header')
          .find('.cybrid-account')
          .should('not.be.empty')
          .should('contain.text', 'Send only BTC to this deposit address.');

        app()
          .find('.network')
          .should('not.be.empty')
          .should('contain.text', 'Network')
          .should('contain.text', 'Bitcoin');
    });

    it('should update payment qrCode data', () => {

        var qrCodeData: string = "";
        app()
            .find('.qrCodeData')
            .invoke('text')
            .then(qrData => {

                qrCodeData = qrData ?? "";
                var qrParts = qrCodeData.split('bitcoin:');
                var address = qrParts[1];

                app()
                    .find('.address')
                    .should('not.be.empty')
                    .should('contain.text', 'BTC Deposit Address')
                    .should('contain.text', address);

                cy.get('button').contains('Generate payment code').click();
                cy.get('.mat-dialog-title').should('contain.text', 'Deposit details for BTC');
                cy.get('.amount-input').should('contain.text', 'Amount');
                cy.get('.amount-input').should('contain.text', 'BTC');
                cy.get('input[formcontrolname="amount"]')
                    .type('5');
                cy.get('.message-input').should('contain.text', 'Message for transaction');
                cy.get('input[formcontrolname="message"]')
                    .type('Cybrid');
                cy.get('button').contains('CONFIRM').click();
                cy.wait(1500);

                app()
                    .find('.qrCodeData')
                    .invoke('text')
                    .then(newQRCode => {

                        expect(newQRCode).to.not.equal(qrCodeData);

                        app()
                            .find('.amount')
                            .should('not.be.empty')
                            .should('contain.text', 'Amount')
                            .should('contain.text', '5');

                        app()
                            .find('.message')
                            .should('not.be.empty')
                            .should('contain.text', 'Message')
                            .should('contain.text', 'Cybrid');
                    });
        });
    });

    it('should navigate back', () => {
        app().find('app-navigation').find('button').click();
        app().should('not.exist');
    });
});