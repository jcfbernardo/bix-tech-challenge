/// <reference types="cypress" />
import LoginPage from "./page_objects/LoginPage";
import ProductPage from "./page_objects/ProductPage";

Cypress.Commands.add("login", (email, password) => {
  LoginPage.visit();
  LoginPage.fillEmail(email);
  LoginPage.fillPassword(password);
  LoginPage.clickLogin();
});

Cypress.Commands.add('addProductToCart', (productName: string, quantity: number = 1) => {
    cy.log(`Adicionando ${quantity} unidade(s) de '${productName}' ao carrinho.`);
    ProductPage.visit();
    ProductPage.addToCart(productName, quantity)
});
