"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var users_1 = require("../fixtures/users");
var common_1 = require("../fixtures/common");
describe("sign in", function () {
    beforeEach(function () {
        cy.server();
        cy.route({ url: common_1.requestUrls.verifyPassword, method: "POST" }).as("POST/verifyPassword");
        cy.route({ url: common_1.requestUrls.getAccountInfo, method: "POST" }).as("POST/getAccount");
    });
    it("users can sign in and login state is persisted", function () {
        cy.visit(common_1.routes.login);
        cy.contains("email").click();
        cy.contains("Next").click();
        cy.get(common_1.selectors.emailInput).type(users_1.user.email);
        cy.contains("Next").click();
        cy.get(common_1.selectors.passwordInput).type(users_1.user.password);
        cy.contains("Sign In").click();
        cy.wait("@POST/verifyPassword");
        cy.wait("@POST/getAccount");
        cy.visit(common_1.routes.home);
        cy.getTestElement("Burger").click();
        cy.contains("Logout");
        // check persisted on reload
        cy.reload();
        cy.getTestElement(common_1.selectors.burger).click();
        cy.contains("Logout", { timeout: 20000 });
    });
    it("users that login via the upload photo button are redirected to the new login page", function () {
        cy.visit(common_1.routes.home);
        cy.contains("Record").click();
        cy.containsTestElement(common_1.selectors.loginButton, "Login").click();
        cy.contains("email").click();
        cy.contains("Next").click();
        cy.get(common_1.selectors.emailInput).type(users_1.user.email);
        cy.contains("Next").click();
        cy.get(common_1.selectors.passwordInput).type(users_1.user.password);
        cy.contains("Sign In").click();
        cy.wait("@POST/verifyPassword");
        cy.wait("@POST/getAccount");
        cy.url().should("contain", common_1.routes.newPhoto);
    });
});
