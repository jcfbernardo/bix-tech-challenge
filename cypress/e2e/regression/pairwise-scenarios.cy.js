import ProductPage from "../../support/page_objects/ProductPage";
import CheckoutPage from "../../support/page_objects/CheckoutPage";

describe("Pairwise Scenarios", function () {
  
  beforeEach(function () {
    cy.fixture("users.json").as('users');
    cy.fixture("products.json").as('products');
    ProductPage.visit();

    cy.get('@users').then(users => {
        const user = users[1];
        cy.login(user.email, user.password);
    });
  });

  /**
   * @description CT-010: Authenticated user completes purchase of in-stock product with a percentage coupon.
   */
  it("CT-010: should allow an authenticated user to purchase an in-stock item with a percentage coupon", function () {
    cy.get('@products').then(products => {
      const product = products.find(p => p.name === 'Keyboard');
      const couponCode = 'WELCOME10';
      const discountPercentage = 10;

      const discountAmount = (product.price * discountPercentage) / 100;
      const finalTotal = product.price - discountAmount;

      cy.intercept("GET", "/api/products", {
        body: { items: products },
      }).as("getProducts");

      cy.intercept("POST", "**/api/validate-coupon", {
        statusCode: 200,
        body: { "valid": true, "coupon": { "code": couponCode, "discount": discountPercentage, "type": "percentage" } },
      }).as("validateCoupon");

      cy.intercept("POST", "/api/checkout", {
        statusCode: 200,
        body: {
          orderId: `mock-ord-${Date.now()}`,
          subtotal: product.price,
          discount: discountAmount,
          total: finalTotal,
          appliedCoupon: couponCode,
        },
      }).as("checkoutRequest");

      ProductPage.visit();
      cy.wait('@getProducts');

      cy.log('--- Adicionando produto e aplicando cupom ---');
      ProductPage.addToCart(product.name, 1);
      CheckoutPage.applyCoupon(couponCode);
      cy.wait('@validateCoupon');
      
      CheckoutPage.shouldShowDiscount(discountAmount);
      CheckoutPage.shouldShowFinalTotal(finalTotal);

      cy.log('--- Finalizando a compra ---');
      CheckoutPage.finalizePurchase();
      
      cy.wait("@checkoutRequest");
      CheckoutPage.shouldShowEmptyCart();
    });
  });
});