import * as functions from "firebase-functions";

import admin from "firebase-admin";

import { firestore } from "../firestore";
import getChallengeIfExists from "./utils/getChallengeIfExists";
import verifyChallengeIsOngoing from "./utils/verifyChallengeIsOngoing";

type RequestData = { challengeId: string };

export default functions.https.onCall(
  async ({ challengeId }: RequestData, callableContext) => {
    if (!challengeId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing challengeId"
      );
    }
    const currentUserId = callableContext.auth?.uid;
    if (!currentUserId) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const challenge = await getChallengeIfExists(challengeId);

    const challengeIsOngoing = verifyChallengeIsOngoing(challenge);
    if (!challengeIsOngoing) {
      throw new functions.https.HttpsError(
        "unavailable",
        "Challenge has ended"
      );
    }

    const { totalUserPieces } = challenge;
    const user = totalUserPieces[currentUserId];

    if (!user) {
      // don't see any point in throwing an error here
      // if they want to leave + aren't a member may as well return
      // TODO: try to remove challengeId from user (Gravatar)

      return;
    }

    await firestore
      .collection("challenges")
      .doc(challengeId)
      .update({
        [`totalUserPieces.${currentUserId}`]: admin.firestore.FieldValue.delete()
      });

    // TODO: remove challengeId from user (Gravatar)

    return;
  }
);
