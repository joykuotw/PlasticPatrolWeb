import { makeStyles, useTheme } from "@material-ui/core/styles";
import React, { useRef } from "react";
import { useHistory } from "react-router";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { linkToChallenge } from "../../routes/challenges/links";
import { Challenge } from "../../types/Challenges";
import LockOpenIcon from "@material-ui/icons/LockOpen";

import thumbnailBackup from "assets/images/challenge-thumbnail-backup.png";

const useStyles = makeStyles((theme) => ({
  challengeThumbnail: {
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
  challenge: Challenge;
};

export default function ChallengeThumbnail({ challenge }: Props) {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const textDurationRemaining = "10 minutes remaining";
  const wrapperElement = useRef(null);

  const percentage = (challenge.totalPieces / challenge.targetPieces) * 100;

  const imgSrc = challenge.coverPhotoUrl || thumbnailBackup;

  return (
    <div
      className={classes.challengeThumbnail}
      ref={wrapperElement}
      onClick={() => history.push(linkToChallenge(challenge.id.toString()))}
    >
      <div className={classes.pictureWrapper}>
        <img src={imgSrc} className={classes.picture} />
      </div>
      <div className={classes.textSection}>
        <div className={classes.name}>
          {challenge.isPrivate && (
            <LockOpenIcon fontSize={"small"} className={classes.privateIcon} />
          )}{" "}
          {challenge.name}
        </div>
        <div className={classes.participantCount}>
          {challenge.totalUserPieces?.length || 0} participants
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
