/// <reference types="cypress" />
import LoginPage from "./page_objects/LoginPage";
import ProductPage from "./page_objects/ProductPage";

Cypress.Commands.add("login", (email, password) => {
  LoginPage.visit();
  LoginPage.fillEmail(email);
  LoginPage.fillPassword(password);
  LoginPage.clickLogin();
});

Cypress.Commands.add('addProductToCart', (productName: string, quantity: number = 1) => {
  cy.log(`Adicionando ${quantity} unidade(s) de '${productName}' ao carrinho.`);
  ProductPage.visit();
  ProductPage.addToCart(productName, quantity)
});

Cypress.Commands.add('setupProductsAndUsers', (productModifications?: any[]) => {
  cy.fixture("products.json").as('products');
  cy.fixture("users.json").as('users');

  cy.get('@products').then((products: any) => {
    let finalProducts = products;

    if (productModifications) {
      finalProducts = productModifications;
    }

    cy.intercept("GET", "/api/products", {
      body: { items: finalProducts },
    }).as("getProducts");
  });
});

Cypress.Commands.add('loginAsRegularUser', () => {
  cy.get('@users').then((users: any) => {
    const user = users[1];
    cy.login(user.email, user.password);
  });
});

Cypress.Commands.add('mockCheckoutSuccess', (total?: number, orderId?: string) => {
  cy.intercept("POST", "/api/checkout", {
    statusCode: 200,
    body: {
      orderId: orderId || `mock-ord-${Date.now()}`,
      discount: 0,
      total: total || 100,
      subtotal: total || 100,
      appliedCoupon: null,
    },
  }).as("checkoutRequest");
});

Cypress.Commands.add('mockCouponValidation', (couponCode: string, discount: number, isValid: boolean = true) => {
  const responseBody = isValid
    ? { valid: true, coupon: { code: couponCode, discount, type: "percentage" } }
    : { valid: false, message: couponCode === "EXPIRED" ? "Coupon is expired" : "Invalid coupon code" };

  cy.intercept("POST", "**/api/validate-coupon", {
    statusCode: 200,
    body: responseBody,
  }).as("validateCoupon");
});

Cypress.Commands.add('setupCartTest', (productName: string = "Keyboard") => {
  cy.setupProductsAndUsers();
  cy.loginAsRegularUser();
  ProductPage.visit();
  cy.wait('@getProducts');

  cy.get('@products').then((products: any) => {
    const product = products.find((p: any) => p.name === productName);
    ProductPage.addToCart(product.name, 1);
  });
});

Cypress.Commands.add('modifyProductStock', (productName: string, newStock: number) => {
  cy.get('@products').then((products: any) => {
    const updatedProducts = products.map((product: any) =>
      product.name === productName ? { ...product, stock: newStock } : product
    );

    cy.intercept("GET", "/api/products", {
      statusCode: 200,
      body: { items: updatedProducts },
    }).as("getProductsUpdated");
  });
});
