import React from "react";
import {makeStyles} from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import 'react-circular-progressbar/dist/styles.css';
import {useHistory} from "react-router";
import ChallengeThumbnail from "../ChallengeThumbnail";
import { Challenge } from "../../../types/Challenges";
import Button from "@material-ui/core/Button";
import { likeToManagePendingMembers } from "../../../routes/challenges/links";
import { useParams } from "react-router-dom";
import { approveNewMember, rejectNewMember } from "../../../providers/ChallengesProvider";

const useStyles = makeStyles((theme) => ({
    wrapper: {
        display: "flex",
        flexFlow: "column",
        padding: "5%",
    },
    memberWrapper: {
        display: "flex",
        flexDirection: "row",
        paddingBottom: "20px",
    },
    memberName: {
        flex: 1,
        flexGrow: 1,
        paddingTop: `${theme.spacing(1)}px`,
        overflow: "hidden",
    },
    approveButton: {
        flex: 0,
    },
    rejectButton: {
        flex: 0,
    },
}));

type Props = {
    challenges: Challenge[];
};

export default function ManagePendingMembers({challenges}: Props) {
    const classes = useStyles();
    const history = useHistory();

    const {challengeId} = useParams();
    const challenge = challenges.find(ch => ch.id.toString() === challengeId);
    if (challenge === undefined) {
        const errorMessage = `Trying to manage pending challenge members but couldn't find challenge ${challengeId} data in list.`;
        console.warn(errorMessage);
        return <div>{errorMessage}</div>;
    }

    const handleBack = () => history.goBack();

    return (
        <PageWrapper label={"Approve challenge members"}
                     navigationHandler={{handleBack}}
                     className={classes.wrapper}>
            {challenge.pendingUserIds.map(pendingUser =>
              <div className={classes.memberWrapper} key={pendingUser.uid}>
                  <div className={classes.memberName}>
                      {pendingUser.displayName}
                  </div>
                  <div className={classes.approveButton}>
                      <Button onClick={() => approveNewMember(pendingUser.uid, challenge.id)}
                              color="primary"
                              variant="contained">
                          Approve
                      </Button>
                  </div>
                  <div className={classes.rejectButton}>
                      <Button onClick={() => rejectNewMember(pendingUser.uid, challenge.id)}
                              color="secondary"
                              variant="contained">
                          Reject
                      </Button>
                  </div>
              </div>
            )}
        </PageWrapper>
    );
}
