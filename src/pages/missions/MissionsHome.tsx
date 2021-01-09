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
  userOnMissionLeaderboard,
  userIsInMission,
  PRIVATE_MISSION_ID_SEARCH_LENGTH
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
  if (user !== undefined) {
    missions.sort((a: MissionFirestoreData, b: MissionFirestoreData) => {
      return userIsInMission(user, a.id) ? -1 : 1;
    });
  }

  const missionNameIncludesSubstring = (name: string, substring: string) =>
    name.toLowerCase().includes(substring.trim().toLowerCase());
  const searchedPrivateMissionId = (mission: Mission, substring: string) => {
    return (
      mission.isPrivate &&
      substring.length >= PRIVATE_MISSION_ID_SEARCH_LENGTH &&
      mission.id.includes(substring.trim())
    );
  };

  // Filter missions to show missions if:
  //  - the user is in the mission.
  //  - the user is a moderator.
  //  - if it's a private mission AND the search string matches a section of the mission ID.
  //  - if it's a public mission AND the search string matches a section of the challenge name.
  missions = missions.filter((mission) => {
    if (
      user !== undefined &&
      (user.isModerator || userIsInMission(user, mission.id))
    ) {
      return true;
    }

    if (mission.isPrivate) {
      return userLoggedIn && searchedPrivateMissionId(mission, searchString);
    }

    return missionNameIncludesSubstring(mission.name, searchString);
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
        {missionData?.missions === undefined ? (
          <div>Loading...</div>
        ) : filteredMissionList.length === 0 ? (
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
