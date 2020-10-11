"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = exports.requestUrls = exports.selectors = void 0;
exports.selectors = {
    burger: "Burger",
    emailInput: "#ui-sign-in-email-input",
    passwordInput: "#ui-sign-in-password-input",
    loginButton: "LoginButton",
    close: "Close"
};
exports.requestUrls = {
    verifyPassword: "**/verifyPassword*",
    getAccountInfo: "**/getAccountInfo*"
};
exports.routes = {
    home: "#/",
    login: "#/login",
    newPhoto: "#/photo/new",
    photoApproval: "#/moderator",
    account: "#/account",
    leaderboard: "#/leaderboard",
    tutorial: "#/tutorial",
    about: "#/about",
    feedback: "#/write-feedback",
    feedbackReports: "#/feedback-reports"
};
