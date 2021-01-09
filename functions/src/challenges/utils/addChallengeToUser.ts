import admin from "firebase-admin";

import { firestore } from "../../firestore";

export default async function addChallengeToUser(
  userId: string,
  challengeId: string
) {
  // try catch is to handle the case where a user doesn't yet have a profile
  // pre Gravatar migration
  try {
    await firestore
      .collection("users")
      .doc(userId)
      .update({
        challengeIds: admin.firestore.FieldValue.arrayUnion(challengeId)
      });
  } catch (err) {
    await firestore
      .collection("users")
      .doc(userId)
      .set({
        challengeIds: [challengeId]
      });
  }
}
