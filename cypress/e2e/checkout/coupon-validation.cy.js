import ProductPage from "../../support/page_objects/ProductPage";
import CheckoutPage from "../../support/page_objects/CheckoutPage";

describe("Coupon Validation Scenarios with Mocks", function () {

    beforeEach(function () {
        cy.setupCartTest("Keyboard");
    });

    /**
     * @description CT-005: Apply a valid percentage discount coupon.
     */
    it("CT-005: should apply a valid percentage discount coupon", function () {
        const product = this.products.find((p) => p.name === "Keyboard");
        const couponCode = "WELCOME10";
        
        cy.mockCouponValidation(couponCode, 10, true);

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

        cy.mockCouponValidation(fakeCoupon, 0, false);

        CheckoutPage.applyCoupon(fakeCoupon);
        cy.wait("@validateCoupon");

        CheckoutPage.shouldShowCouponError();
        CheckoutPage.shouldShowCouponMessage("Invalid coupon code");
        CheckoutPage.shouldHideDiscountLine();
        CheckoutPage.shouldShowFinalTotal(product.price);
    });

    /**
     * @description CT-013: Attempt to apply an expired discount coupon.
     */
    it("CT-013: should display an error for an expired discount coupon", function () {
        const product = this.products.find((p) => p.name === "Keyboard");
        const expiredCoupon = "EXPIRED";

        cy.mockCouponValidation(expiredCoupon, 0, false);

        CheckoutPage.applyCoupon(expiredCoupon);
        cy.wait("@validateCoupon");

        CheckoutPage.shouldShowCouponError();
        CheckoutPage.shouldShowCouponMessage("Coupon is expired");
        CheckoutPage.shouldHideDiscountLine();
        CheckoutPage.shouldShowFinalTotal(product.price);
    });
});