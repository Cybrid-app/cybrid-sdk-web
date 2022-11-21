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
  beforeEach(() => {
    //@ts-ignore
    cy.login();
  });

  it('should poll on customer status', () => {
    identityVerificationSetup();

    // Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'storing';
    cy.intercept('GET', 'api/customers/*', (req) => {
      delete req.headers['if-none-match'];
      req.reply(customer);
    }).as('getCustomer');

    app()
      .find('strong')
      .should('contain.text', text.identityVerification.checkStatus);

    // Check for error after poll
    cy.wait(Constants.POLL_DURATION).then(() => {
      app().find('strong').should('contain.text', text.unexpectedError);
    });
  });

  it('should display verified customer status', () => {
    identityVerificationSetup();

    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'verified';
    cy.intercept('GET', 'api/customers/*', (req) => {
      delete req.headers['if-none-match'];
      req.reply(customer);
    }).as('getCustomer');

    cy.wait('@getCustomer').then(() => {
      app()
        .find('strong')
        .should('contain.text', text.identityVerification.verified);
      app()
        .find('#customer-button-done')
        .should('contain.text', text.done)
        .click();
    });
  });

  it('should display rejected customer status', () => {
    identityVerificationSetup();

    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'rejected';
    cy.intercept('GET', 'api/customers/*', (req) => {
      delete req.headers['if-none-match'];
      req.reply(customer);
    }).as('getCustomer');

    cy.wait('@getCustomer').then(() => {
      app()
        .find('strong')
        .should('contain.text', text.identityVerification.rejected);
      app().find('p').should('contain.text', text.identityVerification.support);
      app().find('#cancel').should('be.disabled');
      app().find('#customer-button-done').contains(text.done).click();

      app().should('not.exist');
    });
  });

  it('should display unverified status', () => {
    identityVerificationSetup();

    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'unverified';
    cy.intercept('GET', 'api/customers/*', (req) => {
      delete req.headers['if-none-match'];
      req.reply(customer);
    }).as('getCustomer');

    cy.wait('@getCustomer').then(() => {
      app()
        .find('strong')
        .should('contain.text', text.identityVerification.unverified);
    });
  });

  it('should poll on identity status', () => {
    identityVerificationSetup();

    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'unverified';
    cy.intercept('GET', 'api/customers/*', (req) => {
      delete req.headers['if-none-match'];
      req.reply(customer);
    }).as('getCustomer');

    //Mock identity list
    const identityList = {
      ...TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL
    };
    identityList.objects[0].state = 'storing';

    cy.intercept('GET', 'api/identity_verifications*', (req) => {
      req.reply(identityList);
    }).as('getIdentity');

    //Mock identity
    const identity = { ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL };
    identity.persona_state = 'reviewing';

    cy.intercept('GET', 'api/identity_verifications/*', (req) => {
      req.reply(identity);
    });

    cy.wait('@getCustomer').then(() => {
      app().find('#verify').click();

      app()
        .find('strong')
        .should('contain.text', text.identityVerification.verifying);

      cy.wait(Constants.POLL_DURATION).then(() => {
        app().find('strong').should('contain.text', text.unexpectedError);
      });
    });
  });

  it('should display reviewing identity status', () => {
    identityVerificationSetup();

    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'unverified';
    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    //Mock list identity
    const identityList = {
      ...TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL
    };
    identityList.objects[0].state = 'completed';

    //Mock identity
    const identity = { ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL };
    identity.persona_state = 'reviewing';

    cy.intercept('GET', 'api/identity_verifications*', (req) => {
      req.reply(identityList);
    });

    cy.intercept('GET', 'api/identity_verifications/*', (req) => {
      req.reply(identity);
    });

    cy.wait('@getCustomer').then(() => {
      app().find('#verify').click();
      app()
        .find('#identity-button-done')
        .should('contain.text', text.done)
        .click();
      app().should('not.exist');
    });
  });

  it('should display passed identity outcome', () => {
    identityVerificationSetup();

    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'unverified';
    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    //Mock list identity
    const identity = { ...TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL };
    identity.objects[0].state = 'completed';
    identity.objects[0].outcome = 'passed';

    cy.intercept('GET', 'api/identity_verifications*', (req) => {
      req.reply(identity);
    }).as('getIdentity');

    cy.intercept('GET', 'api/identity_verifications/*', (req) => {
      req.reply(identity.objects[0]);
    });

    cy.wait('@getCustomer').then(() => {
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
  });

  it('should display failed identity outcome', () => {
    identityVerificationSetup();

    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'unverified';
    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    //Mock list identity
    const identityList = {
      ...TestConstants.IDENTITY_VERIFICATION_LIST_BANK_MODEL
    };
    identityList.objects[0].state = 'completed';
    identityList.objects[0].outcome = 'failed';

    cy.intercept('GET', 'api/identity_verifications*', (req) => {
      req.reply(identityList);
    }).as('getIdentity');

    // Mock identity
    const identity = { ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL };
    identity.persona_state = 'completed';

    cy.intercept('GET', 'api/identity_verifications/*', (req) => {
      req.reply(identity);
    });

    cy.wait('@getCustomer').then(() => {
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
});
