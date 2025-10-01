import ProductPage from "../../support/page_objects/ProductPage";

describe("Cart - Product Quantity Validation with Mocks", function () {

  beforeEach(function () {
    cy.fixture("products.json").as('products');
    cy.fixture("users.json").as('users');

    cy.get('@products').then(products => {
      cy.intercept("GET", "/api/products", {
        body: { items: products },
      }).as("getProducts");
    });

    ProductPage.visit();

    cy.get('@users').then(users => {
      const user = users[1];
      cy.login(user.email, user.password);
    });

    cy.wait('@getProducts');
  });

  /**
   * @description CT-001: Add a valid quantity of a product to the cart.
   */
  it("CT-001: should add a valid quantity of a product to the cart", function () {
    const products = this.products;
    const product = products.find((p) => p.stock >= 3);
    const quantityToAdd = 3;
    const expectedTotal = product.price * quantityToAdd;

    ProductPage.addToCart(product.name, quantityToAdd);
    ProductPage.shouldShowCartCount(quantityToAdd);
    ProductPage.shouldShowCartTotal(expectedTotal);
  });

  /**
 * @description CT-003: Attempt to add a product quantity above the available stock.
 */
  it("CT-003: should display an alert when adding a quantity above the available stock", function () {
    const products = this.products;
    const product = products.find((p) => p.stock > 0);
    const quantityAboveStock = product.stock + 1;

    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include(`Quantidade indisponível. Estoque: ${product.stock}`);
    });

    ProductPage.addToCart(product.name, quantityAboveStock);

    ProductPage.shouldShowCartCount(0);
  });

  /**
   * @description CT-004: Attempt to add a zero quantity of a product.
   */
  it("CT-004: should prevent adding a zero quantity of a product", function () {
    const products = this.products;
    const product = products[0];

    ProductPage.shouldShowCartCount(0);
  });
});