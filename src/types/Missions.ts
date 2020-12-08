import { ImageMetaData } from "../pages/photo/state/types";
import User from "./User";

export type MissionId = string;

export type UserMissionData = {
  uid: string;
  pieces: number;
  displayName: string;
};
export type PendingUser = { uid: string; displayName: string; email: string };
export type TotalUserPieces = { [uid: string]: UserMissionData };
export type PendingUsers = Array<PendingUser>;

export type MissionFirestoreData = Omit<
  ConfigurableMissionData,
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

export type Mission = MissionFirestoreData & {
  coverPhotoUrl?: any;
};

export type ConfigurableMissionData = {
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
  mission: ConfigurableMissionData,
  other: ConfigurableMissionData
) => {
  return (
    mission.name === other.name &&
    mission.description === other.description &&
    mission.targetPieces === other.targetPieces &&
    mission.isPrivate === other.isPrivate &&
    isSameDay(new Date(mission.startTime), new Date(other.startTime)) &&
    isSameDay(new Date(mission.endTime), new Date(other.endTime))
  );
};

export const EmptyMissionData: ConfigurableMissionData = {
  name: "",
  description: "",
  isPrivate: false,
  startTime: 0,
  endTime: 0,
  targetPieces: 0,
  coverPhoto: undefined
};

export const isMissionFinished = (mission: MissionFirestoreData): boolean => {
  const today: Date = new Date();
  today.setHours(0, 0, 0, 0);
  return mission.endTime > today.getTime();
};

export const isSameDay = (date: Date, other: Date) => {
  return date.toDateString() === other.toDateString();
};

export function isDuplicatingExistingMissionName(
  missionConfigurableData: ConfigurableMissionData | undefined,
  existingMissions: MissionFirestoreData[],
  currentMissionId?: string
) {
  if (missionConfigurableData === undefined) {
    return false;
  }

  const existingMissionHasName = existingMissions.some(
    (existingMission: MissionFirestoreData) => {
      return (
        existingMission.name === missionConfigurableData.name &&
        existingMission.id !== currentMissionId
      );
    }
  );

  return existingMissionHasName;
}

export function isMissionDataValid(
  missionConfigurableData: ConfigurableMissionData | undefined
) {
  const today: Date = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    missionConfigurableData !== undefined &&
    // Chehck mission has a name
    missionConfigurableData.name !== "" &&
    // Check mission has description
    missionConfigurableData.description !== "" &&
    // Has a valid number of pieces to collect
    missionConfigurableData.targetPieces > 0 &&
    // Has an end date set after the start date
    missionConfigurableData.endTime > missionConfigurableData.startTime
  );
}

export const userIsInMission = (
  mission: MissionFirestoreData,
  userId: string
): boolean => {
  return userId in mission.totalUserPieces;
};
