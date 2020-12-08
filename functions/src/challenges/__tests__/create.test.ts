import { strict as assert } from "assert";
import admin from "firebase-admin";

import {
  authenticatedCallableContext,
  firebaseTests,
  validUserId
} from "../../test/utils";

import createMission from "../create";
import { MissionBuilder } from "./utils";

const create = firebaseTests.wrap(createMission);

const testMission = new MissionBuilder().withConfigurableValues().build();

const expectedMission = new MissionBuilder(testMission)
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

// TODO: add check that user record is created + missionIds appended
describe.only("create mission", () => {
  before(() => {});

  after(() => {
    firebaseTests.cleanup();
  });

  it("should return an enriched mission", async () => {
    try {
      const res = await create(testMission, authenticatedCallableContext);
      const { id, ...restOfMission } = res;

      assert.ok(id);
      assert.deepEqual(restOfMission, expectedMission);

      // TODO: check mission appended to user
      const snap = await admin.firestore().doc(`users/${validUserId}`).get();

      const { data, exists } = snap;
      assert.equal(exists, true, "snapshot exists");

      console.log(data());

      // assert.equal(
      //   missionIds.contains(id),
      //   true,
      //   "user missions contains missionId"
      // );
    } catch (err) {
      assert.fail(err);
    }
  });

  it("throws if user is not authenticated", async () => {
    try {
      await create(testMission);
    } catch (err) {
      assert.equal(err.message, "User must be authenticated");
      return;
    }

    assert.fail("Did not throw");
  });
});
