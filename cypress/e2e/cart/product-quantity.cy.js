import ProductPage from "../../support/page_objects/ProductPage";

describe("Cart - Product Quantity Validation", function () {
  let vars = {};
  before(() => {
    cy.request("GET", "http://localhost:3001/api/products").then((response) => {
      vars.productsList = response.body.items;
    });
    cy.fixture("users.json").then((users) => {
      vars.regularUser = users[1];
    });
  });

  beforeEach(() => {
    ProductPage.visit();
    cy.login(vars.regularUser.email, vars.regularUser.password);
  });

  it("CT-001: should add a valid quantity of a product to the cart", () => {
    const products = vars.productsList;
    const product = products.find((p) => p.stock >= 3);
    const quantityToAdd = 3;
    const expectedTotal = product.price * quantityToAdd;

    ProductPage.addToCart(product.name, quantityToAdd);
    ProductPage.shouldShowCartCount(quantityToAdd);
    ProductPage.shouldShowCartTotal(expectedTotal);
  });

  it("CT-003: should prevent adding a quantity above the available stock", () => {
    const products = vars.productsList;
    const product = products.find((p) => p.stock > 0);
    const quantityAboveStock = product.stock + 1;

    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include(`Quantidade indisponível. Estoque: ${product.stock}`);
    });
 
    ProductPage.addToCart(product.name, quantityAboveStock);
    ProductPage.shouldShowCartCount(0);
  });

  it("CT-004: should prevent adding a zero quantity of a product", () => {
    const products = vars.productsList;
    const product = products[0];

    cy.contains("li", product.name).within(() => {
      cy.get("input[type=number]").clear().type("0");
      cy.get("button").should("be.disabled");
    });

    ProductPage.shouldShowCartCount(0);
  });
});
