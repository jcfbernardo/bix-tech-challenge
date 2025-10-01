import LoginPage from "../../support/page_objects/LoginPage";

// Usamos function() para que o 'this' do Cypress (com os aliases) funcione
describe('CT-009: User Session State Transition with Mocks', function() {

  // O hook 'before' agora apenas carrega os dados e os salva em aliases
  before(function() {
    cy.fixture('users.json').as('users');
    cy.fixture('products.json').as('products');
  });

  // O hook 'beforeEach' prepara os MOCKS antes de cada teste
  beforeEach(function() {
    // Mock para a lista de produtos que é carregada na página inicial
    cy.intercept('GET', '/api/products', {
      body: { items: this.products } // A API real espera um objeto com a chave 'items'
    }).as('getProducts');

    // Mock para a requisição de LOGIN bem-sucedida
    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: {
        message: 'Login realizado com sucesso',
        user: this.users[1] // Usa o segundo usuário da nossa fixture
      }
    }).as('loginRequest');

    // Mock para a requisição de LOGOUT bem-sucedida
    cy.intercept('POST', '/api/logout', {
      statusCode: 200,
      body: { message: 'Logout realizado com sucesso' }
    }).as('logoutRequest');
  });


  it('Verifies the state transitions, ensuring the user interface adapts correctly', function() {
    // Acessa o usuário do alias para usar nas ações e validações
    const regularUser = this.users[1];

    LoginPage.visit();
    cy.wait('@getProducts'); // Espera a página carregar os produtos mockados

    cy.log('Checking initial state');
    LoginPage.shouldBeLoggedOut();

    cy.log('Executing the login with a valid user');
    LoginPage.login(regularUser.email, regularUser.password);
    
    // Valida que a requisição de login foi feita
    cy.wait('@loginRequest'); 
    
    cy.log('Checking logged state');
    LoginPage.shouldBeLoggedIn();
    LoginPage.shouldShowUserName(regularUser.name);

    cy.log('Executing logout');
    LoginPage.logout();

    // Valida que a requisição de logout foi feita
    cy.wait('@logoutRequest');

    cy.log('Checking final state');
    LoginPage.shouldBeLoggedOut();
  });
});