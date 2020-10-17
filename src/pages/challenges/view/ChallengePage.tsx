import React from "react";
import {makeStyles, useTheme} from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import { Challenge } from "../../../types/Challenges";
import 'react-circular-progressbar/dist/styles.css';
import { Route, Switch, useHistory, useParams } from "react-router-dom";

import Button from "@material-ui/core/Button";
import {UserPieceRankTable} from "../../../components/Leaderboard";
import {Line} from 'rc-progress';
import { likeToManagePendingMembers, linkToEditChallenge } from "../../../routes/challenges/links";
import { UserLeaderboardData } from "../../../components/Leaderboard/UserPieceRankTable";
import User from "../../../types/User";
import { joinChallenge } from "../../../providers/ChallengesProvider";

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
        marginLeft: `${theme.spacing(1)}px`,
        marginRight: `${theme.spacing(1)}px`,
        paddingBottom: `${theme.spacing(2)}px`,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
    },

    challengeButton: {
        margin: "0 3px",
        flex: 0,
    },

    tableWrapper: {
        flex: "1 1 auto",
    }
}));

type Props = {
    user: User;
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

    const userLoggedIn = user && user.id !== undefined;
    const userChallengeData = challenge.totalUserPieces.find(challengeUser => challengeUser.uid == user?.id);
    const userInChallenge: boolean = userLoggedIn && /* userLoggedIn && (userChallengeData !== undefined) */ true;
    const userIsModerator: boolean = /* userLoggedIn && user.isModerator */ true;
    const userIsChallengeOwner: boolean = userInChallenge && (user.id == challenge.ownerUserId);
    const userCanManageChallenge: boolean = userIsChallengeOwner || userIsModerator;

    const usersLeaderboard: UserLeaderboardData[] = challenge.totalUserPieces;

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
                          <Button onClick={() => joinChallenge(user.id, challenge.id)}
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
                    {userLoggedIn && userCanManageChallenge && challenge.pendingUserIds.length > 0 && (
                      <div className={classes.challengeButton}>
                          <Button onClick={() => {history.push(likeToManagePendingMembers(challengeId))}}
                                  color="primary"
                                  variant="contained">
                              Manage members
                          </Button>
                      </div>
                    )}
                    {userCanManageChallenge && (
                      <div className={classes.challengeButton}>
                          <Button onClick={() => {history.push(linkToEditChallenge(challengeId))}}
                                  color="primary"
                                  variant="contained">
                              Edit challenge
                          </Button>
                      </div>
                    )}
                </div>
            </div>
            <div className={classes.tableWrapper}>
                <UserPieceRankTable usersLeaderboard={usersLeaderboard}
                                    user={user}/>
            </div>
        </PageWrapper>
    );
}
