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
        "Challenge has already ended"
      );
    }

    const { isPrivate } = challenge;

    const updates = isPrivate
      ? {
          pendingUsers: admin.firestore.FieldValue.arrayUnion(currentUserId)
        }
      : {
          totalUserPieces: admin.firestore.FieldValue.arrayUnion({
            uid: currentUserId,
            pieces: 0
          })
        };

    await firestore.collection("challenges").doc(challengeId).update(updates);

    // not sure what to return here
    return {};
  }
);
