import ProductPage from "../../support/page_objects/ProductPage";
import CheckoutPage from "../../support/page_objects/CheckoutPage";

describe("Product Stock State Scenarios with Mocks", function () {

    beforeEach(function () {
        cy.setupProductsAndUsers();
        cy.loginAsRegularUser();
        ProductPage.visit();
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
        cy.modifyProductStock("Headset", 1);
        
        ProductPage.visit();
        cy.wait("@getProductsUpdated");

        cy.get('@products').then(products => {
            const headsetProduct = products.find(product => product.name === "Headset");
            const quantityToAdd = 1;
            const expectedTotal = headsetProduct.price * quantityToAdd;

            ProductPage.addToCart("Headset", quantityToAdd);
            ProductPage.shouldShowCartCount(quantityToAdd);
            ProductPage.shouldShowCartTotal(expectedTotal);

            cy.mockCheckoutSuccess(headsetProduct.price);

            CheckoutPage.finalizePurchase();
            cy.wait("@checkoutRequest");

            cy.modifyProductStock("Headset", 0);

            ProductPage.visit();
            cy.wait("@getProductsUpdated");

            ProductPage.shouldShowOutOfStock("Headset");
        });
    });
});