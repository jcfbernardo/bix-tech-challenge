import LoginPage from "../../support/page_objects/LoginPage";

describe('CT-009: User Session State Transition', () => {
  before(function() {
    cy.fixture('users.json').then((users) => {
      this.adminUser = users[0];
      this.regularUser = users[1];
    });
  });

  it('Verifies the state transitions, ensuring the user interface adapts correctly', function() {
    LoginPage.visit();

    cy.log('Checking initional state')
    LoginPage.shouldBeLoggedOut();

    cy.log('Executing the login with a valid user')
    LoginPage.login(this.regularUser.email, this.regularUser.password);
    
    cy.log('Checking logged state')
    LoginPage.shouldBeLoggedIn();
    LoginPage.shouldShowUserName(this.regularUser.name);

    cy.log('Executing logout')
    LoginPage.logout();

    cy.log('Checking final state')
    LoginPage.shouldBeLoggedOut()
  });
});