import React, { useContext, useEffect, useState } from "react";
import {
  fetchAllMissions,
  getMissionCoverPhotoUrl
} from "../features/firebase/missions";
import { Mission, MissionFirestoreData } from "../types/Missions";

export type MissionsProviderData = {
  missions?: Mission[];
  refresh: () => Promise<void>;
};

export const MissionsContext = React.createContext<
  MissionsProviderData | undefined
>(undefined);

type Props = {
  children?: React.ReactChild[];
};

const refreshMission = async (currentMissions: Mission[]) => {
  console.log(`Refreshing missions`);

  // Fetch a list of all missions from Firestore.
  const allMissions = await fetchAllMissions();

  // Filter out missions which are hidden (deleted).
  const visibleMissions = allMissions.filter((mission) => !mission.hidden);

  // If we previously fetched a mission's photo, copy it across to our new list.
  let newMissions: Mission[] = visibleMissions.map(
    (mission: MissionFirestoreData) => {
      return {
        ...mission,
        coverPhotoUrl: currentMissions.find(
          (oldMission) => oldMission.id === mission.id
        )?.coverPhotoUrl
      };
    }
  );

  // Download cover photos for missions which we don't have already.
  for (let mission of newMissions) {
    if (mission.coverPhotoUrl === undefined) {
      try {
        mission.coverPhotoUrl = await getMissionCoverPhotoUrl(mission.id);
      } catch (err) {
        console.error(`Caught error getting mission cover photo URL`);
        console.error(err);
      }
    }
  }

  return newMissions;
};

export const MissionsProvider = ({ children }: Props) => {
  const updateMissions = async () =>
    setData({
      ...data,
      missions: await refreshMission(data.missions || [])
    });

  const [data, setData] = useState<MissionsProviderData>({
    missions: undefined,
    refresh: updateMissions
  });

  useEffect(() => {
    updateMissions();
  }, []);

  return (
    <MissionsContext.Provider value={data}>{children}</MissionsContext.Provider>
  );
};

export const useMissions = () => useContext(MissionsContext);
