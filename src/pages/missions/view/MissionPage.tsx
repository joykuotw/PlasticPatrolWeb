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
  linkToEditMission,
  linkToMissionsPage
} from "../../../routes/missions/links";
import { UserLeaderboardData } from "../../../components/Leaderboard/UserPieceRankTable";
import {
  joinMission,
  missionHasEnded,
  leaveMission,
  deleteMission
} from "../../../features/firebase/missions";
import { useMissions } from "../../../providers/MissionsProvider";
import { useUser } from "../../../providers/UserProvider";
import thumbnailBackup from "../../../assets/images/mission-thumbnail-backup.png";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText
} from "@material-ui/core";
import {
  isMissionFinished,
  userHasCollectedPiecesForMission,
  userIsInPendingMissionMembers,
  userIsInMission
} from "../../../types/Missions";
import authFirebase from "../../../features/firebase/authFirebase";

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

  missionButton: {
    margin: `${theme.spacing(1)}px ${theme.spacing(0.5)}px`
  },

  pendingRequestLabel: {
    fontSize: "14px"
  },

  tableWrapper: {
    flex: "1 1 auto"
  },

  hiddenTableLabel: {
    marginTop: "20px",
    padding: "20px",
    textAlign: "center",
    color: "grey"
  }
}));

type Props = {};

export default function MissionPage({}: Props) {
  const classes = useStyles();
  const themes = useTheme();
  const user = useUser();

  const history = useHistory();
  const handleBack = () => history.goBack();

  const missionData = useMissions();
  const missions = missionData?.missions || [];

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { missionId } = useParams();
  const mission = missions.find((ch) => ch.id.toString() === missionId);
  if (mission === undefined) {
    return <div>Could not find mission</div>;
  }

  const missionProgress = (mission.totalPieces / mission.targetPieces) * 100;

  const userId = user?.id || "-1";
  const userLoggedIn: boolean = user !== undefined;
  const userInMission: boolean =
    user !== undefined && userIsInMission(user, missionId);
  const userIsModerator: boolean = user?.isModerator || false;
  const userIsMissionOwner: boolean = user?.id === mission.ownerUserId;
  const userCanManageMission: boolean = userIsMissionOwner || userIsModerator;
  const userIsPendingMember: boolean = userIsInPendingMissionMembers(
    mission,
    userId
  );

  const usersLeaderboard: UserLeaderboardData[] = Object.values(
    mission.totalUserPieces || []
  );

  const shareMission = () => {};

  const imgSrc = mission.coverPhotoUrl || thumbnailBackup;

  const leaveMissionSubmit = async () => {
    await leaveMission(missionId, user);
    await missionData?.refresh();
    await authFirebase.reloadUser();
    history.push(linkToMissionsPage());
  };

  const deleteMissionSubmit = async () => {
    await deleteMission(missionId);
    await missionData?.refresh();
    history.push(linkToMissionsPage());
  };

  const pieceTotal = `${mission.totalPieces}/${mission.targetPieces}`;
  const progressText = isMissionFinished(mission)
    ? `This missions has finished, it managed to collect ${pieceTotal} pieces of litter!`
    : `${pieceTotal} pieces of litter collected so far!`;

  return (
    <PageWrapper
      label={mission.name}
      navigationHandler={{ handleBack }}
      className={classes.wrapper}
    >
      <div className={classes.pictureWrapper}>
        <img src={imgSrc} alt={"Mission cover"} className={classes.picture} />
      </div>
      <div className={classes.detailWrapper}>
        <div className={classes.description}>
          {`${new Date(mission.startTime).toLocaleDateString()} - ${new Date(
            mission.endTime
          ).toLocaleDateString()}`}
        </div>
        <div className={classes.description}>{mission.description}</div>
        <div className={classes.progressWrapper}>
          <div className={classes.progressText}>{progressText}</div>
          <Line
            percent={missionProgress}
            strokeWidth={2}
            trailWidth={2}
            strokeColor={themes.palette.secondary.main}
          />
        </div>
        <div className={classes.buttonsWrapper}>
          {!userLoggedIn && (
            <div className={classes.notLoggedInMessage}>
              Before you can join a mission, you’ll have to create a Planet
              Patrol account, or login to an existing account.
            </div>
          )}
          {userLoggedIn &&
            !userInMission &&
            !missionHasEnded(mission) &&
            (userIsPendingMember ? (
              <div className={classes.pendingRequestLabel}>
                Your request to join this mission needs to be approved by a
                moderator or mission owner.
              </div>
            ) : (
              <div className={classes.missionButton}>
                <Button
                  onClick={async () => {
                    await joinMission(mission.id, user);
                    await missionData?.refresh();
                  }}
                  color="primary"
                  size="small"
                  variant="contained"
                >
                  {userHasCollectedPiecesForMission(mission, userId)
                    ? `REJOIN MISSION`
                    : `JOIN MISSION`}
                </Button>
              </div>
            ))}
          {userLoggedIn && userInMission && (
            <div className={classes.missionButton}>
              <Button
                onClick={shareMission}
                color="primary"
                size="small"
                variant="contained"
              >
                Share link
              </Button>
            </div>
          )}
          {userLoggedIn &&
            userCanManageMission &&
            mission.pendingUsers.length > 0 && (
              <div className={classes.missionButton}>
                <Button
                  onClick={() => {
                    history.push(linkToManagePendingMembers(missionId));
                  }}
                  color="primary"
                  size="small"
                  variant="contained"
                >
                  Manage members
                </Button>
              </div>
            )}
          {userCanManageMission && (
            <div className={classes.missionButton}>
              <Button
                onClick={() => {
                  history.push(linkToEditMission(missionId));
                }}
                color="primary"
                size="small"
                variant="contained"
              >
                Edit details
              </Button>
            </div>
          )}
          {userLoggedIn &&
            userInMission &&
            !missionHasEnded(mission) &&
            !userIsMissionOwner && (
              <div className={classes.missionButton}>
                <Button
                  onClick={() => setShowLeaveModal(true)}
                  color="secondary"
                  size="small"
                  variant="outlined"
                >
                  Leave mission
                </Button>
              </div>
            )}
          {userLoggedIn &&
            userInMission &&
            !missionHasEnded(mission) &&
            userIsMissionOwner && (
              <div className={classes.missionButton}>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  color="secondary"
                  size="small"
                  variant="outlined"
                >
                  Delete mission
                </Button>
              </div>
            )}
        </div>
      </div>
      <div className={classes.tableWrapper}>
        {!mission.isPrivate ||
        (user && userHasCollectedPiecesForMission(mission, user.id)) ||
        user?.isModerator ? (
          <UserPieceRankTable
            usersLeaderboard={usersLeaderboard}
            user={user}
            allowZeroPieces={true}
          />
        ) : (
          <div className={classes.hiddenTableLabel}>
            You need to join and be accepted into the mission to view the
            leaderboard.
          </div>
        )}
      </div>
      <Modal
        isOpen={showLeaveModal}
        text={
          "Are you sure you want to leave this mission? " +
          "You're pieces collected will remain in the leaderboard, but none of your new uploads will contribute to this mission. " +
          "If it's a public mission, you can rejoin at any time. " +
          "If it's a private mission, you'll need to request to rejoin."
        }
        confirmText={"Leave Mission"}
        handleConfirm={leaveMissionSubmit}
        handleCancel={() => setShowLeaveModal(false)}
      />
      <Modal
        isOpen={showDeleteModal}
        text={
          "Are you sure you want to delete this mission? You'll need to ask Planet Patrol staff to retrieve it."
        }
        confirmText={"Delete Mission"}
        handleConfirm={deleteMissionSubmit}
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
