import { Constants, TestConstants } from '@constants';
import * as translations from 'library/src/shared/i18n/en';

const text = translations.default;

function app() {
  return cy.get('app-identity-verification');
}

function identityVerificationSetup() {
  cy.get('#component')
    .click()
    .get('mat-option')
    .contains('identity-verification')
    .click();
}

describe('identity-verification test', () => {
  before(() => {
    cy.visit('/');
    //@ts-ignore
    cy.login();
  });

  it('should poll on customer status', () => {
    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'storing';
    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    identityVerificationSetup();

    app()
      .find('strong')
      .should('contain.text', text.identityVerification.checkStatus);

    app()
      .find('strong')
      .should('contain.text', text.identityVerification.unexpectedError);

    // Reset component
    cy.visit('/');
    //@ts-ignore
    cy.login();
  });

  it('should display verified customer status', () => {
    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'verified';
    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    identityVerificationSetup();

    app()
      .find('strong')
      .should('contain.text', text.identityVerification.verified);
    app()
      .find('#customer-button-done')
      .should('contain.text', text.done)
      .click();
  });

  it('should display rejected customer status', () => {
    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'rejected';
    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    identityVerificationSetup();

    app()
      .find('strong')
      .should('contain.text', text.identityVerification.rejected);
    app().find('p').should('contain.text', text.identityVerification.support);
    app().find('#cancel').should('be.disabled');
    app().find('#customer-button-done').contains(text.done).click();

    app().should('not.exist');
  });

  it('should display unverified status', () => {
    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'unverified';
    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    identityVerificationSetup();

    app()
      .find('strong')
      .should('contain.text', text.identityVerification.unverified);
  });

  it('should poll on identity status', () => {
    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'unverified';
    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    //Mock identity
    const identity = { ...TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL };
    identity.objects[0].state = 'storing';

    cy.intercept('GET', 'api/identity_verifications*', (req) => {
      req.reply(identity);
    }).as('getIdentity');

    identityVerificationSetup();
    app().find('#verify').click();

    app()
      .find('strong')
      .should('contain.text', text.identityVerification.verifying);

    cy.wait(Constants.POLL_DURATION).then(() => {
      app()
        .find('strong')
        .should('contain.text', text.identityVerification.unexpectedError);
    });

    // Reset component
    cy.visit('/');
    //@ts-ignore
    cy.login();
  });

  it('should display reviewing identity status', () => {
    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    //Mock list identity
    const identity = { ...TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL };
    identity.objects[0].state = 'completed';
    identity.objects[0].persona_state = 'reviewing';

    cy.intercept('GET', 'api/identity_verifications*', (req) => {
      req.reply(identity);
    });

    cy.intercept('GET', 'api/identity_verifications/*', (req) => {
      req.reply(identity.objects[0]);
    });

    identityVerificationSetup();
    app().find('#verify').click();
    app()
      .find('#identity-button-done')
      .should('contain.text', text.done)
      .click();
    app().should('not.exist');
  });

  it('should display passed identity outcome', () => {
    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    //Mock list identity
    const identity = { ...TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL };
    identity.objects[0].state = 'completed';
    identity.objects[0].persona_state = 'completed';
    identity.objects[0].outcome = 'passed';

    cy.intercept('GET', 'api/identity_verifications*', (req) => {
      req.reply(identity);
    }).as('getIdentity');

    cy.intercept('GET', 'api/identity_verifications/*', (req) => {
      req.reply(identity.objects[0]);
    });

    identityVerificationSetup();
    app().find('#verify').click();

    app()
      .find('strong')
      .should('contain.text', text.identityVerification.verified);
    app()
      .find('#identity-button-done')
      .should('contain.text', text.done)
      .click();
    app().should('not.exist');
  });

  it('should display failed identity outcome', () => {
    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    //Mock list identity
    const identity = { ...TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL };
    identity.objects[0].state = 'completed';
    identity.objects[0].persona_state = 'completed';
    identity.objects[0].outcome = 'failed';

    cy.intercept('GET', 'api/identity_verifications*', (req) => {
      req.reply(identity);
    }).as('getIdentity');

    cy.intercept('GET', 'api/identity_verifications/*', (req) => {
      req.reply(identity.objects[0]);
    });

    identityVerificationSetup();
    app().find('#verify').click();

    app()
      .find('strong')
      .should('contain.text', text.identityVerification.rejected);
    app()
      .find('#identity-button-done')
      .should('contain.text', text.done)
      .click();
    app().should('not.exist');
  });
});
