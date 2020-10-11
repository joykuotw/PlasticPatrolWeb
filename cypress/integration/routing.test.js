"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var users_1 = require("../fixtures/users");
var common_1 = require("../fixtures/common");
describe("routing", function () {
    it("if a user goes to the tutorial page from the new photo page they are redirected back to the new photo page", function () {
        cy.login(users_1.user.email, users_1.user.password);
        cy.visit(common_1.routes.newPhoto);
        cy.log("testing routing from close button");
        cy.contains("tutorial").click();
        cy.url().should("include", common_1.routes.tutorial);
        cy.getTestElement(common_1.selectors.close).click();
        cy.url().should("include", common_1.routes.newPhoto);
        cy.log("testing routing from get started button");
        cy.contains("tutorial").click();
        cy.getTestElement("NavDot-3").click();
        cy.contains("Get started").click();
        cy.url().should("include", common_1.routes.newPhoto);
    });
});
