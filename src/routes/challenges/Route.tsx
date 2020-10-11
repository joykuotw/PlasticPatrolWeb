import React from "react";
import {ChallengePage, ChallengesHome, CreateChallenge} from "pages/challenges";
import {Challenge} from "../../types/Challenges";
import {linkToApproveNewChallengerMembers, linkToChallenge, linkToChallengesPage, linkToCreateChallenge} from "./links";
import {Route, Switch} from "react-router-dom";
import {useHistory} from "react-router";
import ApproveNewChallengeMembers from "../../pages/challenges/view/ApproveNewChallengeMembers";

type Props = {
    user: { id?: string };
    challenges: Challenge[];
};

export default function ChallengesRoute({user, challenges}: Props) {
    const history = useHistory();
    const handleClose = () => history.goBack();
    return (
        <Switch>
            <Route exact path={linkToChallengesPage()}>
                <ChallengesHome challenges={challenges}/>
            </Route>

            <Route path={linkToCreateChallenge()}>
                <CreateChallenge/>
            </Route>

            <Route path={linkToApproveNewChallengerMembers()}>
              <ApproveNewChallengeMembers challenges={challenges}/>
            </Route>

            <Route path={linkToChallenge()}>
                <ChallengePage user={user}
                               challenges={challenges}/>
            </Route>

        </Switch>
    );
}
