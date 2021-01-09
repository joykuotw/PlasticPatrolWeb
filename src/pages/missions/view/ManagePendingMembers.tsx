import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import "react-circular-progressbar/dist/styles.css";
import { useHistory } from "react-router";
import Button from "@material-ui/core/Button";
import { useParams } from "react-router-dom";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import {
  approveNewMember,
  rejectNewMember
} from "../../../features/firebase/missions";
import { useMissions } from "../../../providers/MissionsProvider";
import { PendingUser } from "../../../types/Missions";
import { useUser } from "../../../providers/UserProvider";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: "flex",
    flexFlow: "column",
    padding: "5%"
  },
  memberWrapper: {
    display: "flex",
    flexDirection: "row",
    paddingBottom: "20px"
  },
  memberNameWrapper: {
    flex: 1,
    flexGrow: 1,
    overflow: "hidden"
  },
  memberName: {},
  email: {
    fontSize: 10,
    wordWrap: "break-word"
  },
  approveButton: {
    flex: 0,
    marginRight: `${theme.spacing(1)}px`
  },
  rejectButton: {
    flex: 0
  },
  button: {
    textTransform: "none"
  }
}));

type Props = {};

export default function ManagePendingMembers({}: Props) {
  const classes = useStyles();
  const history = useHistory();
  const user = useUser();

  const missionData = useMissions();
  const missions = missionData?.missions || [];

  const { missionId } = useParams();
  const mission = missions.find((ch) => ch.id.toString() === missionId);
  if (mission === undefined) {
    const errorMessage = `Trying to manage pending mission members but couldn't find mission ${missionId} data in list.`;
    console.warn(errorMessage);
    return <div>{errorMessage}</div>;
  }

  const handleBack = () => history.goBack();

  return (
    <PageWrapper
      label={"Manage members"}
      navigationHandler={{ handleBack }}
      className={classes.wrapper}
    >
      {mission.pendingUsers.length === 0 ? (
        <div>
          There are currently no users who have requested to join this mission.
        </div>
      ) : (
        mission.pendingUsers.map((pendingUser: PendingUser) => (
          <div className={classes.memberWrapper} key={pendingUser.uid}>
            <div className={classes.memberNameWrapper}>
              <div className={classes.memberName}>
                {pendingUser.displayName}
              </div>
              <div className={classes.email}>{pendingUser.email}</div>
            </div>
            <div className={classes.approveButton}>
              <Button
                className={classes.button}
                onClick={async () => {
                  await approveNewMember(mission.id, pendingUser);
                  await missionData?.refresh();
                }}
                color="default"
                size="small"
                variant="outlined"
              >
                Approve
                <CheckIcon fontSize={"small"} style={{ color: "green" }} />
              </Button>
            </div>
            <div className={classes.rejectButton}>
              <Button
                className={classes.button}
                onClick={async () => {
                  await rejectNewMember(pendingUser.uid, mission.id);
                  await missionData?.refresh();
                }}
                color="default"
                size="small"
                variant="outlined"
              >
                Reject <CloseIcon fontSize={"small"} style={{ color: "red" }} />
              </Button>
            </div>
          </div>
        ))
      )}
    </PageWrapper>
  );
}
