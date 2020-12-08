import { strict as assert } from "assert";

import {
  authenticatedCallableContext,
  firebaseTests,
  validUserId
} from "../../test/utils";

import leaveMission from "../leave";
import { MissionBuilder } from "./utils";

const leave = firebaseTests.wrap(leaveMission);

const builder = new MissionBuilder().withValidValues();

const expectedMission = builder.build();

const mockMission = builder
  .addUser({
    uid: validUserId,
    displayName: "test user",
    pieces: 0
  })
  .build();

// TODO: add check that user record is leaved + missionIds appended
describe("leave mission", () => {
  beforeEach(async () => {
    await firebaseTests.firestore.makeDocumentSnapshot(
      mockMission,
      "missions/test-mission-id"
    );
  });

  after(() => {
    firebaseTests.cleanup();
  });

  it("should return an enriched mission", async () => {
    try {
      const data = await leave("test-mission-id", authenticatedCallableContext);
      const { id, ...restOfMission } = data;

      assert.ok(id);
      assert.deepEqual(restOfMission, expectedMission);
    } catch (err) {
      assert.fail(err);
    }
  });

  describe("failure", () => {
    it("throws if user is not authenticated", async () => {
      try {
        await leave("test-mission-id");
      } catch (err) {
        assert.equal(err.message, "User must be authenticated");
        return;
      }

      assert.fail("Did not throw");
    });

    it("throws if no missionId is passed", async () => {
      try {
        await leave("test-mission-id");
      } catch (err) {
        assert.equal(err.message, "Missing missionId");
        return;
      }

      assert.fail("Did not throw");
    });
  });
});
