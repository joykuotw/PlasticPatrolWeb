import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import { Challenge } from "../../../types/Challenges";
import "react-circular-progressbar/dist/styles.css";
import { Route, Switch, useHistory, useParams } from "react-router-dom";

import Button from "@material-ui/core/Button";
import { UserPieceRankTable } from "../../../components/Leaderboard";
import { Line } from "rc-progress";
import {
  likeToManagePendingMembers,
  linkToEditChallenge
} from "../../../routes/challenges/links";
import { UserLeaderboardData } from "../../../components/Leaderboard/UserPieceRankTable";
import User from "../../../types/User";
import { joinChallenge } from "../../../providers/ChallengesProvider";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: "flex",
    flexFlow: "column"
  },

  pictureWrapper: {
    flex: "0 0 auto",
    height: "150px",
    overflow: "hidden",
    textAlign: "center",
    marginBottom: `${theme.spacing(0.5)}px`
  },

  picture: {
    objectFit: "cover",
    width: "100%"
  },

  detailWrapper: {
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column"
  },

  description: {
    flex: "1 1 auto",
    padding: `${theme.spacing(0.5)}px ${theme.spacing(1.5)}px`,
    fontSize: 13
  },

  progressWrapper: {
    padding: `${theme.spacing(0.5)}px ${theme.spacing(1.5)}px`
  },

  progressText: {
    color: "black",
    fontSize: 13,
    fontWeight: "bold"
  },

  buttonsWrapper: {
    marginLeft: `${theme.spacing(1)}px`,
    marginRight: `${theme.spacing(1)}px`,
    marginBottom: `${theme.spacing(1)}px`,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center"
  },

  notLoggedInMessage: {
    color: `${theme.palette.primary.main}`,
    padding: `0 ${theme.spacing(0.5)}px`
  },

  challengeButton: {
    margin: `${theme.spacing(1)}px ${theme.spacing(0.5)}px`
  },

  tableWrapper: {
    flex: "1 1 auto"
  }
}));

type Props = {
  user: User;
  challenges: Challenge[];
};

export default function ChallengePage({ user, challenges }: Props) {
  const classes = useStyles();
  const themes = useTheme();

  const history = useHistory();
  const handleBack = () => history.goBack();

  const { challengeId } = useParams();
  const challenge = challenges.find((ch) => ch.id.toString() === challengeId);
  if (challenge === undefined) {
    return <div>Could not find challenge</div>;
  }

  const challengeProgress =
    (challenge.totalPieces / challenge.targetPieces) * 100;

  const userLoggedIn = true; //user && user.id !== undefined;
  const userChallengeData = challenge.totalUserPieces.find(
    (challengeUser) => challengeUser.uid == user?.id
  );
  const userInChallenge: boolean = true;
  //userLoggedIn && userChallengeData !== undefined;
  const userIsModerator: boolean = true;
  //userLoggedIn && user.isModerator;
  const userIsChallengeOwner: boolean = true;
  // userInChallenge && user.id == challenge.ownerUserId;
  const userCanManageChallenge: boolean =
    userIsChallengeOwner || userIsModerator;

  const usersLeaderboard: UserLeaderboardData[] = challenge.totalUserPieces;

  const shareChallenge = () => {};

  return (
    <PageWrapper
      label={challenge.name}
      navigationHandler={{ handleBack }}
      className={classes.wrapper}
    >
      <div className={classes.pictureWrapper}>
        <img src={challenge.coverPhoto?.imgSrc} className={classes.picture} />
      </div>
      <div className={classes.detailWrapper}>
        <div className={classes.description}>{challenge.description}</div>
        <div className={classes.progressWrapper}>
          <div className={classes.progressText}>
            {challenge.totalPieces}/{challenge.targetPieces} pieces of litter
            collected so far!
          </div>
          <Line
            percent={challengeProgress}
            strokeWidth={2}
            trailWidth={2}
            strokeColor={themes.palette.secondary.main}
          />
        </div>
        <div className={classes.buttonsWrapper}>
          {!userLoggedIn && (
            <div className={classes.notLoggedInMessage}>
              Before you can join a challenge, you’ll have to create a Planet
              Patrol account, or login to an existing account.
            </div>
          )}
          {userLoggedIn && !userInChallenge && (
            <div className={classes.challengeButton}>
              <Button
                onClick={() => joinChallenge(user.id, challenge.id)}
                color="primary"
                size="small"
                variant="contained"
              >
                Join challenge
              </Button>
            </div>
          )}
          {userLoggedIn && userInChallenge && (
            <div className={classes.challengeButton}>
              <Button
                onClick={shareChallenge}
                color="primary"
                size="small"
                variant="contained"
              >
                Share link
              </Button>
            </div>
          )}
          {userLoggedIn &&
            userCanManageChallenge &&
            challenge.pendingUserIds.length > 0 && (
              <div className={classes.challengeButton}>
                <Button
                  onClick={() => {
                    history.push(likeToManagePendingMembers(challengeId));
                  }}
                  color="primary"
                  size="small"
                  variant="contained"
                >
                  Manage members
                </Button>
              </div>
            )}
          {userCanManageChallenge && (
            <div className={classes.challengeButton}>
              <Button
                onClick={() => {
                  history.push(linkToEditChallenge(challengeId));
                }}
                color="primary"
                size="small"
                variant="contained"
              >
                Edit details
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className={classes.tableWrapper}>
        <UserPieceRankTable usersLeaderboard={usersLeaderboard} user={user} />
      </div>
    </PageWrapper>
  );
}
