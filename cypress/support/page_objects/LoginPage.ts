export class LoginPage {
  private selectors = {
    emailInput: '#email',
    passwordInput: '#password',
    loginButton: '#login-btn',
    logoutButton: '#logout-btn',
    loginForm: '#login-form',
    userInfo: '#user-info',
    userName: '#user-name'
  };

  // Actions
  visit(): void {
    cy.visit('/');
  }

  fillEmail(email: string): void {
    cy.get(this.selectors.emailInput).clear().type(email);
  }

  fillPassword(password: string): void {
    cy.get(this.selectors.passwordInput).clear().type(password);
  }

  clickLogin(): void {
    cy.get(this.selectors.loginButton).click();
  }

  login(email: string, password: string): void {
    this.fillEmail(email);
    this.fillPassword(password);
    this.clickLogin();
  }

  logout(): void {
    cy.get(this.selectors.logoutButton).click();
  }

  // Validations
  shouldShowLoginForm(): void {
    cy.get(this.selectors.loginForm).should('be.visible');
  }

  shouldShowUserInfo(): void {
    cy.get(this.selectors.userInfo).should('be.visible');
  }

  shouldShowUserName(name: string): void {
    cy.get(this.selectors.userName).should('contain', name);
  }

  shouldBeLoggedIn(): void {
    cy.get(this.selectors.userInfo).should('be.visible');
    cy.get(this.selectors.loginForm).should('not.be.visible');
  }

  shouldBeLoggedOut(): void {
    cy.get(this.selectors.loginForm).should('be.visible');
    cy.get(this.selectors.userInfo).should('not.be.visible');
  }
}

export default new LoginPage();
