import React, { useContext, useEffect, useState } from "react";
import {
  fetchAllChallenges,
  getChallengeCoverPhotoUrl
} from "../features/firebase/challenges";
import { Challenge, ChallengeFirestoreData } from "../types/Challenges";

export type ChallengesProviderData = {
  challenges: Challenge[];
  refresh: () => void;
};

export const ChallengesContext = React.createContext<
  ChallengesProviderData | undefined
>(undefined);

type Props = {
  children?: React.ReactChild[];
};

const refreshChallenge = async (currentChallenges: Challenge[]) => {
  console.log(`Refreshing challenges`);

  // Fetch a list of all challenges from Firestore.
  const allChallenges = await fetchAllChallenges();

  // Filter out challenges which are hidden (deleted).
  const visibleChallenges = allChallenges.filter(
    (challenge) => !challenge.hidden
  );

  // If we previously fetched a challenge's photo, copy it across to our new list.
  let newChallenges: Challenge[] = visibleChallenges.map(
    (challenge: ChallengeFirestoreData) => {
      return {
        ...challenge,
        coverPhotoUrl: currentChallenges.find(
          (oldChallenge) => oldChallenge.id === challenge.id
        )?.coverPhotoUrl
      };
    }
  );

  // Download cover photos for challenges which we don't have already.
  for (let challenge of newChallenges) {
    if (challenge.coverPhotoUrl === undefined) {
      challenge.coverPhotoUrl = await getChallengeCoverPhotoUrl(challenge.id);
    }
  }

  return newChallenges;
};

export const ChallengesProvider = ({ children }: Props) => {
  const updateChallenges = async () =>
    setData({
      ...data,
      challenges: await refreshChallenge(data.challenges)
    });

  const [data, setData] = useState<ChallengesProviderData>({
    challenges: [],
    refresh: updateChallenges
  });

  useEffect(() => {
    updateChallenges();
  }, []);

  return (
    <ChallengesContext.Provider value={data}>
      {children}
    </ChallengesContext.Provider>
  );
};

export const useChallenges = () => useContext(ChallengesContext);
