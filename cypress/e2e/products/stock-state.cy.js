import ProductPage from "../../support/page_objects/ProductPage";
import CheckoutPage from "../../support/page_objects/CheckoutPage";

describe("Product Stock State Scenarios with Mocks", function () {

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
     * @description CT-012: Validates that an already out-of-stock product is displayed as disabled.
     */
    it("CT-012: should display an out-of-stock product as disabled on initial load", function () {
        const outOfStockProduct = { id: 4, name: "Headset Pro", price: 450.0, stock: 0 };

        cy.get('@products').then(products => {
            cy.intercept("GET", "/api/products", {
                body: {
                    items: [...products, outOfStockProduct],
                },
            }).as("getProducts");
        });

        ProductPage.visit();
        cy.wait("@getProducts");

        ProductPage.shouldShowOutOfStock(outOfStockProduct.name);
    });

    /**
     * @description CT-008: Validates a product's state transition to "Out of Stock" after a purchase.
     */
    it("CT-008: should show a product as out-of-stock after its last unit is purchased", function () {
        cy.get('@products').then(products => {
            const headsetProduct = products.find(product => product.name === "Headset");
            const updatedProducts = products.map(product =>
                product.name === "Headset" ? { ...product, stock: 1 } : product
            );

            cy.intercept("GET", "/api/products", {
                statusCode: 200,
                body: { items: updatedProducts },
            }).as("getProductsInitial");

            ProductPage.visit();
            cy.wait("@getProductsInitial");

            const quantityToAdd = 1;
            const expectedTotal = headsetProduct.price * quantityToAdd;

            ProductPage.addToCart("Headset", quantityToAdd);
            ProductPage.shouldShowCartCount(quantityToAdd);
            ProductPage.shouldShowCartTotal(expectedTotal);

            cy.intercept("POST", "/api/checkout", {
                statusCode: 200,
                body: {
                    orderId: `mock-ord-${Date.now()}`,
                    discount: 0,
                    total: headsetProduct.price,
                    subtotal: headsetProduct.price,
                    appliedCoupon: null,
                },
            }).as("checkoutRequest");


            CheckoutPage.finalizePurchase();
            cy.wait("@checkoutRequest");

            const updatedProductsAfterPurchase = products.map(product =>
                product.name === "Headset" ? { ...product, stock: 0 } : product
            );

            cy.intercept("GET", "/api/products", {
                statusCode: 200,
                body: { items: updatedProductsAfterPurchase },
            }).as("getProductsUpdated");

            ProductPage.visit();
            cy.wait("@getProductsUpdated");

            ProductPage.shouldShowOutOfStock("Headset");
        });
    });
});