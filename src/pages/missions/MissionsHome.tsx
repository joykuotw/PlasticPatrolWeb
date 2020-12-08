import React, { useContext, useMemo, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router";

import PageWrapper from "components/PageWrapper";

import "react-circular-progressbar/dist/styles.css";

import styles from "standard.scss";
import Search from "@material-ui/icons/Search";
import MissionThumbnail from "./MissionThumbnail";
import { linkToCreateMission } from "../../routes/missions/links";
import {
  MissionsProviderData,
  useMissions
} from "../../providers/MissionsProvider";
import {
  Mission,
  MissionFirestoreData,
  userIsInMission
} from "../../types/Missions";
import { useUser } from "../../providers/UserProvider";
import User from "../../types/User";
import { linkToMap } from "../../custom/config";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: "flex",
    flexFlow: "column",
    padding: "5%"
  },

  searchWrapper: {
    flex: "0 0 auto",
    background: styles.lightGrey,
    width: "100%",
    margin: "0 0 20px 0",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    padding: `${theme.spacing(1)}px ${theme.spacing(1)}px`,
    boxSizing: "border-box",
    color: styles.darkgray,
    fontSize: 20
  },

  searchInput: {
    border: "none",
    background: styles.lightGrey,
    fontSize: 16,
    marginLeft: theme.spacing(1),
    boxSizing: "border-box",
    width: "100%",
    textOverflow: "ellipsis",
    "&:focus": {
      outline: "none"
    }
  },

  missionList: {
    flex: "0 0 auto"
  }
}));

type Props = {};

function getFilteredMissions(
  searchString: string,
  missions: MissionFirestoreData[],
  user?: User
): MissionFirestoreData[] {
  const userLoggedIn = user !== undefined;
  const userId = user?.id || "invalid_id";

  // Put missions that users are in at the top.
  if (userLoggedIn) {
    missions.sort((a: MissionFirestoreData, b: MissionFirestoreData) => {
      return userIsInMission(a, userId) ? 1 : 0;
    });
  }

  // If user hasn't searched anything, return all public missions and missions user is part of.
  if (searchString === "") {
    return missions.filter(
      (mission) => !mission.isPrivate || userIsInMission(mission, userId)
    );
  }

  const MIN_PRIVATE_MISSION_ID_SEARCH_LENGTH = 6;

  const missionNameIncludesSubstring = (name: string, substring: string) =>
    name.toLowerCase().includes(substring.toLowerCase());
  const searchedPrivateMissionId = (mission: Mission, substring: string) => {
    return (
      mission.isPrivate &&
      substring.length > MIN_PRIVATE_MISSION_ID_SEARCH_LENGTH &&
      mission.id.includes(substring)
    );
  };

  // Filter based on search string.
  // If it's a public mission, check if the name includes the search string.
  // If it's a private mission, check user logged, and the search string matches a section of the mission ID.
  missions = missions.filter((mission) => {
    const searchedPublicMission =
      (!mission.isPrivate || userIsInMission(mission, userId || "")) &&
      missionNameIncludesSubstring(mission.name, searchString);
    const searchedPrivateMission =
      userLoggedIn &&
      mission.isPrivate &&
      searchedPrivateMissionId(mission, searchString);
    return searchedPublicMission || searchedPrivateMission;
  });

  return missions;
}

export default function MissionsHome({}: Props) {
  const history = useHistory();
  const handleClose = () => history.push(linkToMap());

  const missionData = useMissions();
  const user = useUser();

  const classes = useStyles();
  const [searchString, setSearchString] = useState("");
  const filteredMissionList = useMemo(
    () => getFilteredMissions(searchString, missionData?.missions || [], user),
    [searchString, missionData]
  );
  return (
    <PageWrapper
      label={"Missions"}
      navigationHandler={{ handleClose: handleClose }}
      className={classes.wrapper}
      addAction={() => history.push(linkToCreateMission())}
    >
      <div className={classes.searchWrapper}>
        <Search style={{ color: styles.darkgrey }} />
        <input
          placeholder={"Search"}
          className={classes.searchInput}
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
        />
      </div>
      <div className={classes.missionList}>
        {filteredMissionList.length === 0 ? (
          <div>
            Unfortunately, there are no matches for your search. <br />
            <br />
            If you’d like to create your own mission, please tap on the create
            mission button at the top of the screen.
          </div>
        ) : (
          filteredMissionList.map((mission: MissionFirestoreData) => (
            <MissionThumbnail key={mission.id} mission={mission} />
          ))
        )}
      </div>
    </PageWrapper>
  );
}
