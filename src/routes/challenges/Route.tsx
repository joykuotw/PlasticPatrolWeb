import React from "react";
import { ChallengePage, ChallengesHome, CreateChallenge, EditChallenge } from "pages/challenges";
import {Challenge} from "../../types/Challenges";
import {
  likeToManagePendingMembers,
  linkToChallenge,
  linkToChallengesPage,
  linkToCreateChallenge,
  linkToEditChallenge
} from "./links";
import {Route, Switch} from "react-router-dom";
import {useHistory} from "react-router";
import ManagePendingMembers from "../../pages/challenges/view/ManagePendingMembers";
import User from "../../types/User";

type Props = {
    user: User;
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
                <CreateChallenge user={user}/>
            </Route>
            <Route path={likeToManagePendingMembers()}>
                <ManagePendingMembers challenges={challenges}/>
            </Route>
            <Route path={linkToEditChallenge()}>
                <EditChallenge challenges={challenges}/>
            </Route>
            <Route path={linkToChallenge()}>
                <ChallengePage user={user}
                               challenges={challenges}/>
            </Route>
        </Switch>
    );
}
