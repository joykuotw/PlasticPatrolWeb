const config = require("../src/features/firebase/config.dev.json");
const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");
require("firebase/functions");
require("firebase/firestore");

firebase.initializeApp(config);
module.exports = {
  firebase
};
