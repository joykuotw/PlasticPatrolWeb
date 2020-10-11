"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var users_1 = require("../fixtures/users");
var common_1 = require("../fixtures/common");
function checkStaticLinks() {
    cy.contains("Clean-ups").should("have.attr", "href", "https://planetpatrol.co/clean-ups/");
    cy.contains("Terms and Conditions").should("have.attr", "href", "https://planetpatrol.co/terms-and-conditions/");
    cy.contains("Privacy Policy").should("have.attr", "href", "https://planetpatrol.co/privacy-policy/");
}
describe("sidedrawer ui (checks correct values exist)", function () {
    it("anaonymous side drawer ui", function () {
        cy.window().then(function (win) {
            win.localStorage.setItem("welcomeShown", "true");
            win.localStorage.setItem("termsAccepted", "Yes");
        });
        cy.visit(common_1.routes.home);
        cy.getTestElement(common_1.selectors.burger).click();
        checkStaticLinks();
        cy.contains("Account").should("not.exist");
        cy.contains("Photo Approval").should("not.exist");
        cy.contains("Feedback Reports").should("not.exist");
        cy.contains("Leaderboard").should("have.attr", "href", common_1.routes.leaderboard);
        cy.contains("Tutorial").should("have.attr", "href", common_1.routes.tutorial);
        cy.contains("About").should("have.attr", "href", common_1.routes.about);
        cy.contains("Feedback");
        // find the network request that does this
        cy.contains("Login", { timeout: 20000 });
        cy.contains("pieces found so far!");
        cy.getTestElement("SponsorLogo");
    });
    it("standard user side drawer ui", function () {
        cy.login(users_1.user.email, users_1.user.password);
        // bit gross - waits for fetches to finish
        //TODO: find the right request
        cy.wait(2000);
        cy.getTestElement(common_1.selectors.burger).click();
        checkStaticLinks();
        cy.contains("Account").should("have.attr", "href", common_1.routes.account);
        cy.contains("Photo Approval").should("not.exist");
        cy.contains("Feedback Reports").should("not.exist");
        cy.contains("Leaderboard").should("have.attr", "href", common_1.routes.leaderboard);
        cy.contains("Tutorial").should("have.attr", "href", common_1.routes.tutorial);
        cy.contains("About").should("have.attr", "href", common_1.routes.about);
        cy.contains("Feedback");
        cy.contains("Logout");
        cy.getTestElement("SponsorLogo");
    });
    it("moderator side drawer ui", function () {
        cy.login(users_1.moderator.email, users_1.moderator.password);
        cy.getTestElement(common_1.selectors.burger).click();
        cy.contains("Account").should("have.attr", "href", common_1.routes.account);
        cy.contains("Photo Approval", { timeout: 20000 }).should("have.attr", "href", common_1.routes.photoApproval);
        cy.contains("Feedback Reports").should("have.attr", "href", common_1.routes.feedbackReports);
        cy.contains("Leaderboard").should("have.attr", "href", common_1.routes.leaderboard);
        cy.contains("Tutorial").should("have.attr", "href", common_1.routes.tutorial);
        cy.contains("About").should("have.attr", "href", common_1.routes.about);
        cy.contains("Feedback");
        cy.contains("Logout");
        cy.getTestElement("SponsorLogo");
    });
});
