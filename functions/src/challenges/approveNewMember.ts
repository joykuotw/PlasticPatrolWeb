import * as functions from "firebase-functions";

import admin from "firebase-admin";

import { firestore } from "../firestore";
import getChallengeIfExists from "./utils/getChallengeIfExists";
import verifyChallengeIsOngoing from "./utils/verifyChallengeIsOngoing";

type RequestData = { challengeId: string; userIdBeingApproved: string };

export default functions.https.onCall(
  async (
    { challengeId, userIdBeingApproved }: RequestData,
    callableContext
  ) => {
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

    const { ownerUserId } = challenge;

    if (ownerUserId !== currentUserId) {
      const userDoc = await firestore
        .collection("users")
        .doc(currentUserId)
        .get();
      const isModerator = userDoc.data()?.isModerator;

      if (!isModerator) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "permission-denied"
        );
      }
    }

    const challengeIsOngoing = verifyChallengeIsOngoing(challenge);
    if (!challengeIsOngoing) {
      throw new functions.https.HttpsError(
        "unavailable",
        "Challenge has ended"
      );
    }

    await firestore
      .collection("challenges")
      .doc(challengeId)
      .update({
        pendingUsers: admin.firestore.FieldValue.arrayRemove(
          userIdBeingApproved
        ),
        totalUserPieces: admin.firestore.FieldValue.arrayUnion({
          uid: userIdBeingApproved,
          pieces: 0
        })
      });

    // TODO: add challengeId to user (Gravatar)

    return {};
  }
);
