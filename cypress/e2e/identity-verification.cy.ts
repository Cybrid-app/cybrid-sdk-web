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
    cy.intercept('GET', 'api/prices*', (req) => {
      req.reply(TestConstants.SYMBOL_PRICE_BANK_MODEL_ARRAY);
    }).as('listPrices');
    cy.intercept('GET', 'api/assets', (req) => {
      req.reply(TestConstants.ASSET_LIST_BANK_MODEL);
    }).as('listAssets');
    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(TestConstants.CUSTOMER_BANK_MODEL);
    }).as('getCustomer');
    cy.intercept('GET', 'api/banks/*', (req) => {
      req.reply(TestConstants.BANK_BANK_MODEL);
    }).as('getBank');

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
      app().find('#customer-button-done').contains(text.done).click();

      app().should('not.exist');
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

    //Mock identity verification
    const identityVerification = {
      ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
    };
    identityVerification.state = 'storing'

    cy.intercept('POST', 'api/identity_verifications*', (req) => {
      req.reply(identityVerification);
    });

    cy.intercept('GET', 'api/identity_verifications/*', (req) => {
      req.reply(identityVerification);
    });

    cy.wait('@getCustomer').then(() => {
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

    //Mock identity verification
    const identityVerification = {
      ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
    };
    identityVerification.state = 'completed';
    identityVerification.persona_state = 'reviewing';

    cy.intercept('POST', 'api/identity_verifications*', (req) => {
      req.reply(identityVerification);
    });

    cy.intercept('GET', 'api/identity_verifications/*', (req) => {
      req.reply(identityVerification);
    });

    cy.wait('@getCustomer').then(() => {
      app()
        .find('strong')
        .should('contain.text', text.identityVerification.reviewing);
      app()
        .find('#identity-button-done')
        .should('contain.text', text.done)
        .click();
      app().should('not.exist');
    });
  });

  it('should display processing identity status', () => {
    identityVerificationSetup();

    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'unverified';

    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    //Mock identity verification
    const identityVerification = { ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL };
    identityVerification.state = 'waiting';
    identityVerification.persona_state = 'processing';

    cy.intercept('POST', 'api/identity_verifications*', (req) => {
      req.reply(identityVerification);
    });

    cy.intercept('GET', 'api/identity_verifications/*', (req) => {
      req.reply(identityVerification);
    });

    cy.wait('@getCustomer').then(() => {
      app()
        .find('strong')
        .should('contain.text', text.identityVerification.processing);
      app()
        .find('#identity-button-done')
        .should('contain.text', text.done)
        .click();
      app().should('not.exist');
    });
  });

  it('should display passed identity status', () => {
    identityVerificationSetup();

    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'unverified';

    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    //Mock identity verification
    const identityVerification = {
      ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
    };
    identityVerification.state = 'completed';
    identityVerification.outcome = 'passed';

    cy.intercept('POST', 'api/identity_verifications*', (req) => {
      req.reply(identityVerification);
    });

    cy.intercept('GET', 'api/identity_verifications/*', (req) => {
      req.reply(identityVerification);
    });

    cy.wait('@getCustomer').then(() => {
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

  it('should display failed identity status', () => {
    identityVerificationSetup();

    //Mock customer
    const customer = { ...TestConstants.CUSTOMER_BANK_MODEL };
    customer.state = 'unverified';

    cy.intercept('GET', 'api/customers/*', (req) => {
      req.reply(customer);
    }).as('getCustomer');

    //Mock identity verification
    const identityVerification = {
      ...TestConstants.IDENTITY_VERIFICATION_BANK_MODEL
    };
    identityVerification.state = 'completed';
    identityVerification.outcome = 'failed';

    cy.intercept('POST', 'api/identity_verifications*', (req) => {
      req.reply(identityVerification);
    });

    cy.intercept('GET', 'api/identity_verifications/*', (req) => {
      req.reply(identityVerification);
    });

    cy.wait('@getCustomer').then(() => {
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
