import { strict as assert } from "assert";
import admin from "firebase-admin";

import { firebaseTests } from "../../test/utils";

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
  ownerUserId: "gKK0uy46Eke61ZROXr4jrtKeFqH3",
  totalPieces: 0,
  totalUserPieces: {
    gKK0uy46Eke61ZROXr4jrtKeFqH3: {
      uid: "gKK0uy46Eke61ZROXr4jrtKeFqH3",
      pieces: 0,
      displayName: "gKK0uy46Eke61ZROXr4jrtKeFqH3"
    }
  },
  pendingPieces: 0,
  pendingUsers: []
};
describe("create challenge", () => {
  before(() => {});

  after(() => {
    firebaseTests.cleanup();
  });

  it("should return an enriched challenge", async () => {
    const context = {
      auth: { uid: "gKK0uy46Eke61ZROXr4jrtKeFqH3" }
    };
    try {
      const data = await create(testChallenge, context);
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
