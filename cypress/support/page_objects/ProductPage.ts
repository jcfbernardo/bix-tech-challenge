export class ProductPage {
  private selectors = {
    productList: '#product-list',
    productItem: '#product-list li',
    cartCount: '#cart-count',
    cartTotal: '#cart-total'
  };

  // Actions
  visit(): void {
    cy.visit('/');
  }

  /**
   * Add product to cart by product name
   * @param productName - name of the product to add
   * @param quantity - quantity to add (optional, defaults to 1)
   */
  addToCart(productName: string, quantity: number = 1): void {
    cy.get(this.selectors.productItem)
      .contains('strong', productName)
      .parent()
      .parent()
      .within(() => {
        // Set quantity if different from 1
        if (quantity !== 1) {
          cy.get('input[type="number"]').clear().type(quantity.toString());
        }
        // Click add button
        cy.get('button').should('not.be.disabled').click();
      });
  }

  /**
   * Set product quantity by product ID
   * @param productId - ID of the product
   * @param quantity - quantity to set
   */
  setProductQuantity(productId: number, quantity: number): void {
    cy.get(`#qty-${productId}`).clear().type(quantity.toString());
  }

  /**
   * Get product quantity input by product ID
   * @param productId - ID of the product
   */
  getProductQuantityInput(productId: number) {
    return cy.get(`#qty-${productId}`);
  }

  /**
   * Click add to cart button by product ID
   * @param productId - ID of the product
   */
  clickAddToCartButton(productId: number): void {
    cy.get(`button[data-id="${productId}"]`).click();
  }

  // Validations
  shouldShowProduct(productName: string): void {
    cy.get(this.selectors.productItem)
      .contains('strong', productName)
      .should('be.visible');
  }

  shouldShowProductPrice(productName: string, price: number): void {
    const formattedPrice = price.toFixed(2).replace('.', ',');
    cy.get(this.selectors.productItem)
      .contains('strong', productName)
      .parent()
      .should('contain', `R$ ${formattedPrice}`);
  }

  shouldShowProductStock(productName: string, stock: number): void {
    cy.get(this.selectors.productItem)
      .contains('strong', productName)
      .parent()
      .should('contain', `Estoque: ${stock}`);
  }

  shouldShowOutOfStock(productName: string): void {
    cy.get(this.selectors.productItem)
      .contains('strong', productName)
      .parent()
      .parent()
      .find('button')
      .should('contain', 'Sem estoque')
      .and('be.disabled');
  }

  shouldShowCartCount(count: number): void {
    cy.get(this.selectors.cartCount).invoke('text').then((text) => {
      assert.strictEqual(parseInt(text), count);
    });
  }

  shouldShowCartTotal(total: number): void {
    const formattedTotal = total.toFixed(2).replace('.', ',');
    cy.get(this.selectors.cartTotal).invoke('text').then((text) => {
      assert.strictEqual(text, formattedTotal);
    });
  }

  shouldDisableAddButton(productId: number): void {
    cy.get(`button[data-id="${productId}"]`).should('be.disabled');
  }

  shouldEnableAddButton(productId: number): void {
    cy.get(`button[data-id="${productId}"]`).should('not.be.disabled');
  }
}

export default new ProductPage();
