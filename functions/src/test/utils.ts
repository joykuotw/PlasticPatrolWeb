import testInit from "firebase-functions-test";

export const firebaseTests = testInit(
  {
    databaseURL: "https://plastic-patrol-dev-test.firebaseio.com",
    projectId: "plastic-patrol-dev-test",
    storageBucket: "plastic-patrol-dev-test.appspot.com"
  },
  "../adminCreds.test.json"
);

// valid user in plastic-patrol-dev-test
// email: test@test.com password: 12345678a
export const validUserId = "gKK0uy46Eke61ZROXr4jrtKeFqH3";

export const authenticatedCallableContext = {
  auth: { uid: validUserId }
};
