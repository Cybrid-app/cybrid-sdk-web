// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
declare namespace Cypress {
  interface Chainable<Subject = any> {
    customCommand(param: any): typeof customCommand;
  }
}

function customCommand(param: any): void {
  console.warn(param);
}

beforeEach(() => {
  cy.intercept(
    'GET',
    'https://api.github.com/repos/Cybrid-app/cybrid-sdk-web/releases/latest',
    (req) => {
      req.reply({});
    }
  );
});

// @ts-ignore
Cypress.Commands.add('authenticate', () => {
  const app = () => cy.get('app-login');
  cy.session(
    'auth',
    () => {
      cy.visit('/');
      app()
        .should('exist')
        .get('#clientId')
        .type(Cypress.env('CLIENT_ID_PLAID'));
      app().get('#clientSecret').type(Cypress.env('CLIENT_SECRET_PLAID'));
      app().get('#customerGuid').type(Cypress.env('CUSTOMER_GUID_PLAID'));
      cy.get('mat-select').click();
      cy.get('mat-option').contains('Staging').click();
      app().get('#login').click();
      app()
        .should('not.exist')
        .then(() => {
          cy.window().getAllLocalStorage().should('not.eq', {});
        });
    },
    {
      cacheAcrossSpecs: true
    }
  );
});

// @ts-ignore
Cypress.Commands.add('login', (backstopped?: 'backstopped') => {
  cy.visit('/');

  function typeCredentials(
    client_id: string,
    client_secret: string,
    customer_guid: string
  ) {
    cy.get('app-login')
      .should('exist')
      .get('#clientId')
      .type(Cypress.env(client_id));
    cy.get('#clientSecret').type(Cypress.env(client_secret));
    cy.get('#customerGuid').type(Cypress.env(customer_guid));
    cy.get('mat-select').click();
    cy.get('mat-option').contains('Staging').click();
    cy.get('#login').click();
  }

  backstopped
    ? typeCredentials(
        'CLIENT_ID_BACKSTOPPED',
        'CLIENT_SECRET_BACKSTOPPED',
        'CUSTOMER_GUID_BACKSTOPPED'
      )
    : typeCredentials(
        'CLIENT_ID_PLAID',
        'CLIENT_SECRET_PLAID',
        'CUSTOMER_GUID_PLAID'
      );
});
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
