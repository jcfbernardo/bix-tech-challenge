import './commands';

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      addProductToCart(productName: string, quantity?: number): Chainable<void>;
    }
  }
}