import * as functions from "firebase-functions";

import admin from "firebase-admin";

import { firestore } from "../firestore";
import getMissionIfExists from "./utils/getMissionIfExists";
import verifyMissionIsOngoing from "./utils/verifyMissionIsOngoing";

type RequestData = { missionId: string };

export default functions.https.onCall(
  async ({ missionId }: RequestData, callableContext) => {
    if (!missionId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing missionId"
      );
    }
    const currentUserId = callableContext.auth?.uid;
    if (!currentUserId) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const mission = await getMissionIfExists(missionId);

    const missionIsOngoing = verifyMissionIsOngoing(mission);
    if (!missionIsOngoing) {
      throw new functions.https.HttpsError("unavailable", "Mission has ended");
    }

    const { totalUserPieces } = mission;
    const user = totalUserPieces[currentUserId];

    if (!user) {
      // don't see any point in throwing an error here
      // if they want to leave + aren't a member may as well return
      await firestore
        .collection("users")
        .doc(currentUserId)
        .update({
          missions: admin.firestore.FieldValue.arrayRemove(missionId)
        });

      return;
    }

    await Promise.all([
      firestore
        .collection("missions")
        .doc(missionId)
        .update({
          [`totalUserPieces.${currentUserId}`]: admin.firestore.FieldValue.delete()
        }),
      firestore
        .collection("users")
        .doc(currentUserId)
        .update({
          missions: admin.firestore.FieldValue.arrayRemove(missionId)
        })
    ]);

    return;
  }
);
