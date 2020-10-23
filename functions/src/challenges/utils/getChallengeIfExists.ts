import * as functions from "firebase-functions";

import { Challenge } from "challenges/models";
import { firestore } from "firestore";

export default async function getChallengeIfExists(
  challengeId: string
): Promise<Challenge> {
  const snapshot = await firestore
    .collection("challenges")
    .doc(challengeId)
    .get();

  const { exists, data } = snapshot;
  if (!exists) {
    throw new functions.https.HttpsError(
      "not-found",
      "No challenge exists for id"
    );
  }

  return data() as Challenge;
}
