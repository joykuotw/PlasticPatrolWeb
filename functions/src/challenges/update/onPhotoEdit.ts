import * as functions from "firebase-functions";
import admin from "firebase-admin";

import getMissionIfExists from "../../missions/utils/getMissionIfExists";
import { firestore } from "../../firestore";

async function decrementPendingPieces(
  missionId: string,
  numberToDecrement: number
) {
  return await firestore
    .collection("missions")
    .doc(missionId)
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
      missions,
      pieces,
      moderated: newModerated,
      owner_id: photoUploaderId,
      published
    } = newValue;
    const { moderated: prevModerated } = previousValue;

    const hasJustBeenModerated = newModerated && !prevModerated;

    if (
      !missions ||
      missions.length === 0 ||
      Number(pieces) === 0 ||
      !hasJustBeenModerated
    ) {
      return;
    }

    await Promise.all(
      missions.map(async (missionId: string) => {
        try {
          const mission = await getMissionIfExists(missionId);

          if (published) {
            //check user is still part of mission, if they aren't we won't add to the mission total
            //but still need to decrement the pending pieces as we will have incremented it in `onPhotoUpload`
            if (!mission.totalUserPieces[photoUploaderId]) {
              await decrementPendingPieces(missionId, pieces);
              return;
            }

            await firestore
              .collection("missions")
              .doc(missionId)
              .update({
                totalPieces: admin.firestore.FieldValue.increment(pieces),
                pendingPieces: admin.firestore.FieldValue.increment(-pieces),
                [`totalUserPieces.${photoUploaderId}.pieces`]: admin.firestore.FieldValue.increment(
                  pieces
                )
              });
          } else {
            await decrementPendingPieces(missionId, pieces);
          }
        } catch (err) {
          console.error(err);
        }
      })
    );
  });
