import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import "react-circular-progressbar/dist/styles.css";
import { useHistory } from "react-router";
import ChallengeThumbnail from "../ChallengeThumbnail";
import { Challenge } from "../../../types/Challenges";
import Button from "@material-ui/core/Button";
import { likeToManagePendingMembers } from "../../../routes/challenges/links";
import { useParams } from "react-router-dom";
import {
  approveNewMember,
  rejectNewMember
} from "../../../providers/ChallengesProvider";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";

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

type Props = {
  challenges: Challenge[];
};

export default function ManagePendingMembers({ challenges }: Props) {
  const classes = useStyles();
  const history = useHistory();

  const { challengeId } = useParams();
  const challenge = challenges.find((ch) => ch.id.toString() === challengeId);
  if (challenge === undefined) {
    const errorMessage = `Trying to manage pending challenge members but couldn't find challenge ${challengeId} data in list.`;
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
      {challenge.pendingUserIds.length === 0 ? (
        <div>
          There are currently no users who have requested to join this
          challenge.
        </div>
      ) : (
        challenge.pendingUserIds.map((pendingUser) => (
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
                onClick={() => approveNewMember(pendingUser.uid, challenge.id)}
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
                onClick={() => rejectNewMember(pendingUser.uid, challenge.id)}
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
