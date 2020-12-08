import { strict as assert } from "assert";
import admin from "firebase-admin";

import { authenticatedCallableContext, firebaseTests } from "../../test/utils";

import fetchMission from "../fetch";

const fetch = firebaseTests.wrap(fetchMission);

describe("fetch mission", () => {
  before(() => {});

  after(() => {
    firebaseTests.cleanup();
  });
  describe("success", () => {});

  describe("error", () => {
    it("throws if no mission id is passed", async () => {
      try {
        await fetch({}, authenticatedCallableContext);
      } catch (err) {
        assert.equal(err.message, "Missing missionId");
        return;
      }

      assert.fail("Did not throw");
    });

    it("throws if user is not authenticated", async () => {
      try {
        await fetch({ missionId: "any-string" });
      } catch (err) {
        assert.equal(err.message, "User must be authenticated");
        return;
      }

      assert.fail("Did not throw");
    });

    it("throws if no change exists", async () => {
      try {
        await fetch(
          { missionId: "not-a-real-mission" },
          authenticatedCallableContext
        );
      } catch (err) {
        assert.equal(err.message, "No mission exists for id");
        return;
      }

      assert.fail("Did not throw");
    });
  });
});
