import firebase from "firebase/app";
import {
  Mission,
  MissionFirestoreData,
  MissionId,
  ConfigurableMissionData,
  coverPhotoIsMetaData,
  userOnMissionLeaderboard,
  PendingUser,
  userCollectedPiecesForMission
} from "../../types/Missions";
import Photo from "../../types/Photo";
import User from "../../types/User";
import _ from "lodash";
import { ImageMetaData } from "../../pages/photo/state/types";
import { firestore } from "../../../functions/src/firestore";

const MISSION_FIRESTORE_COLLECTION = "missions";
const MISSION_PHOTO_STORAGE = "missions";
const MISSION_PHOTO_FILENAME = "original.jpg";

export const getMissionCoverPhotoUrl = async (
  missionId: string
): Promise<string | undefined> => {
  const storageRef = firebase.storage().ref();

  let coverPhotoUrl;
  try {
    coverPhotoUrl = await storageRef
      .child(`${MISSION_PHOTO_STORAGE}/${missionId}/${MISSION_PHOTO_FILENAME}`)
      .getDownloadURL();
  } catch (err) {
    if (err.code === "storage/object-not-found") {
      console.log(
        `Failed to download mission ${missionId} cover photo. User probably didn't upload, we display a default.`
      );
    } else {
      console.error(
        `Failed to download mission ${missionId} cover photo for unexpected reason.`
      );
      console.error(err);
    }
    return undefined;
  }

  return coverPhotoUrl;
};

const getMissionRefFromId = (missionId: string) => {
  return firebase
    .firestore()
    .collection(MISSION_FIRESTORE_COLLECTION)
    .doc(missionId);
};

export const createMission = async (
  user: User,
  mission: ConfigurableMissionData
) => {
  const ownerUserId = user.id;

  console.log(`Create mission called by user ${ownerUserId}`);
  console.log(mission);

  const missionToPersist: Omit<MissionFirestoreData, "id"> = {
    ..._.omit(mission, "coverPhoto"),
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
    .collection(MISSION_FIRESTORE_COLLECTION)
    .add(missionToPersist);

  await addMissionToUser(ownerUserId, id);

  if (
    mission.coverPhoto === undefined ||
    !coverPhotoIsMetaData(mission.coverPhoto)
  ) {
    console.log(`No cover photo uploaded for mission, skipping upload.`);
    return;
  }

  await uploadMissionCoverPhoto(id, mission.coverPhoto);
};

export async function fetchAllMissions(): Promise<MissionFirestoreData[]> {
  const snapshot = await firebase
    .firestore()
    .collection(MISSION_FIRESTORE_COLLECTION)
    // .where("isPrivate", "==", false)
    .get();

  if (snapshot.empty) {
    console.log(` - snapshot empty`);
    return [];
  }

  const missions = snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id
  })) as MissionFirestoreData[];

  return missions;
}

// Edit mission with pending user
export const joinMission = async (missionId: MissionId, user?: User) => {
  console.log(`User ${user?.id} trying to join mission ${missionId}`);

  if (user === undefined) {
    console.error(
      `Couldn't join mission because local firebase user was undefined.`
    );
    return;
  }

  const mission = await getMissionIfExists(missionId);
  if (missionHasEnded(mission)) {
    console.error(
      `User ${user.id} tried to join finished mission ${mission.id}`
    );
    return;
  }

  if (mission.isPrivate) {
    await addToPendingMissionUsers(missionId, user);
    return;
  }

  await addUserToMission(mission, user);
};

export const addToPendingMissionUsers = async (
  missionId: MissionId,
  user: User
) => {
  console.log(`Adding ${user.id} to mission ${missionId} pending users`);

  const missionRef = getMissionRefFromId(missionId);
  await missionRef.set(
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

export const addUserToMission = async (
  mission: MissionFirestoreData,
  user: User
) => {
  console.log(mission);
  // If the user left and rejoined the mission, they'll already have a piece count,
  // so we don't need to add a new one.
  if (!userOnMissionLeaderboard(mission, user.id)) {
    console.log(`Adding user ${user.id} to mission ${mission.id} leaderboard`);

    const missionRef = getMissionRefFromId(mission.id);
    await missionRef.set(
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

  await addMissionToUser(user.id, mission.id);
};

// Edit user to remove missionId
export const leaveMission = async (missionId: MissionId, user?: User) => {
  const mission = await getMissionIfExists(missionId);

  if (user === undefined) {
    console.error(
      `Couldn't leave mission because local firebase user ${user} was undefined`
    );
    return;
  }

  if (missionHasEnded(mission)) {
    console.log(`User not leaving mission because the mission had ended.`);
    return;
  }

  console.log(`User ${user.id} leaving mission ${missionId}`);

  // We remove the mission from the user data list of  missions.
  // This prevents their future uploads contributing.
  const userDocRef = await firebase
    .firestore()
    .collection("users")
    .doc(user.id);

  if (!(await userDocRef.get()).exists) {
    console.warn(
      `Failed to remove mission ${missionId} from user ${user.id}. User Firebase entry didn't exist.`
    );
    return;
  }

  userDocRef.update({
    missions: firebase.firestore.FieldValue.arrayRemove(missionId)
  });

  // Unless the user upload count for this mission is still 0, we still leave
  // their piece uploads in the mission so the total makes sense.
  if (!userCollectedPiecesForMission(mission, user.id)) {
    const missionRef = getMissionRefFromId(missionId);
    await missionRef.update({
      [`totalUserPieces.${user.id}`]: firebase.firestore.FieldValue.delete()
    });
  }
};

// Edit mission to remove user from pending users and add user count (if not present).
// Edit user to add missionId.
export const approveNewMember = async (
  missionId: MissionId,
  user: PendingUser
) => {
  const missionRef = getMissionRefFromId(missionId);
  const currentMissionSnapshot = await missionRef.get();
  const missionData = currentMissionSnapshot.data() as MissionFirestoreData;

  console.log(`Accepting pending member ${user.uid} for mission ${missionId}`);

  const newPendingUsers = missionData.pendingUsers.filter(
    (pendingUser) => pendingUser.uid !== user.uid
  );

  await missionRef.set(
    {
      pendingUsers: newPendingUsers,
      totalUserPieces: {
        [user.uid]: {
          uid: user.uid,
          displayName: user.displayName,
          pieces: 0
        }
      }
    },
    { merge: true }
  );

  await addMissionToUser(user.uid, missionId);
};

// Edit mission to remove user from pending users.
export const rejectNewMember = async (uid: string, missionId: MissionId) => {
  const missionRef = getMissionRefFromId(missionId);
  const currentMissionSnapshot = await missionRef.get();
  const missionData = currentMissionSnapshot.data() as MissionFirestoreData;

  console.log(`Rejecting pending member ${uid} for mission ${missionId}`);

  const newPendingUsers = missionData.pendingUsers.filter(
    (pendingUser) => pendingUser.uid !== uid
  );

  await missionRef.set(
    {
      pendingUsers: newPendingUsers
    },
    { merge: true }
  );
};

// Edit mission configurable data
export const editMission = async (
  missionId: MissionId,
  mission: ConfigurableMissionData
) => {
  const missionRef = getMissionRefFromId(missionId);
  const currentMissionSnapshot = await missionRef.get();
  const missionData = currentMissionSnapshot.data() as MissionFirestoreData;

  console.log(`Editing mission ${missionId}`);
  console.log(mission);

  await missionRef.set(
    {
      ..._.omit(mission, "coverPhoto")
    },
    { merge: true }
  );

  if (
    mission.coverPhoto === undefined ||
    !coverPhotoIsMetaData(mission.coverPhoto)
  ) {
    return;
  }

  await uploadMissionCoverPhoto(missionId, mission.coverPhoto);
};

const uploadMissionCoverPhoto = async (
  missionId: MissionId,
  coverPhoto: ImageMetaData
) => {
  console.log(`Uploading cover photo for mission ${missionId}`);
  const coverPhotoStorageRef = await firebase
    .storage()
    .ref()
    .child(MISSION_PHOTO_STORAGE)
    .child(missionId)
    .child(MISSION_PHOTO_FILENAME);

  const base64Image = coverPhoto.imgSrc.split(",")[1];
  await coverPhotoStorageRef.putString(base64Image, "base64", {
    contentType: "image/jpeg"
  });
};

// Delete mission (maybe just mark as hidden to avoid accidents).
export const deleteMission = async (missionId: MissionId) => {
  const missionRef = getMissionRefFromId(missionId);
  try {
    await missionRef.set(
      {
        hidden: true
      },
      { merge: true }
    );
  } catch (err) {
    console.error(`Failed to set mission ${missionId} as hidden. ${err}`);
  }
};

const addMissionToUser = async (userId: string, missionId: string) => {
  console.log(`Updating user ${userId} with mission ${missionId}`);

  // try catch is to handle the case where a user doesn't yet have a profile
  // pre Gravatar migration
  try {
    await firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .set(
        {
          missions: [missionId]
        },
        { merge: true }
      );
  } catch (err) {
    console.error(`Failed to add mission ID to user data: ${err}`);
  }
};

const getMissionIfExists = async (
  missionId: string
): Promise<MissionFirestoreData> => {
  let snapshot;
  try {
    const missionRef = getMissionRefFromId(missionId);
    snapshot = await missionRef.get();
  } catch (err) {
    throw new Error(`Failed to get mission by mission ID: ${err}`);
  }

  console.log(`Get mission if exists: ${missionId}.`);

  if (!snapshot.exists) {
    throw new Error("No mission exists for id");
  }

  return { ...snapshot.data(), id: missionId } as MissionFirestoreData;
};

export const missionHasEnded = (mission: Mission) => {
  const { endTime } = mission;
  const currentTime = Date.now();

  return endTime < currentTime;
};

export const updateMissionOnPhotoUploaded = async (
  pieces: number,
  missionIds: string[]
) => {
  console.log(
    `User uploaded photo with ${pieces} for ${missionIds.length} missions`
  );
  console.log(missionIds);

  await Promise.all(
    (missionIds || []).map(async (missionId: string) => {
      try {
        const mission = await getMissionIfExists(missionId);

        // If the user is part of a mission, but the mission has ended,
        // their new pieces uploaded should not count towards it.
        // n.b. This means people can't upload late for things like World Cleanup Day
        if (missionHasEnded(mission)) {
          console.log(
            `Mission wasn't updated with new pieces because it had ended when photo was uploaded.`
          );
          return;
        }

        console.log(
          `Photo with ${pieces} pieces uploaded for mission: ${missionId}.`
        );

        const missionRef = getMissionRefFromId(missionId);
        await missionRef.update({
          pendingPieces: firebase.firestore.FieldValue.increment(pieces)
        });
      } catch (err) {
        console.info(
          `Error updating mission with uploaded photo pieces: ${err}`
        );
      }
    })
  );
};

export const updateMissionOnPhotoModerated = async (
  photo: Photo,
  photoWasApproved: boolean
) => {
  if (!photo.missions || photo.missions.length === 0 || photo.pieces === 0) {
    console.log("Photo was moderated but no mission updated.");
    return;
  }

  await Promise.all(
    photo.missions.map(async (missionId: string) => {
      try {
        const mission = await getMissionIfExists(missionId);

        if (photoWasApproved) {
          // If the user is NOT still part of mission, we:
          // - won't add to the mission total,
          // - still need to decrement the pending pieces that was incremented it in `onPhotoUpload`.
          if (!userOnMissionLeaderboard(mission, photo.owner_id)) {
            console.log(
              `Photo ${photo.id} was uploaded within mission ${missionId} but uploading user ${photo.owner_id} was no longer in mission.`
            );
            await decrementPendingPieces(missionId, photo.pieces);
            return;
          }

          console.log(
            `Moderator approved ${photo.pieces} pieces for mission ${missionId}`
          );

          const missionRef = getMissionRefFromId(missionId);
          await missionRef.update({
            totalPieces: firebase.firestore.FieldValue.increment(photo.pieces),
            pendingPieces: firebase.firestore.FieldValue.increment(
              -photo.pieces
            ),
            [`totalUserPieces.${photo.owner_id}.pieces`]: firebase.firestore.FieldValue.increment(
              photo.pieces
            )
          });
        } else {
          await decrementPendingPieces(missionId, photo.pieces);
        }
      } catch (err) {
        console.error(err);
      }
    })
  );
};

const decrementPendingPieces = async (
  missionId: string,
  numberToDecrement: number
) => {
  console.log(
    `Decrement ${numberToDecrement} pending pieces for mission ${missionId}`
  );
  const missionRef = getMissionRefFromId(missionId);
  return await missionRef.update({
    pendingPieces: firebase.firestore.FieldValue.increment(-numberToDecrement)
  });
};
