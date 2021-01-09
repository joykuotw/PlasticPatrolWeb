import admin from "firebase-admin";

import { firestore } from "../../firestore";

export default async function addMissionToUser(
  userId: string,
  missionId: string
) {
  // try catch is to handle the case where a user doesn't yet have a profile
  // pre Gravatar migration
  try {
    await firestore
      .collection("users")
      .doc(userId)
      .update({
        missionIds: admin.firestore.FieldValue.arrayUnion(missionId)
      });
  } catch (err) {
    await firestore
      .collection("users")
      .doc(userId)
      .set({
        missionIds: [missionId]
      });
  }
}
