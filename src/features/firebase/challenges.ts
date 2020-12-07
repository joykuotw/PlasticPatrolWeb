import firebase from "firebase/app";
import {
  Challenge,
  ChallengeFirestoreData,
  ChallengeId,
  ConfigurableChallengeData,
  coverPhotoIsMetaData,
  userIsInChallenge
} from "../../types/Challenges";
import Photo from "../../types/Photo";
import User from "../../types/User";
import _ from "lodash";

const CHALLENGE_FIRESTORE_COLLECTION = "challenges";
const CHALLENGE_PHOTO_STORAGE = "challenges";
const CHALLENGE_PHOTO_FILENAME = "original.jpg";

export const getChallengeCoverPhotoUrl = async (
  challengeId: string
): Promise<string | undefined> => {
  const storageRef = firebase.storage().ref();

  let coverPhotoUrl;
  try {
    coverPhotoUrl = await storageRef
      .child(
        `${CHALLENGE_PHOTO_STORAGE}/${challengeId}/${CHALLENGE_PHOTO_FILENAME}`
      )
      .getDownloadURL();
  } catch (err) {
    if (err.code === "storage/object-not-found") {
      console.log(
        `Failed to download challenge ${challengeId} cover photo. User probably didn't upload, we display a default.`
      );
    } else {
      console.error(
        `Failed to download challenge ${challengeId} cover photo for unexpected reason.`
      );
    }
    return undefined;
  }

  return coverPhotoUrl;
};

const getChallengeRefFromId = async (challengeId: string) => {
  return firebase
    .firestore()
    .collection(CHALLENGE_FIRESTORE_COLLECTION)
    .doc(challengeId);
};

export const createChallenge = async (
  user: User,
  challenge: ConfigurableChallengeData
) => {
  const ownerUserId = user.id;

  console.log(`Create challenge called by user ${ownerUserId}`);
  console.log(challenge);

  const challengeToPersist: Omit<ChallengeFirestoreData, "id"> = {
    ..._.omit(challenge, "coverPhoto"),
    ownerUserId,
    totalPieces: 0,
    totalUserPieces: {
      [ownerUserId]: {
        uid: ownerUserId,
        pieces: 0,
        displayName: user.displayName
      }
    },
    pendingPieces: 0,
    pendingUsers: [],
    hidden: false
  };

  const { id } = await firebase
    .firestore()
    .collection(CHALLENGE_FIRESTORE_COLLECTION)
    .add(challengeToPersist);

  await addChallengeToUser(ownerUserId, id);

  if (
    challenge.coverPhoto === undefined ||
    !coverPhotoIsMetaData(challenge.coverPhoto)
  ) {
    console.log(`No cover photo uploaded for challenge, skipping upload.`);
    return;
  }

  console.log(`Uploading cover photo for challenge ${id}`);
  const coverPhotoStorageRef = await firebase
    .storage()
    .ref()
    .child(CHALLENGE_PHOTO_STORAGE)
    .child(id)
    .child(CHALLENGE_PHOTO_FILENAME);

  console.log("coverPhotoStorageRef");
  console.log(coverPhotoStorageRef);

  const base64Image = challenge.coverPhoto.imgSrc.split(",")[1];
  await coverPhotoStorageRef.putString(base64Image, "base64", {
    contentType: "image/jpeg"
  });
};

export async function fetchAllChallenges(): Promise<ChallengeFirestoreData[]> {
  const snapshot = await firebase
    .firestore()
    .collection(CHALLENGE_FIRESTORE_COLLECTION)
    // .where("isPrivate", "==", false)
    .get();

  if (snapshot.empty) {
    console.log(` - snapshot empty`);
    return [];
  }

  const challenges = snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id
  })) as ChallengeFirestoreData[];

  return challenges;
}

export const fetchChallengePhoto = async (challengeId: string) => {};

// Edit challenge with pending user
export const joinChallenge = async (challengeId: ChallengeId, user?: User) => {
  console.log(`User ${user?.id} trying to join challenge ${challengeId}`);

  if (user === undefined) {
    console.error(
      `Couldn't join challenge because local firebase user was undefined.`
    );
    return;
  }

  const challenge = await getChallengeIfExists(challengeId);
  if (challengeHasEnded(challenge)) {
    console.error(
      `User ${user.id} tried to join finished challenge ${challenge.id}`
    );
    return;
  }

  if (challenge.isPrivate) {
    await addToPendingChallengeUsers(challenge, user);
    return;
  }

  await addUserToChallenge(challenge, user);
};

export const addToPendingChallengeUsers = async (
  challenge: ChallengeFirestoreData,
  user: User
) => {
  const challengeRef = await getChallengeRefFromId(challenge.id);
  await challengeRef.set(
    {
      pendingUsers: [
        {
          uid: user.id,
          displayName: user.displayName,
          email: user.email
        }
      ]
    },
    { merge: true }
  );
};

export const addUserToChallenge = async (
  challenge: ChallengeFirestoreData,
  user: User
) => {
  // If the user left and rejoined the challenge, they'll already have a piece count,
  // so we don't need to add a new one.
  if (!userIsInChallenge(challenge, user.id)) {
    const challengeRef = await getChallengeRefFromId(challenge.id);
    await challengeRef.set(
      {
        totalUserPieces: {
          [user.id]: {
            uid: user.id,
            displayName: user.displayName,
            pieces: 0
          }
        }
      },
      { merge: true }
    );
  }

  await addChallengeToUser(user.id, challenge.id);
};

// Edit user to remove challengeId
export const leaveChallenge = async (challengeId: ChallengeId, user?: User) => {
  const challenge = await getChallengeIfExists(challengeId);

  if (user === undefined) {
    console.error(
      `Couldn't leave challenge because local firebase user ${user} was undefined`
    );
    return;
  }

  if (challengeHasEnded(challenge)) {
    console.log(`User not leaving challenge because the challenge was empty.`);
    return;
  }

  console.log(`User ${user.id} leaving challenge ${challengeId}`);

  // We remove the user from seeing the challenge, and preventing their future uploads contributing.
  // We still leave them in the challenge though.
  await firebase
    .firestore()
    .collection("users")
    .doc(user.id)
    .update({
      challenges: firebase.firestore.FieldValue.arrayRemove(challengeId)
    });
};

// Edit challenge to remove user from pending users and add user count (if not present).
// Edit user to add challengeId.
export const approveNewMember = async (
  challengeId: ChallengeId,
  uid: string
) => {
  await firebase.functions().httpsCallable("approveNewMemberChallenge")({
    challengeId,
    uid
  });
};

// Edit challenge to remove user from pending users.
export const rejectNewMember = async (
  uid: string,
  challengeId: ChallengeId
) => {
  await firebase.functions().httpsCallable("rejectNewMemberChallenge")({
    challengeId,
    uid
  });
};

// Edit challenge configurable data
export const editChallenge = (
  challengeId: ChallengeId,
  challenge: ConfigurableChallengeData
) => {};

// Delete challenge (maybe just mark as hidden to avoid accidents).
export const deleteChallenge = async (challengeId: ChallengeId) => {
  const challengeRef = await getChallengeRefFromId(challengeId);
  try {
    await challengeRef.set({
      hidden: true
    });
  } catch (err) {
    console.error(`Failed to set challenge ${challengeId} as hidden. ${err}`);
  }
};

const addChallengeToUser = async (userId: string, challengeId: string) => {
  console.log(`Updating user ${userId} with challenge ${challengeId}`);

  // try catch is to handle the case where a user doesn't yet have a profile
  // pre Gravatar migration
  try {
    await firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .set(
        {
          challengeIds: [challengeId]
        },
        { merge: true }
      );
  } catch (err) {
    console.error(`Failed to add challenge ID to user data: ${err}`);
  }
};

const getChallengeIfExists = async (
  challengeId: string
): Promise<ChallengeFirestoreData> => {
  let snapshot;
  try {
    const challengeRef = await getChallengeRefFromId(challengeId);
    snapshot = await challengeRef.get();
  } catch (err) {
    throw new Error(`Failed to get challenge by challenge ID: ${err}`);
  }

  console.log(`Get challenge if exists: ${challengeId}.`);

  if (!snapshot.exists) {
    throw new Error("No challenge exists for id");
  }

  return snapshot.data() as ChallengeFirestoreData;
};

export const challengeHasEnded = (challenge: Challenge) => {
  const { endTime } = challenge;
  const currentTime = Date.now();

  return endTime < currentTime;
};

export const updateChallengeOnPhotoUploaded = async (
  pieces: number,
  challengeIds: string[]
) => {
  await Promise.all(
    challengeIds.map(async (challengeId: string) => {
      try {
        const challenge = await getChallengeIfExists(challengeId);

        // If the user is part of a challenge, but the challenge has ended,
        // their new pieces uploaded should not count towards it.
        // n.b. This means people can't upload late for things like World Cleanup Day
        if (challengeHasEnded(challenge)) {
          console.log(
            `Challenge wasn't updated with new pieces because it had ended when photo was uploaded.`
          );
          return;
        }

        console.log(
          `Photo with ${pieces} pieces uploaded for challenge: ${challengeId}.`
        );

        const challengeRef = await getChallengeRefFromId(challengeId);
        await challengeRef.update({
          pendingPieces: firebase.firestore.FieldValue.increment(pieces)
        });
      } catch (err) {
        console.info(
          `Error updating challenge with uploaded photo pieces: ${err}`
        );
      }
    })
  );
};

export const updateChallengeOnPhotoModerated = async (
  photo: Photo,
  photoWasApproved: boolean
) => {
  if (
    !photo.challenges ||
    photo.challenges.length === 0 ||
    photo.pieces === 0
  ) {
    console.log("Photo was moderated but no challenge updated.");
    return;
  }

  await Promise.all(
    photo.challenges.map(async (challengeId: string) => {
      try {
        const challenge = await getChallengeIfExists(challengeId);

        if (photoWasApproved) {
          // If the user is NOT still part of challenge, we:
          // - won't add to the challenge total,
          // - still need to decrement the pending pieces that was incremented it in `onPhotoUpload`.
          if (!userIsInChallenge(challenge, photo.owner_id)) {
            console.log(
              `Photo ${photo.id} was uploaded within challenge ${challengeId} but uploading user ${photo.owner_id} was no longer in challenge.`
            );
            await decrementPendingPieces(challengeId, photo.pieces);
            return;
          }

          console.log(
            `Moderated approved ${photo.pieces} pieces for challenge ${challengeId}`
          );

          const challengeRef = await getChallengeRefFromId(challengeId);
          await challengeRef.update({
            totalPieces: firebase.firestore.FieldValue.increment(photo.pieces),
            pendingPieces: firebase.firestore.FieldValue.increment(
              -photo.pieces
            ),
            [`totalUserPieces.${photo.owner_id}.pieces`]: firebase.firestore.FieldValue.increment(
              photo.pieces
            )
          });
        } else {
          await decrementPendingPieces(challengeId, photo.pieces);
        }
      } catch (err) {
        console.error(err);
      }
    })
  );
};

const decrementPendingPieces = async (
  challengeId: string,
  numberToDecrement: number
) => {
  console.log(
    `Decrement ${numberToDecrement} pending pieces for challenge ${challengeId}`
  );
  const challengeRef = await getChallengeRefFromId(challengeId);
  return await challengeRef.update({
    pendingPieces: firebase.firestore.FieldValue.increment(-numberToDecrement)
  });
};
