import * as functions from "firebase-functions";

import { Challenge } from "challenges/models";
import { firestore } from "firestore";

export default async function getChallengeIfExists(challengeId: string) {
  const challengeDoc = await firestore
    .collection("challenges")
    .doc(challengeId)
    .get();

  const challenge = challengeDoc.data();
  if (!challenge) {
    throw new functions.https.HttpsError(
      "not-found",
      "No challenge exists for id"
    );
  }

  return (challenge as unknown) as Challenge;
}
