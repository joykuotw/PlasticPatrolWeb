import * as functions from "firebase-functions";
import admin from "firebase-admin";

import getChallengeIfExists from "../../challenges/utils/getChallengeIfExists";
import { firestore } from "../../firestore";

async function decrementPendingPieces(
  challengeId: string,
  numberToDecrement: number
) {
  return await firestore
    .collection("challenges")
    .doc(challengeId)
    .update({
      pendingPieces: admin.firestore.FieldValue.increment(-numberToDecrement)
    });
}

export default functions.firestore
  .document("photos/{photoId}")
  .onUpdate(async (change) => {
    const newValue = change.after.data();

    const previousValue = change.before.data();

    if (!newValue || !previousValue) {
      return;
    }

    const {
      challenges,
      pieces,
      moderated: newModerated,
      owner_id: photoUploaderId,
      published
    } = newValue;
    const { moderated: prevModerated } = previousValue;

    const hasJustBeenModerated = newModerated && !prevModerated;

    if (
      !challenges ||
      challenges.length === 0 ||
      Number(pieces) === 0 ||
      !hasJustBeenModerated
    ) {
      return;
    }

    await Promise.all(
      challenges.map(async (challengeId: string) => {
        try {
          const challenge = await getChallengeIfExists(challengeId);

          if (published) {
            //check user is still part of challenge, if they aren't we won't add to the challenge total
            //but still need to decrement the pending pieces as we will have incremented it in `onPhotoUpload`
            if (!challenge.totalUserPieces[photoUploaderId]) {
              await decrementPendingPieces(challengeId, pieces);
              return;
            }

            await firestore
              .collection("challenges")
              .doc(challengeId)
              .update({
                totalPieces: admin.firestore.FieldValue.increment(pieces),
                pendingPieces: admin.firestore.FieldValue.increment(-pieces),
                [`totalUserPieces.${photoUploaderId}.pieces`]: admin.firestore.FieldValue.increment(
                  pieces
                )
              });
          } else {
            await decrementPendingPieces(challengeId, pieces);
          }
        } catch (err) {
          console.error(err);
        }
      })
    );
  });
