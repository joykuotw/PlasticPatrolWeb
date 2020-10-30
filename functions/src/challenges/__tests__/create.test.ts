import { strict as assert } from "assert";
import admin from "firebase-admin";

import {
  authenticatedCallableContext,
  firebaseTests,
  validUserId
} from "../../test/utils";

import createChallenge from "../create";

const create = firebaseTests.wrap(createChallenge);

const testChallenge = {
  name: "Test challenge",
  description: "Im a test",
  isPrivate: false,
  startTime: 1,
  endTime: 2,
  targetPieces: 100
};

const expectedChallenge = {
  name: "Test challenge",
  description: "Im a test",
  isPrivate: false,
  startTime: 1,
  endTime: 2,
  targetPieces: 100,
  ownerUserId: validUserId,
  totalPieces: 0,
  totalUserPieces: {
    [validUserId]: {
      uid: validUserId,
      pieces: 0,
      displayName: validUserId
    }
  },
  pendingPieces: 0,
  pendingUsers: []
};

// TODO: add check that user record is created + challengeIds appended
describe("create challenge", () => {
  before(() => {});

  after(() => {
    firebaseTests.cleanup();
  });

  it("should return an enriched challenge", async () => {
    try {
      const data = await create(testChallenge, authenticatedCallableContext);
      const { id, ...restOfChallenge } = data;

      assert.ok(id);
      assert.deepEqual(restOfChallenge, expectedChallenge);
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
