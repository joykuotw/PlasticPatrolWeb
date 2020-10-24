import * as functions from "firebase-functions";

import admin from "firebase-admin";

import { firestore } from "../firestore";
import getChallengeIfExists from "./utils/getChallengeIfExists";
import verifyChallengeIsOngoing from "./utils/verifyChallengeIsOngoing";

type RequestData = { challengeId: string; userId: string };

export default functions.https.onCall(
  async (
    { challengeId, userId: userIdBeingApproved }: RequestData,
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

    const { ownerUserId, pendingUsers } = challenge;

    const pendingUser = pendingUsers.find(
      ({ uid }) => uid === userIdBeingApproved
    );

    if (!pendingUser) {
      throw new functions.https.HttpsError(
        "not-found",
        "pending user not found"
      );
    }

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

    const updates = {
      totalUserPieces: {
        ...challenge.totalUserPieces,
        [userIdBeingApproved]: {
          ...pendingUser,
          pieces: 0
        }
      },
      pendingUsers: pendingUsers.filter(
        ({ uid }) => uid !== userIdBeingApproved
      )
    };

    await firestore.collection("challenges").doc(challengeId).update(updates);

    // TODO: add challengeId to user (Gravatar)

    return {};
  }
);
