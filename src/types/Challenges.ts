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
}

export type Challenge = ChallengeConfigurableData & {
    id: ChallengeId,
    ownerUserId: string;
    totalPieces: number;
    totalUserPieces: {uid: string, pieces: number}[]
    pendingUserIds: string[]
}

export const isChallengeFinished = (challenge: Challenge): boolean => {
  return challenge.endTime > Date.now();
}
