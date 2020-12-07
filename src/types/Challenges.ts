import { ImageMetaData } from "../pages/photo/state/types";
import User from "./User";

export type ChallengeId = string;

export type UserChallengeData = {
  uid: string;
  pieces: number;
  displayName: string;
};
export type PendingUser = { uid: string; displayName: string; email: string };
export type TotalUserPieces = { [uid: string]: UserChallengeData };
export type PendingUsers = Array<PendingUser>;

export type ChallengeFirestoreData = Omit<
  ConfigurableChallengeData,
  "coverPhoto"
> & {
  id: string;
  name: string;
  ownerUserId: string;
  description: string;
  isPrivate: boolean;
  startTime: number;
  endTime: number;
  targetPieces: number;
  totalPieces: number;
  totalUserPieces: TotalUserPieces;
  pendingPieces: number;
  pendingUsers: PendingUsers;
  hidden: boolean;
};

export type Challenge = ChallengeFirestoreData & {
  coverPhotoUrl?: any;
};

export type ConfigurableChallengeData = {
  name: string;
  description: string;
  isPrivate: boolean;
  startTime: number;
  endTime: number;
  targetPieces: number;
  coverPhoto?: ImageMetaData | string;
};

export const coverPhotoIsMetaData = (
  str: ImageMetaData | string
): str is ImageMetaData => {
  return (str as ImageMetaData).imgSrc !== undefined;
};

export const equal = (
  challenge: ConfigurableChallengeData,
  other: ConfigurableChallengeData
) => {
  return (
    challenge.name === other.name &&
    challenge.description === other.description &&
    challenge.targetPieces === other.targetPieces &&
    challenge.isPrivate === other.isPrivate &&
    isSameDay(new Date(challenge.startTime), new Date(other.startTime)) &&
    isSameDay(new Date(challenge.endTime), new Date(other.endTime))
  );
};

export const EmptyChallengeData: ConfigurableChallengeData = {
  name: "",
  description: "",
  isPrivate: false,
  startTime: 0,
  endTime: 0,
  targetPieces: 0,
  coverPhoto: undefined
};

export const isChallengeFinished = (
  challenge: ChallengeFirestoreData
): boolean => {
  const today: Date = new Date();
  today.setHours(0, 0, 0, 0);
  return challenge.endTime > today.getTime();
};

export const isSameDay = (date: Date, other: Date) => {
  return date.toDateString() === other.toDateString();
};

export function isDuplicatingExistingChallengeName(
  challengeConfigurableData: ConfigurableChallengeData | undefined,
  existingChallenges: ChallengeFirestoreData[],
  currentChallengeId?: string
) {
  if (challengeConfigurableData === undefined) {
    return false;
  }

  const existingChallengeHasName = existingChallenges.some(
    (existingChallenge: ChallengeFirestoreData) => {
      return (
        existingChallenge.name === challengeConfigurableData.name &&
        existingChallenge.id !== currentChallengeId
      );
    }
  );

  return existingChallengeHasName;
}

export function isChallengeDataValid(
  challengeConfigurableData: ConfigurableChallengeData | undefined
) {
  const today: Date = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    challengeConfigurableData !== undefined &&
    // Check challenge has a name
    challengeConfigurableData.name !== "" &&
    // Check challenge has description
    challengeConfigurableData.description !== "" &&
    // Has a valid number of pieces to collect
    challengeConfigurableData.targetPieces > 0 &&
    // Has an end date set after the start date
    challengeConfigurableData.endTime > challengeConfigurableData.startTime
  );
}

export const userIsInChallenge = (
  challenge: ChallengeFirestoreData,
  userId: string
): boolean => {
  return userId in challenge.totalUserPieces;
};
