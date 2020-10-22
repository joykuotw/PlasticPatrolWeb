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
  totalUserPieces: Array<{ uid: string; pieces: number }>;
  pendingUsers: Array<string>;
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
