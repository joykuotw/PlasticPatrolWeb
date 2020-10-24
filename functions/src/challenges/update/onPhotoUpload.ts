import * as functions from "firebase-functions";
import admin from "firebase-admin";

import getChallengeIfExists from "challenges/utils/getChallengeIfExists";
import verifyChallengeIsOngoing from "challenges/utils/verifyChallengeIsOngoing";
import { firestore } from "../../firestore";

export default functions.firestore
  .document("photos/{photoId}")
  .onCreate(async (snapshot, context) => {
    const photo = snapshot.data();

    if (!photo) {
      return;
    }

    const { challenges, pieces } = photo;

    if (!challenges || challenges.length === 0 || pieces === 0) {
      return;
    }

    await Promise.all(
      challenges.map(async (challengeId: string) => {
        try {
          const challenge = await getChallengeIfExists(challengeId);
          if (!verifyChallengeIsOngoing(challenge)) {
            return;
          }

          await firestore
            .collection(challenges)
            .doc(challengeId)
            .update({
              pendingPieces: admin.firestore.FieldValue.increment(pieces)
            });
        } catch (err) {
          console.info("Error updating challenge with pieces");
        }
      })
    );
  });
