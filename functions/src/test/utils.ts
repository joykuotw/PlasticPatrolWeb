import testInit from "firebase-functions-test";

export const firebaseTests = testInit(
  {
    databaseURL: "https://plastic-patrol-dev-test.firebaseio.com",
    projectId: "plastic-patrol-dev-test",
    storageBucket: "plastic-patrol-dev-test.appspot.com"
  },
  "../adminCreds.test.json"
);
