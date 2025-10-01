import './commands';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login command - Logs in with email and password
       * @param email - User email
       * @param password - User password
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Add product to cart command
       * @param productName - Name of the product to add
       * @param quantity - Quantity to add (default: 1)
       */
      addProductToCart(productName: string, quantity?: number): Chainable<void>;

      /**
       * Setup products and users fixtures with intercepts
       * @param productModifications - Optional array to modify products
       */
      setupProductsAndUsers(productModifications?: any[]): Chainable<void>;

      /**
       * Login as regular user (index 1 from users fixture)
       */
      loginAsRegularUser(): Chainable<void>;

      /**
       * Mock checkout success response
       * @param total - Total amount (optional)
       * @param orderId - Order ID (optional, generates random if not provided)
       */
      mockCheckoutSuccess(total?: number, orderId?: string): Chainable<void>;

      /**
       * Mock coupon validation response
       * @param couponCode - Coupon code to validate
       * @param discount - Discount percentage
       * @param isValid - Whether coupon is valid (default: true)
       */
      mockCouponValidation(couponCode: string, discount: number, isValid?: boolean): Chainable<void>;

      /**
       * Complete setup for cart tests (fixtures + login + add product)
       * @param productName - Product to add to cart (default: "Keyboard")
       */
      setupCartTest(productName?: string): Chainable<void>;

      /**
       * Modify stock of a specific product
       * @param productName - Name of the product to modify
       * @param newStock - New stock value
       */
      modifyProductStock(productName: string, newStock: number): Chainable<void>;
    }
  }
}