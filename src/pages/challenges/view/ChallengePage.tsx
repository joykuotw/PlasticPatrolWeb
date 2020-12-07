import React, { useContext, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import "react-circular-progressbar/dist/styles.css";
import { useHistory, useParams } from "react-router-dom";

import Button from "@material-ui/core/Button";
import { UserPieceRankTable } from "../../../components/Leaderboard";
import { Line } from "rc-progress";
import {
  linkToManagePendingMembers,
  linkToEditChallenge,
  linkToChallengesPage
} from "../../../routes/challenges/links";
import { UserLeaderboardData } from "../../../components/Leaderboard/UserPieceRankTable";
import {
  joinChallenge,
  challengeHasEnded,
  leaveChallenge,
  deleteChallenge
} from "../../../features/firebase/challenges";
import User from "../../../types/User";
import {
  ChallengesProviderData,
  useChallenges
} from "../../../providers/ChallengesProvider";
import { useUser } from "../../../providers/UserProvider";
import thumbnailBackup from "../../../assets/images/challenge-thumbnail-backup.png";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: "flex",
    flexFlow: "column"
  },

  pictureWrapper: {
    flex: "0 0 auto",
    height: "200px",
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

type Props = {};

export default function ChallengePage({}: Props) {
  const classes = useStyles();
  const themes = useTheme();
  const user = useUser();

  const history = useHistory();
  const handleBack = () => history.goBack();

  const challengeData = useChallenges();
  const challenges = challengeData?.challenges || [];

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { challengeId } = useParams();
  const challenge = challenges.find((ch) => ch.id.toString() === challengeId);
  if (challenge === undefined) {
    return <div>Could not find challenge</div>;
  }

  const challengeProgress =
    (challenge.totalPieces / challenge.targetPieces) * 100;

  const userLoggedIn: boolean = user !== undefined && user.id !== undefined;
  const userChallengeData = challenge.totalUserPieces[user?.id || -1];
  const userInChallenge: boolean = userChallengeData !== undefined;
  const userIsModerator: boolean = user?.isModerator || false;
  const userIsChallengeOwner: boolean = user?.id === challenge.ownerUserId;
  const userCanManageChallenge: boolean =
    userIsChallengeOwner || userIsModerator;

  const usersLeaderboard: UserLeaderboardData[] = Object.values(
    challenge.totalUserPieces || []
  );

  const shareChallenge = () => {};

  const imgSrc = challenge.coverPhotoUrl || thumbnailBackup;

  console.log(challenge);
  console.log(user);

  const leaveChallengeSubmit = async () => {
    await leaveChallenge(challengeId, user);
    challengeData?.refresh();
    history.push(linkToChallengesPage());
  };

  const deleteChallengeSubmit = async () => {
    await deleteChallenge(challengeId);
    challengeData?.refresh();
    history.push(linkToChallengesPage());
  };

  return (
    <PageWrapper
      label={challenge.name}
      navigationHandler={{ handleBack }}
      className={classes.wrapper}
    >
      <div className={classes.pictureWrapper}>
        <img src={imgSrc} alt={"Mission cover"} className={classes.picture} />
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
          {userLoggedIn && !userInChallenge && !challengeHasEnded(challenge) && (
            <div className={classes.challengeButton}>
              <Button
                onClick={() => joinChallenge(challenge.id, user)}
                color="primary"
                size="small"
                variant="contained"
              >
                Join challenge
              </Button>
            </div>
          )}
          {userLoggedIn &&
            userInChallenge &&
            !challengeHasEnded(challenge) &&
            !userIsChallengeOwner && (
              <div className={classes.challengeButton}>
                <Button
                  onClick={() => setShowLeaveModal(true)}
                  color="primary"
                  size="small"
                  variant="contained"
                >
                  Leave challenge
                </Button>
              </div>
            )}
          {userLoggedIn &&
            userInChallenge &&
            !challengeHasEnded(challenge) &&
            userIsChallengeOwner && (
              <div className={classes.challengeButton}>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  color="primary"
                  size="small"
                  variant="contained"
                >
                  Delete challenge
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
            challenge.pendingUsers.length > 0 && (
              <div className={classes.challengeButton}>
                <Button
                  onClick={() => {
                    history.push(linkToManagePendingMembers(challengeId));
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
        <UserPieceRankTable
          usersLeaderboard={usersLeaderboard}
          user={user}
          allowZeroPieces={true}
        />
      </div>
      <Modal
        isOpen={showLeaveModal}
        text={
          "Are you sure you want to leave this challenge? " +
          "You're pieces collected will remain in the leaderboard, but none of your new uploads will contribute to this challenge. " +
          "If it's a public challenge, you can rejoin at any time. " +
          "If it's a private challenge, you'll need to request to rejoin."
        }
        confirmText={"Leave Challenge"}
        handleConfirm={leaveChallengeSubmit}
        handleCancel={() => setShowLeaveModal(false)}
      />
      <Modal
        isOpen={showDeleteModal}
        text={
          "Are you sure you want to delete this challenge? You'll need to ask Planet Patrol staff to retrieve it."
        }
        confirmText={"Delete Challenge"}
        handleConfirm={deleteChallengeSubmit}
        handleCancel={() => setShowDeleteModal(false)}
      />
    </PageWrapper>
  );
}

type ModalProps = {
  isOpen: boolean;
  text: string;
  confirmText: string;
  handleConfirm: () => void;
  handleCancel: () => void;
};

const Modal = ({
  isOpen,
  text,
  confirmText,
  handleConfirm,
  handleCancel
}: ModalProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={() => handleCancel()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(e) => {
            handleCancel();
          }}
          color="default"
        >
          Cancel
        </Button>
        <Button
          onClick={(e) => {
            handleConfirm();
          }}
          color="secondary"
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
