import ProductPage from "../../support/page_objects/ProductPage";
import CheckoutPage from "../../support/page_objects/CheckoutPage";
import LoginPage from "../../support/page_objects/LoginPage";

describe("Purchase Flow Scenarios with Mocks", function () {
  before(function () {
    cy.fixture("products.json").as("products");
    cy.fixture("users.json").as("users");
  });

  describe("Authenticated User Flow", function () {
    beforeEach(function () {
      cy.intercept("GET", "/api/products", {
        body: { items: this.products },
      }).as("getProducts");

      const user = this.users[1];
      cy.login(user.email, user.password);
      ProductPage.visit();
    });

    /**
     * @description CT-002: Attempt to add the maximum stock quantity of a product.
     */
    it("CT-002: should purchase the maximum stock and validate the specific checkout response", function () {
      const product = this.products.find((p) => p.stock > 0);
      const quantityToAdd = product.stock;
      const expectedTotal = product.price * quantityToAdd;

      cy.intercept("POST", "/api/checkout", {
        statusCode: 200,
        body: {
          orderId: `mock-ord-${Date.now()}`,
          discount: 0,
          total: expectedTotal,
          subtotal: expectedTotal,
          appliedCoupon: null,
        },
      }).as("checkoutRequest");

      ProductPage.addToCart(product.name, quantityToAdd);
      ProductPage.shouldShowCartCount(quantityToAdd);
      ProductPage.shouldShowCartTotal(expectedTotal);
      CheckoutPage.finalizePurchase();

      cy.wait("@checkoutRequest").then((interception) => {
        console.log('Corpo da Requisição Enviada:', JSON.stringify(interception.request.body, null, 2));

        const requestBody = interception.request.body;
        expect(requestBody.items[0].id).to.eq(product.id);
        expect(requestBody.items[0].qty).to.eq(quantityToAdd);
        expect(requestBody).to.not.have.property('couponCode');

        const responseBody = interception.response.body;
        expect(responseBody.total).to.eq(expectedTotal);
        expect(responseBody.subtotal).to.eq(expectedTotal);
        expect(responseBody.discount).to.eq(0);
        expect(responseBody.appliedCoupon).to.be.null;
      });

      CheckoutPage.shouldShowEmptyCart();
    });

    /**
     * @description CT-007: Validate purchase flow and cart clearing.
     */
    it("CT-007: should finalize the purchase and clear the cart", function () {
      const product = this.products.find((p) => p.name === "Mouse");
      const quantityToAdd = product.stock;
      const expectedTotal = product.price * quantityToAdd;

      cy.intercept("POST", "/api/checkout", {
        statusCode: 200,
        body: {
          orderId: `mock-ord-${Date.now()}`,
          discount: 0,
          total: expectedTotal,
          subtotal: expectedTotal,
          appliedCoupon: null,
        },
      }).as("checkoutRequest");

      ProductPage.addToCart(product.name, 1);
      ProductPage.shouldShowCartCount(1);
      CheckoutPage.finalizePurchase();


      CheckoutPage.shouldShowEmptyCart();
    });
  });

  describe("Unauthenticated User Flow", function () {
    beforeEach(function () {
      cy.intercept("GET", "/api/products", {
        body: { items: this.products },
      }).as("getProducts");

      cy.intercept("POST", "/api/validate-coupon", {
        statusCode: 200,
        body: { "valid": true, "coupon": { "code": "FIXED50", "discount": 50, "type": "fixed" } },
      }).as("validateCoupon");
    });

    it("CT-011: should redirect to login when attempting to finalize a purchase", function () {
      const product = this.products.find((p) => p.name === "Mouse");
      const fixedCoupon = "FIXED50";

      ProductPage.visit();

      ProductPage.addToCart(product.name, 1);
      CheckoutPage.applyCoupon(fixedCoupon);
      cy.wait("@validateCoupon");

      CheckoutPage.shouldShowCouponSuccess()
      CheckoutPage.shouldShowCouponMessage('Cupom aplicado: FIXED50')
      CheckoutPage.finalizePurchase();

      cy.on('window:alert', (alertText) => {
        expect(alertText).to.include('Faça login para finalizar a compra');
      });

      LoginPage.shouldShowLoginForm();
    });
  });
});