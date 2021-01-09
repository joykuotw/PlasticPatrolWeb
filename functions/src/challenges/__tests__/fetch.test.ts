import { strict as assert } from "assert";
import admin from "firebase-admin";

import { authenticatedCallableContext, firebaseTests } from "../../test/utils";

import fetchChallenge from "../fetch";

const fetch = firebaseTests.wrap(fetchChallenge);

describe("fetch challenge", () => {
  before(() => {});

  after(() => {
    firebaseTests.cleanup();
  });
  describe("success", () => {});

  describe("error", () => {
    it("throws if no challenge id is passed", async () => {
      try {
        await fetch({}, authenticatedCallableContext);
      } catch (err) {
        assert.equal(err.message, "Missing challengeId");
        return;
      }

      assert.fail("Did not throw");
    });

    it("throws if user is not authenticated", async () => {
      try {
        await fetch({ challengeId: "any-string" });
      } catch (err) {
        assert.equal(err.message, "User must be authenticated");
        return;
      }

      assert.fail("Did not throw");
    });

    it("throws if no change exists", async () => {
      try {
        await fetch(
          { challengeId: "not-a-real-challenge" },
          authenticatedCallableContext
        );
      } catch (err) {
        assert.equal(err.message, "No challenge exists for id");
        return;
      }

      assert.fail("Did not throw");
    });
  });
});
