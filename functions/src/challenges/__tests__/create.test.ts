import { strict as assert } from "assert";
import admin from "firebase-admin";

import {
  authenticatedCallableContext,
  firebaseTests,
  validUserId
} from "../../test/utils";

import createChallenge from "../create";
import { ChallengeBuilder } from "./utils";

const create = firebaseTests.wrap(createChallenge);

const testChallenge = new ChallengeBuilder().withConfigurableValues().build();

const expectedChallenge = new ChallengeBuilder(testChallenge)
  .ownerUserId(validUserId)
  .totalPieces(0)
  .addUser({
    uid: validUserId,
    pieces: 0,
    displayName: validUserId
  })
  .pendingPieces(0)
  .pendingUsers([])
  .build();

// TODO: add check that user record is created + challengeIds appended
describe.only("create challenge", () => {
  before(() => {});

  after(() => {
    firebaseTests.cleanup();
  });

  it("should return an enriched challenge", async () => {
    try {
      const res = await create(testChallenge, authenticatedCallableContext);
      const { id, ...restOfChallenge } = res;

      assert.ok(id);
      assert.deepEqual(restOfChallenge, expectedChallenge);

      // TODO: check challenge appended to user
      const snap = await admin.firestore().doc(`users/${validUserId}`).get();

      const { data, exists } = snap;
      assert.equal(exists, true, "snapshot exists");

      console.log(data());

      // assert.equal(
      //   challengeIds.contains(id),
      //   true,
      //   "user challenges contains challengeId"
      // );
    } catch (err) {
      assert.fail(err);
    }
  });

  it("throws if user is not authenticated", async () => {
    try {
      await create(testChallenge);
    } catch (err) {
      assert.equal(err.message, "User must be authenticated");
      return;
    }

    assert.fail("Did not throw");
  });
});
