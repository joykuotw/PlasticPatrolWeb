import React from "react";
import {makeStyles, useTheme} from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import { Challenge } from "../../../types/Challenges";
import 'react-circular-progressbar/dist/styles.css';
import { Route, Switch, useHistory, useParams } from "react-router-dom";

import Button from "@material-ui/core/Button";
import {UserPieceRankTable} from "../../../components/Leaderboard";
import {Line} from 'rc-progress';
import { linkToApproveNewChallengerMembers } from "../../../routes/challenges/links";

const useStyles = makeStyles((theme) => ({
    wrapper: {
        display: "flex",
        flexFlow: "column",
    },

    pictureWrapper: {
        flex: "0 0 auto",
        height: "200px",
        overflow: "hidden",
        textAlign: "center"
    },

    picture: {
        objectFit: "cover",
        width: "100%",
    },

    detailWrapper: {
        flex: "0 0 auto",
        display: "flex",
        flexDirection: "column",
    },

    description: {
        flex: "1 1 auto",
        padding: `${theme.spacing(1)}px ${theme.spacing(1.5)}px`,
        fontSize: 13,
    },

    progressWrapper: {
        padding: `${theme.spacing(1)}px ${theme.spacing(1.5)}px`,
    },

    progressText: {
        color: "black",
        fontSize: 13,
        fontWeight: "bold",
    },

    buttonsWrapper: {
        width: "100%",
        paddingBottom: `${theme.spacing(2)}px`,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
    },

    challengeButton: {
        margin: "0 10px",
    },

    tableWrapper: {
        flex: "1 1 auto",
    }
}));

type Props = {
    user: { id?: string };
    challenges: Challenge[];
};

export default function ChallengePage({user, challenges}: Props) {
    const classes = useStyles();
    const themes = useTheme();

    const history = useHistory();
    const handleBack = () => history.goBack();

    const {challengeId} = useParams();
    const challenge = challenges.find(ch => ch.id.toString() === challengeId);
    if (challenge === undefined) {
        return <div>Could not find challenge</div>
    }

    const challengeProgress = (challenge.totalPieces / challenge.targetPieces) * 100;

    const userLoggedIn = user && user.id;
    const userChallengeData = challenge.totalUserPieces.find(challengeUser => challengeUser.uid == user?.id);
    //const userInChallenge: boolean = userChallengeData !== undefined;
    const userInChallenge: boolean = true;
    //const userIsModerator: boolean = userInChallenge && (userChallengeData?.isModerator || false);
    const userIsModerator: boolean = true;

    return (
        <PageWrapper label={challenge.name}
                     navigationHandler={{handleBack}}
                     className={classes.wrapper}>
            <div className={classes.pictureWrapper}>
                <img src={challenge.coverPhoto?.imgSrc} className={classes.picture}/>
            </div>
            <div className={classes.detailWrapper}>
                <div className={classes.description}>{challenge.description}</div>
                <div className={classes.progressWrapper}>
                    <div className={classes.progressText}>
                        {challenge.totalPieces}/{challenge.targetPieces} pieces of litter collected so far!
                    </div>
                    <Line percent={challengeProgress}
                          strokeWidth={2}
                          trailWidth={2}
                          strokeColor={themes.palette.secondary.main}/>
                </div>
                <div className={classes.buttonsWrapper}>
                    {userLoggedIn && !userInChallenge && (
                      <div className={classes.challengeButton}>
                          <Button onClick={() => {
                          }}
                                  color="primary"
                                  variant="contained">
                              Join challenge
                          </Button>
                      </div>
                    )}
                    {userLoggedIn && userInChallenge && (
                      <div className={classes.challengeButton}>
                          <Button onClick={() => {
                          }}
                                  color="primary"
                                  variant="contained">
                              Share challenge
                          </Button>
                      </div>
                    )}
                    {userLoggedIn && userIsModerator && challenge.pendingUserIds.length > 0 && (
                      <div className={classes.challengeButton}>
                          <Button onClick={() => {history.push(linkToApproveNewChallengerMembers(challenge.id.toString()))}}
                                  color="primary"
                                  variant="contained">
                              Approve new members
                          </Button>
                      </div>
                    )}
                    {/*{userLoggedIn && userIsModerator && (*/}
                    {/*  <div className={classes.challengeButton}>*/}
                    {/*      <Button onClick={() => {}}*/}
                    {/*              color="primary"*/}
                    {/*              variant="contained">*/}
                    {/*          Edit challenge*/}
                    {/*      </Button>*/}
                    {/*  </div>*/}
                    {/*)}*/}
                </div>
            </div>
            <div className={classes.tableWrapper}>
                <UserPieceRankTable usersLeaderboard={challenge.totalUserPieces.map(u => {displayName: u.uid, ...u})}
                                    user={user}/>
            </div>
        </PageWrapper>
    );
}
