"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var users_1 = require("../fixtures/users");
var common_1 = require("../fixtures/common");
describe("routes", function () {
    it("checks that every route renders without instantly throwing an error", function () {
        cy.login(users_1.moderator.email, users_1.moderator.password);
        cy.visit(common_1.routes.account);
        cy.contains("Account");
        cy.visit(common_1.routes.leaderboard);
        cy.contains("Leaderboard");
        cy.visit(common_1.routes.tutorial);
        cy.contains("Tutorial");
        cy.visit(common_1.routes.about);
        cy.contains("About");
        cy.visit(common_1.routes.feedback);
        cy.contains("Feedback");
        cy.visit(common_1.routes.photoApproval);
        cy.contains("Photo Approval");
        cy.visit(common_1.routes.feedbackReports);
        cy.contains("Feedback");
        cy.visit(common_1.routes.newPhoto);
        cy.contains("Record your litter");
    });
});
