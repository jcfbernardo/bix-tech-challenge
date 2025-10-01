// import ProductPage from "../../support/page_objects/ProductPage";
// import CheckoutPage from "../../support/page_objects/CheckoutPage";
// import LoginPage from "../../support/page_objects/LoginPage";

// describe("Validate purchase flow and cart clearing", function () {

//   before(function () {
//     cy.request("GET", "/api/products").then((response) => {
//       cy.wrap(response.body.items).as("productsList");
//     });
//     cy.fixture("users.json").then((users) => {
//       cy.wrap(users[1]).as("regularUser");
//     });
//   });

//   describe("Authenticated User Flow", function () {

//     beforeEach(function () {
//       cy.login(this.regularUser.email, this.regularUser.password);
//       cy.intercept('POST', '/api/checkout').as('checkoutRequest');
//       ProductPage.visit();
//     });


//     it("CT-002: should purchase the maximum stock of a product and verify stock depletion", function () {
//       const product = this.productsList.find((p) => p.stock > 0);
//       const quantityToAdd = product.stock;
//       const expectedTotal = product.price * quantityToAdd;

//       ProductPage.addToCart(product.name, quantityToAdd);
//       ProductPage.shouldShowCartCount(quantityToAdd);
//       ProductPage.shouldShowCartTotal(expectedTotal);

//       CheckoutPage.finalizePurchase();

//       cy.wait('@checkoutRequest').then((interception) => {
//         expect(interception.response.statusCode).to.eq(200);
//         expect(interception.response.body).to.have.property('orderId');
//         expect(interception.response.body.total).to.closeTo(expectedTotal, 0.01);
//       });

//       ProductPage.visit();
//       ProductPage.shouldShowOutOfStock(product.name);
//     });

//     it("CT-007: should finalize the purchase and clear the cart", function () {
//       const product = this.productsList.find((p) => p.name === 'Mouse');

//       cy.log('--- Passo 1: Adicionar "Mouse" ao carrinho ---');
//       ProductPage.addToCart(product.name, 1);
//       ProductPage.shouldShowCartCount(1); // Garante que o item foi adicionado

//       cy.log('--- Passo 2 e 3: Ir para o checkout e finalizar a compra ---');
//       CheckoutPage.finalizePurchase();

//       cy.log('--- Resultado Esperado: Validar sucesso e limpeza do carrinho ---');
//       // Espera a requisição de checkout ser completada com sucesso
//       cy.wait('@checkoutRequest').its('response.statusCode').should('eq', 200);

//       // Valida a mensagem de sucesso na UI
//       CheckoutPage.shouldShowSuccessfulCheckout();

//       // Valida que o carrinho foi esvaziado
//       CheckoutPage.shouldShowEmptyCart();
//     });
//   });

//   describe("Unauthenticated User Flow", function () {

//     it("CT-011: should redirect to login when attempting to finalize a purchase", function () {
//       const product = this.productsList.find((p) => p.name === 'Mouse');
//       const fixedCoupon = 'FIXED50'; // Cupom de valor fixo

//       ProductPage.visit();

//       cy.log('--- Passo 1: Adicionar "Mouse" ao carrinho ---');
//       ProductPage.addToCart(product.name, 1);

//       cy.log('--- Passo 2: Aplicar o cupom de desconto ---');
//       CheckoutPage.applyCoupon(fixedCoupon);
//       // Podemos validar se o cupom foi aceito visualmente antes de prosseguir
//       CheckoutPage.shouldShowCouponMessage('Cupom aplicado com sucesso!');

//       cy.log('--- Passo 3: Tentar finalizar a compra ---');
//       CheckoutPage.finalizePurchase();

//       cy.log('--- Resultado Esperado: Redirecionamento para a página de login ---');
//       // Valida se a URL mudou para a página de login
//       cy.url().should('include', '/login');
//       // Valida se o formulário de login está visível, confirmando a página
//       LoginPage.shouldShowLoginForm();
//     });
//   });
// });
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

      // Mock da requisição de checkout para forçar uma resposta de sucesso
      // cy.intercept("POST", "/api/checkout", {
      //   statusCode: 200,
      //   body: {
      //     orderId: `ORD-${Date.now()}`,
      //     message: "Pedido realizado com sucesso!",
      //   },
      // }).as("checkoutRequest");

      const user = this.users[1];
      cy.login(user.email, user.password);
      ProductPage.visit();
    });

    it.only("CT-002: should purchase the maximum stock and validate the specific checkout response", function () {
      const product = this.products.find((p) => p.stock > 0);
      const quantityToAdd = product.stock;
      const expectedTotal = product.price * quantityToAdd;

      cy.intercept("POST", "/api/checkout", {
        statusCode: 200,
        body: {
          orderId: `mock-ord-${Date.now()}`,
          discount: 0,
          total: expectedTotal,
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

      // Validação final da UI
      // CheckoutPage.shouldShowSuccessfulCheckout();
      // CheckoutPage.shouldShowEmptyCart();
    });

    it("CT-007: should finalize the purchase and clear the cart", function () {
      const product = this.products.find((p) => p.name === "Mouse");

      ProductPage.addToCart(product.name, 1);
      ProductPage.shouldShowCartCount(1);

      CheckoutPage.finalizePurchase();

      cy.wait("@checkoutRequest")
        .its("response.statusCode")
        .should("eq", 200);

      CheckoutPage.shouldShowSuccessfulCheckout();
      CheckoutPage.shouldShowEmptyCart();
    });
  });

  describe("Unauthenticated User Flow", function () {
    beforeEach(function () {
      cy.intercept("GET", "/api/products", {
        body: { items: this.products },
      }).as("getProducts");

      cy.intercept("POST", "/api/coupon/validate", {
        statusCode: 200,
        body: { valid: true, message: "Cupom aplicado com sucesso!" },
      }).as("validateCoupon");
    });

    it("CT-011: should redirect to login when attempting to finalize a purchase", function () {
      const product = this.products.find((p) => p.name === "Mouse");
      const fixedCoupon = "FIXED50";

      ProductPage.visit();
      ProductPage.addToCart(product.name, 1);
      CheckoutPage.applyCoupon(fixedCoupon);
      cy.wait("@validateCoupon");

      CheckoutPage.finalizePurchase();

      cy.url().should("include", "/login");
      LoginPage.shouldShowLoginForm();
    });
  });
});