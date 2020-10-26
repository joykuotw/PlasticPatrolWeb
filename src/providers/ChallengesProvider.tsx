import {
  Challenge,
  ChallengeConfigurableData,
  ChallengeId
} from "../types/Challenges";
import exampleImage from "assets/images/example.jpeg";
import { ImageMetadata } from "../types/Photo";
import User from "../types/User";
import { LatLong } from "../types/GPSLocation";

export const FakeChallenge: Challenge = {
  id: "123",
  name: "This is the CHALLENGE",
  description: "this is the description of the challenge omg I hate plastic",
  coverPhoto: {
    imgSrc: exampleImage,
    imgExif: undefined,
    imgLocation: {
      latitude: 51.504896,
      longitude: -0.172558
    },
    imgIptc: undefined
  } as ImageMetadata,
  startTime: 1602958418439,
  endTime: 1607936359830,
  targetPieces: 10,
  isPrivate: false,

  ownerUserId: "123",
  totalPieces: 4,
  totalUserPieces: [
    { displayName: "ally", uid: "123", pieces: 3 },
    { displayName: "liz", uid: "456", pieces: 45 }
  ],
  pendingUserIds: [
    { displayName: "neil", uid: "789", email: "neil@plasticpatrol.com" },
    { displayName: "tom", uid: "abc", email: "tom@plasticpatrol.com" },
    { displayName: "joe", uid: "def", email: "joe@plasticpatrol.com" }
  ]
};

export const useChallenges = (): Challenge[] => {
  // const [challenges, setChallenges] = useState<Challenge[]>([]);
  // useEffect(
  //    setChallenges(FakeChallenges)
  // );
  return [
    FakeChallenge,
    FakeChallenge,
    FakeChallenge,
    FakeChallenge,
    FakeChallenge,
    FakeChallenge
  ];
};

// Creates the challenge
// Updates the user with challengeId
export const createChallenge = (
  creatorUid: string,
  challenge: ChallengeConfigurableData
) => {};

// Edit challenge with pending user
export const joinChallenge = (uid: string, challengeId: ChallengeId) => {};

// Edit challenge configurable data
export const editChallenge = (
  challengeId: ChallengeId,
  challenge: ChallengeConfigurableData
) => {};

// Edit user to remove challengeId
export const leaveChallenge = (uid: string, challengeId: ChallengeId) => {};

// Edit challenge to remove user from pending users and add user count (if not present).
// Edit user to add challengeId.
export const approveNewMember = (uid: string, challengeId: ChallengeId) => {};

// Edit challenge to remove user from pending users.
export const rejectNewMember = (uid: string, challengeId: ChallengeId) => {};

// Delete challenge (maybe just mark as hidden to avoid accidents).
export const deleteChallenge = (challengeId: ChallengeId) => {};

// Upload photo as before, with additional challengeId.
// Edit challenge to increase denormalized total count / per use count.
export const addUploadToChallenge = () => {};
