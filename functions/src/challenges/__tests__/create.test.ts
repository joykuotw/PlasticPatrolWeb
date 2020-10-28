import { firebaseTests } from "../../test/utils";

import createChallenge from "../create";

const create = firebaseTests.wrap(createChallenge);
describe("create challenge", () => {
  before(() => {});

  after(() => {
    firebaseTests.cleanup();
  });

  it("should return an enriched challenge", async (done) => {
    await create({
      name: "Test challenge",
      description: "Im a test",
      isPrivate: false,
      startTime: 1,
      endTime: 2,
      targetPieces: 100
    });
  });
});
