import firebase from "firebase/app";
import { Challenge } from "types/Challenges";
import { storageRef } from "./dbFirebase";

const createChallengeFb = firebase.functions().httpsCallable("createChallenge");
export const createChallenge = async ({ photo, ...args }: any) => {
  const { data } = await createChallengeFb(args);
  // TODO: convert photo to base 64
  // NOTE: it is possible for us to do this upload on the backend, just need to add a package
  // + make sure that we upload to the correct bucket based on environment

  const base64Photo = "placeholder";

  await storageRef
    .child("challenges")
    .child(data.id)
    .child("original.jpg")
    .putString(base64Photo, "base64", {
      contentType: "image/jpeg"
    });

  return data;
};

export async function fetchAllChallenges() {
  const snapshot = await firebase
    .firestore()
    .collection("challenges")
    .where("isPrivate", "==", false)
    .get();

  if (snapshot.empty) {
    return [];
  }

  const challenges = snapshot.docs.map(({ id, data }) => ({
    id,
    ...data()
  })) as Challenge[];

  return challenges;
}
