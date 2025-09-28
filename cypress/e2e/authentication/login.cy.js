import LoginPage from "../../support/page_objects/LoginPage";

describe('CT-009: User Session State Transition', () => {
    let vars = {};
  before(function() {
    cy.fixture('users.json').then((users) => {
      vars.adminUser = users[0];
      vars.regularUser = users[1];
    });
  });

  it('Verifies the state transitions, ensuring the user interface adapts correctly', function() {
    LoginPage.visit();

    cy.log('Checking initional state')
    LoginPage.shouldBeLoggedOut();

    cy.log('Executing the login with a valid user')
    LoginPage.login(vars.regularUser.email, vars.regularUser.password);
    
    cy.log('Checking logged state')
    LoginPage.shouldBeLoggedIn();
    LoginPage.shouldShowUserName(vars.regularUser.name);

    cy.log('Executing logout')
    LoginPage.logout();

    cy.log('Checking final state')
    LoginPage.shouldBeLoggedOut()
  });
});