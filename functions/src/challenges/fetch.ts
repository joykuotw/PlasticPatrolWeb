import * as functions from "firebase-functions";

import getChallengeIfExists from "./utils/getChallengeIfExists";

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

    const { isPrivate, totalUserPieces } = challenge;

    const isInChallenge = !!Boolean(totalUserPieces[currentUserId]);

    if (isPrivate && !isInChallenge) {
      const { totalUserPieces, ...safeChallenge } = challenge;
      return safeChallenge;
    }

    return challenge;
  }
);
