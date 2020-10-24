type User = { uid: string; pieces: number; displayName: string };

export type ChallengeFromServer = {
  id: string;
  name: string;
  ownerUserId: string;
  description: string;
  isPrivate: string;
  startTime: number;
  endTime: number;
  targetPieces: number;
  totalPieces: number;
  totalUserPieces: { [uid: string]: User };
  pendingPieces: number;
  pendingUsers: Array<{ uid: string; displayName: string }>;
};

export type Challenge = Omit<ChallengeFromServer, "id">;

export type ConfigurableChallengeData = {
  name: string;
  description: string;
  isPrivate: string;
  startTime: number;
  endTime: number;
  targetPieces: number;
};
