"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var common_1 = require("../fixtures/common");
describe("sign up", function () {
    it("users can sign up using email", function () {
        cy.visit(common_1.routes.login);
        cy.contains("email").click();
        cy.get(common_1.selectors.emailInput).type(uuid_1.v4() + "@email.com");
        cy.contains("Next").click();
        cy.get("#ui-sign-in-name-input").type("test user");
        cy.get("#ui-sign-in-new-password-input").type("asdf1234!"); // not my password
        cy.contains("Save").click();
        cy.getTestElement("Burger").click();
        cy.contains("Logout");
        // check persisted on reload
        cy.reload();
        cy.getTestElement(common_1.selectors.burger).click();
        cy.contains("Logout", { timeout: 20000 });
    });
});
