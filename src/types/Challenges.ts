import { ImageMetadata } from "./Photo";

export type ChallengeId = string;

export type ChallengeConfigurableData = {
  name: string;
  description: string;
  isPrivate: boolean;
  coverPhoto: ImageMetadata | undefined;
  startTime: number;
  endTime: number;
  targetPieces: number;
};

export const equal = (
  challenge: ChallengeConfigurableData,
  other: ChallengeConfigurableData
) => {
  return (
    challenge.name == other.name &&
    challenge.description == other.description &&
    challenge.targetPieces == other.targetPieces &&
    challenge.isPrivate == other.isPrivate &&
    challenge.coverPhoto == other.coverPhoto &&
    isSameDay(new Date(challenge.startTime), new Date(other.startTime)) &&
    isSameDay(new Date(challenge.endTime), new Date(other.endTime))
  );
};

export const EmptyChallengeData: ChallengeConfigurableData = {
  name: "",
  description: "",
  isPrivate: false,
  coverPhoto: undefined,
  startTime: 0,
  endTime: 0,
  targetPieces: 0
};

export type Challenge = ChallengeConfigurableData & {
  id: ChallengeId;
  ownerUserId: string;
  totalPieces: number;
  totalUserPieces: {
    uid: string;
    displayName: string;
    pieces: number;
  }[];
  pendingUserIds: {
    uid: string;
    email: string;
    displayName: string;
  }[];
};

export const isChallengeFinished = (challenge: Challenge): boolean => {
  const today: Date = new Date();
  today.setHours(0, 0, 0, 0);
  return challenge.endTime > today.getTime();
};

export const isSameDay = (date: Date, other: Date) => {
  return date.toDateString() == other.toDateString();
};

export function isChallengeReady(
  challengeConfigurableData: ChallengeConfigurableData | undefined
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
    // Has selected a cover photo
    challengeConfigurableData.coverPhoto !== undefined &&
    // Has an end date set after the start date
    challengeConfigurableData.endTime > challengeConfigurableData.startTime
  );
}
