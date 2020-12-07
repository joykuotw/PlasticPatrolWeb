import React from "react";
import {
  ChallengePage,
  ChallengesHome,
  CreateChallenge,
  EditChallenge
} from "pages/challenges";
import {
  linkToManagePendingMembers,
  linkToChallenge,
  linkToChallengesPage,
  linkToCreateChallenge,
  linkToEditChallenge
} from "./links";
import { Route, Switch } from "react-router-dom";
import { useHistory } from "react-router";
import ManagePendingMembers from "../../pages/challenges/view/ManagePendingMembers";
import User from "../../types/User";

type Props = {};

export default function ChallengesRoute({}: Props) {
  const history = useHistory();
  return (
    <Switch>
      <Route exact path={linkToChallengesPage()}>
        <ChallengesHome />
      </Route>
      <Route path={linkToCreateChallenge()}>
        <CreateChallenge />
      </Route>
      <Route path={linkToManagePendingMembers()}>
        <ManagePendingMembers />
      </Route>
      <Route path={linkToEditChallenge()}>
        <EditChallenge />
      </Route>
      <Route path={linkToChallenge()}>
        <ChallengePage />
      </Route>
    </Switch>
  );
}
