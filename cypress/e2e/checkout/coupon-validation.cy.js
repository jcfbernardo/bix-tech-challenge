import ProductPage from "../../support/page_objects/ProductPage";
import CheckoutPage from "../../support/page_objects/CheckoutPage";

describe("Coupon Validation Scenarios with Mocks", function () {

    beforeEach(function () {
        cy.fixture("products.json").as("products");
        cy.fixture("users.json").as("users");

        cy.get('@products').then(products => {
            cy.intercept("GET", "/api/products", {
                body: { items: products },
            }).as("getProducts");
        });

        cy.get('@users').then(users => {
            const user = users[1];
            cy.login(user.email, user.password);
        });

        ProductPage.visit();
        cy.wait("@getProducts");

        cy.get('@products').then(products => {
            const product = products.find((p) => p.name === "Keyboard");
            ProductPage.addToCart(product.name, 1);
        });
    });

    /**
     * @description CT-005: Apply a valid percentage discount coupon.
     */
    it("CT-005: should apply a valid percentage discount coupon", function () {
        const product = this.products.find((p) => p.name === "Keyboard");
        const couponCode = "WELCOME10";
        cy.intercept("POST", "/api/validate-coupon", {
            statusCode: 200,
            body: { "valid": true, "coupon": { "code": couponCode, "discount": 10, "type": "percentage" } },
        }).as("validateCoupon");

        CheckoutPage.applyCoupon(couponCode);

        cy.wait("@validateCoupon").then((interception) => {
            const discountPercentage = interception.response.body.coupon.discount;

            const discountAmount = (product.price * discountPercentage) / 100;

            const finalTotal = product.price - discountAmount;

            CheckoutPage.shouldShowCouponSuccess();
            CheckoutPage.shouldShowDiscount(discountAmount);
            CheckoutPage.shouldShowFinalTotal(finalTotal);
        });

        CheckoutPage.shouldShowCouponSuccess();
        CheckoutPage.shouldShowCouponMessage(`Cupom aplicado: ${couponCode}`);
    });

    /**
     * @description CT-006: Attempt to apply a non-existent discount coupon.
     */
    it("CT-006: should display an error for a non-existent discount coupon", function () {
        const product = this.products.find((p) => p.name === "Keyboard");
        const fakeCoupon = "DESC10";

        cy.intercept("POST", "**/api/validate-coupon", {
            statusCode: 200,
            body: { "valid": false, "message": "Invalid coupon code" },
        }).as("validateCoupon");

        CheckoutPage.applyCoupon(fakeCoupon);
        cy.wait("@validateCoupon");

        CheckoutPage.shouldShowCouponError();
        CheckoutPage.shouldShowCouponMessage("Invalid coupon code");
        CheckoutPage.shouldHideDiscountLine();
        CheckoutPage.shouldShowFinalTotal(product.price);
    });
});