export class CheckoutPage {
  private selectors = {
    cartCount: '#cart-count',
    cartTotal: '#cart-total',
    checkoutSection: '#checkout-section',
    couponInput: '#coupon-code',
    applyCouponButton: '#apply-coupon-btn',
    couponMessage: '#coupon-message',
    subtotal: '#subtotal',
    discountLine: '#discount-line',
    discount: '#discount',
    finalTotal: '#final-total',
    orderSummary: '#order-summary',
    checkoutButton: '#checkout-btn',
    result: '#result'
  };

  // Actions
  visit(): void {
    cy.visit('/');
    cy.get(this.selectors.checkoutSection).scrollIntoView();
  }

  /**
   * Apply coupon code
   * @param couponCode - coupon code to apply
   */
  applyCoupon(couponCode: string): void {
    cy.get(this.selectors.couponInput).clear().type(couponCode);
    cy.get(this.selectors.applyCouponButton).click();
  }

  /**
   * Click checkout/finalize purchase button
   */
  proceedToCheckout(): void {
    cy.get(this.selectors.checkoutButton).click();
  }

  /**
   * Complete the checkout process
   */
  finalizePurchase(): void {
    this.proceedToCheckout();
  }

  // Validations
  shouldShowCartCount(count: number): void {
    cy.get(this.selectors.cartCount).should('contain', count.toString());
  }

  shouldShowCartTotal(total: number): void {
    const formattedTotal = total.toFixed(2).replace('.', ',');
    cy.get(this.selectors.cartTotal).should('contain', formattedTotal);
  }

  shouldShowSubtotal(amount: number): void {
    const formattedAmount = amount.toFixed(2).replace('.', ',');
    cy.get(this.selectors.subtotal).should('contain', formattedAmount);
  }

  shouldShowCouponMessage(message: string): void {
    cy.get(this.selectors.couponMessage).should('contain', message);
  }

  shouldShowCouponSuccess(): void {
    cy.get(this.selectors.couponMessage).should('have.css', 'color', 'rgb(0, 128, 0)');
  }

  shouldShowCouponError(): void {
    cy.get(this.selectors.couponMessage).should('have.css', 'color', 'rgb(255, 0, 0)');
  }

  shouldShowDiscount(amount: number): void {
    const formattedAmount = amount.toFixed(2).replace('.', ',');
    cy.get(this.selectors.discount).should('contain', formattedAmount);
  }

  shouldShowDiscountLine(): void {
    cy.get(this.selectors.discountLine).should('be.visible');
  }

  shouldHideDiscountLine(): void {
    cy.get(this.selectors.discountLine).should('not.be.visible');
  }

  shouldShowFinalTotal(amount: number): void {
    const formattedAmount = amount.toFixed(2).replace('.', ',');
    cy.get(this.selectors.finalTotal).should('contain', formattedAmount);
  }

  shouldShowOrderResult(): void {
    cy.get(this.selectors.result).should('be.visible').and('not.be.empty');
  }

  shouldShowSuccessfulCheckout(): void {
    cy.get(this.selectors.result).should('contain', 'success');
  }

  shouldShowEmptyCart(): void {
    cy.get(this.selectors.cartCount).should('contain', '0');
    cy.get(this.selectors.cartTotal).should('contain', '0,00');
  }
}

export default new CheckoutPage();
