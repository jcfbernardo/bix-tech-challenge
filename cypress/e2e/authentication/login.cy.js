import LoginPage from "../../support/page_objects/LoginPage";

describe('User Session State Transition with Mocks', function () {

  before(function () {
    cy.fixture('users.json').as('users');
    cy.fixture('products.json').as('products');
  });

  beforeEach(function () {
    cy.intercept('GET', '/api/products', {
      body: { items: this.products }
    }).as('getProducts');

    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: {
        message: 'Login realizado com sucesso',
        user: this.users[1]
      }
    }).as('loginRequest');

    cy.intercept('POST', '/api/logout', {
      statusCode: 200,
      body: { message: 'Logout realizado com sucesso' }
    }).as('logoutRequest');
  });


  /**
   * @description CT-009: Validate user session state transition (Login/Logout).
   */
  it('CT-009: Verifies the state transitions, ensuring the user interface adapts correctly', function () {
    const regularUser = this.users[1];

    LoginPage.visit();
    cy.wait('@getProducts');

    cy.log('Checking initial state');
    LoginPage.shouldBeLoggedOut();

    cy.log('Executing the login with a valid user');
    LoginPage.login(regularUser.email, regularUser.password);

    cy.wait('@loginRequest');

    cy.log('Checking logged state');
    LoginPage.shouldBeLoggedIn();
    LoginPage.shouldShowUserName(regularUser.name);

    cy.log('Executing logout');
    LoginPage.logout();

    cy.wait('@logoutRequest');

    cy.log('Checking final state');
    LoginPage.shouldBeLoggedOut();
  });
});