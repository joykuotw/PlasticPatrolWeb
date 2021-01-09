import { makeStyles, useTheme } from "@material-ui/core/styles";
import React, { useRef } from "react";
import { useHistory } from "react-router";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { linkToMission } from "../../routes/missions/links";
import {
  getDaysBetweenTimes,
  getTextDurationBetweenTimes,
  Mission
} from "../../types/Missions";
import LockOpenIcon from "@material-ui/icons/LockOpen";

import thumbnailBackup from "assets/images/mission-thumbnail-backup.png";

const useStyles = makeStyles((theme) => ({
  missionThumbnail: {
    padding: "4%",
    display: "flex",
    height: "80px",
    flexWrap: "nowrap",
    flexDirection: "row",
    boxShadow: "1px 1px 2px 2px #ccc",
    borderRadius: "10px",
    marginBottom: "20px"
  },

  pictureWrapper: {
    flex: "3",
    height: "100%",
    weight: "100px",
    textAlign: "center",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: "5px"
  },

  picture: {
    height: "100%"
  },

  textSection: {
    flex: "6",
    fontSize: "12px",
    padding: "5px 10px 0 10px"
  },

  name: {
    paddingBottom: "7px",
    fontWeight: "bold"
  },

  participantCount: {
    paddingBottom: "7px",
    color: "#aaa"
  },

  durationRemaining: {
    color: "#aaa"
  },

  progressWrapper: {
    height: "100%",
    flex: "3"
  },

  progress: {
    height: "100%"
  },

  privateIcon: {
    fontSize: "12px"
  }
}));

type Props = {
  mission: Mission;
};

export default function MissionThumbnail({ mission }: Props) {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const textDurationRemaining = getTextDurationBetweenTimes(
    Date.now(),
    mission.endTime
  );

  const wrapperElement = useRef(null);

  const percentage = (mission.totalPieces / mission.targetPieces) * 100;

  const imgSrc = mission.coverPhotoUrl || thumbnailBackup;

  return (
    <div
      className={classes.missionThumbnail}
      ref={wrapperElement}
      onClick={() => history.push(linkToMission(mission.id.toString()))}
    >
      <div className={classes.pictureWrapper}>
        <img src={imgSrc} className={classes.picture} />
      </div>
      <div className={classes.textSection}>
        <div className={classes.name}>
          {mission.isPrivate && (
            <LockOpenIcon fontSize={"small"} className={classes.privateIcon} />
          )}{" "}
          {mission.name}
        </div>
        <div className={classes.participantCount}>
          {mission.totalUserPieces?.length || 0} participants
        </div>
        <div className={classes.durationRemaining}>{textDurationRemaining}</div>
      </div>
      <div className={classes.progressWrapper}>
        <CircularProgressbar
          value={percentage}
          text={`${Math.floor(percentage)}%`}
          className={classes.progress}
          styles={buildStyles({
            strokeLinecap: "round", // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
            pathTransitionDuration: 0.5, // How long animation takes to go from one percentage to another, in seconds
            pathColor: theme.palette.primary.main,
            textColor: theme.palette.primary.main,
            trailColor: "#eee",
            textSize: "28px"
          })}
        />
      </div>
    </div>
  );
}
