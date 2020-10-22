import { Challenge } from "challenges/models";

export default function verifyChallengeIsOngoing(challenge: Challenge) {
  const { endTime } = challenge;
  const currentTime = new Date().getUTCMinutes();

  return endTime < currentTime;
}
