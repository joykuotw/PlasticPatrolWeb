import { strict as assert } from "assert";

import {
  authenticatedCallableContext,
  firebaseTests,
  validUserId
} from "../../test/utils";

import leaveChallenge from "../leave";
import { ChallengeBuilder } from "./utils";

const leave = firebaseTests.wrap(leaveChallenge);

const builder = new ChallengeBuilder().withValidValues();

const expectedChallenge = builder.build();

const mockChallenge = builder
  .addUser({
    uid: validUserId,
    displayName: "test user",
    pieces: 0
  })
  .build();

// TODO: add check that user record is leaved + challengeIds appended
describe("leave challenge", () => {
  beforeEach(async () => {
    await firebaseTests.firestore.makeDocumentSnapshot(
      mockChallenge,
      "challenges/test-challenge-id"
    );
  });

  after(() => {
    firebaseTests.cleanup();
  });

  it("should return an enriched challenge", async () => {
    try {
      const data = await leave(
        "test-challenge-id",
        authenticatedCallableContext
      );
      const { id, ...restOfChallenge } = data;

      assert.ok(id);
      assert.deepEqual(restOfChallenge, expectedChallenge);
    } catch (err) {
      assert.fail(err);
    }
  });

  describe("failure", () => {
    it("throws if user is not authenticated", async () => {
      try {
        await leave("test-challenge-id");
      } catch (err) {
        assert.equal(err.message, "User must be authenticated");
        return;
      }

      assert.fail("Did not throw");
    });

    it("throws if no challengeId is passed", async () => {
      try {
        await leave("test-challenge-id");
      } catch (err) {
        assert.equal(err.message, "Missing challengeId");
        return;
      }

      assert.fail("Did not throw");
    });
  });
});
