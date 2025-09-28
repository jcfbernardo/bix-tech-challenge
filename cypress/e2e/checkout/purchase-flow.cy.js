import ProductPage from "../../support/page_objects/ProductPage";
import CheckoutPage from "../../support/page_objects/CheckoutPage";

describe("Validate purchase flow and cart clearing", () => {
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
    cy.intercept('POST', '/api/checkout').as('checkoutRequest');
  });


  it("CT-002: should add the maximum stock quantity of a product", () => {
    const products = vars.productsList;
    const product = products.find((p) => p.stock > 0);

    const quantityToAdd = product.stock;
    const expectedTotal = product.price * quantityToAdd;

    ProductPage.addToCart(product.name, quantityToAdd);

    ProductPage.shouldShowCartCount(quantityToAdd);
    ProductPage.shouldShowCartTotal(expectedTotal);

    CheckoutPage.finalizePurchase();
    cy.wait('@checkoutRequest').then((interception) => {
    expect(interception.response.statusCode).to.eq(200);
    expect(interception.response.body).to.have.property('orderId');
    expect(interception.response.body.subtotal).to.eq(expectedTotal);
    expect(interception.response.body.discount).to.eq(0);
    expect(interception.response.body.total).to.eq(expectedTotal);
    expect(interception.response.body.appliedCoupon).to.be.null;
    });

    CheckoutPage.visit();
    ProductPage.shouldShowOutOfStock(product.name);
  });

});
