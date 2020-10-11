import React from "react";
import {makeStyles} from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import 'react-circular-progressbar/dist/styles.css';
import {useHistory} from "react-router";
import ChallengeThumbnail from "../ChallengeThumbnail";
import { Challenge } from "../../../types/Challenges";
import Button from "@material-ui/core/Button";
import { linkToApproveNewChallengerMembers } from "../../../routes/challenges/links";
import { useParams } from "react-router-dom";

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
        overflow: "hidden",
    },
    approveButton: {
        flex: 0,
        padding: "0 10px",
    },
    rejectButton: {
        flex: 0,
        padding: "0 10px",
    },
}));

type Props = {
    challenges: Challenge[];
};

export default function ApproveNewChallengeMembers({challenges}: Props) {
    const classes = useStyles();
    const history = useHistory();

    const {challengeId} = useParams();
    const challenge = challenges.find(ch => ch.id.toString() === challengeId);
    if (challenge === undefined) {
        return <div>asdfasd not find challenge data</div>
    }

    const handleBack = () => history.goBack();

    return (
        <PageWrapper label={"Approve challenge members"}
                     navigationHandler={{handleBack}}
                     className={classes.wrapper}>
            {challenge.pendingUserIds.map(pendingUser =>
              <div className={classes.memberWrapper} key={pendingUser}>
                  <div className={classes.memberName}>{pendingUser}</div>
                  <div className={classes.approveButton}>
                      <Button onClick={() => {console.log(`Approve new challenger ${pendingUser}`)}}
                              color="primary"
                              variant="contained">
                          Approve
                      </Button>
                  </div>
                  <div className={classes.rejectButton}>
                      <Button onClick={() => {console.log(`Reject new challenger ${pendingUser}`)}}
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
