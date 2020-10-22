import * as functions from "firebase-functions";

import admin from "firebase-admin";

import { firestore } from "../firestore";
import getChallengeIfExists from "./utils/getChallengeIfExists";
import verifyChallengeIsOngoing from "./utils/verifyChallengeIsOnGoing";

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
    const user = totalUserPieces.find(({ uid }) => uid === currentUserId);

    if (!user) {
      throw new functions.https.HttpsError(
        "unavailable",
        "User is not part of challenge"
      );
    }

    await firestore
      .collection("challenges")
      .doc(challengeId)
      .update({
        totalUserPieces: admin.firestore.FieldValue.arrayRemove(user)
      });

    return {};
  }
);
