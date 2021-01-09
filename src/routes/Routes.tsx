import React from "react";
import { Switch, Route, useHistory } from "react-router-dom";

import config from "custom/config";

import User from "types/User";

import Groups from "components/Groups/GroupMain";
import GroupList from "components/Groups/GroupList";
import GroupAdd from "components/Groups/GroupAdd";
import ModeratorPage from "components/ModeratorPage";
import { Leaderboard } from "components/Leaderboard";
import WriteFeedbackPage from "components/WriteFeedbackPage";

import DisplayPhoto from "components/MapPage/DisplayPhoto";

import ModeratorRoute from "./components/ModeratorRoute";
import SignedInRoute from "./components/SignedInRoute";

import PhotoRoute from "./photo/Route";
import { linkToPhotoPage } from "./photo/links";

import UploadPhotoRoute from "./upload-success/Route";
import { linkToUploadSuccess } from "./upload-success/links";

import AboutPageRoute from "./about/Route";
import { linkToAboutPage } from "./about/links";

import FeedbackRoute from "./feedback-reports/Route";
import { linkToFeedbackReports } from "./feedback-reports/links";

import { linkToLogin } from "./login/links";
import LoginRoute from "./login/Route";

import TutorialPageRoute from "./tutorial/Route";
import { linkToTutorialPage } from "./tutorial/links";

import AccountPageRoute from "./account/Route";
import { linkToAccountPage } from "./account/links";
import { useStats } from "providers/StatsProvider";
import { linkToMissionsPage } from "./missions/links";
import MissionsRoute from "./missions/Route";

type Props = {
  user: User;
  reloadPhotos: () => void;
  gpsLocation: any;
  online: boolean;
  geojson: any;
  handlePhotoClick: () => void;
  selectedFeature: any;
  sponsorImage?: string;
};

export function Routes({
  user,
  reloadPhotos,
  gpsLocation,
  online,
  geojson,
  handlePhotoClick,
  selectedFeature,
  sponsorImage
}: Props) {
  const history = useHistory();

  const stats = useStats();
  return (
    <Switch>
      <Route path={linkToUploadSuccess()}>
        <UploadPhotoRoute
          totalNumberOfPieces={stats.pieces}
          sponsorImage={sponsorImage}
        />
      </Route>

      <Route path={linkToLogin()}>
        <LoginRoute />
      </Route>

      <Route path={linkToAboutPage()}>
        <AboutPageRoute
          handleClose={history.goBack}
          reloadPhotos={reloadPhotos}
          sponsorImage={sponsorImage}
        />
      </Route>

      <Route path={linkToTutorialPage()}>
        <TutorialPageRoute handleClose={history.goBack} />
      </Route>

      <Route path={config.PAGES.leaderboard.path}>
        <Leaderboard
          label={config.PAGES.leaderboard.label}
          usersLeaderboard={stats.users}
          handleClose={history.goBack}
          user={user}
        />
      </Route>

      <Route
        path={config.PAGES.groups.path}
        render={(props) => (
          <Groups
            {...props}
            config={config}
            label={config.PAGES.groups.label}
            handleClose={history.goBack}
          />
        )}
      />

      <Route
        path={config.PAGES.grouplist.path}
        render={(props) => (
          <GroupList
            {...props}
            config={config}
            label={config.PAGES.grouplist.label}
            groupsArray={["group1", "group2"]}
            handleClose={history.goBack}
          />
        )}
      />

      <Route
        path={config.PAGES.groupadd.path}
        render={(props) => (
          <GroupAdd
            {...props}
            config={config}
            label={config.PAGES.groupadd.label}
            handleClose={history.goBack}
          />
        )}
      />

      <Route path={linkToMissionsPage()}>
        <MissionsRoute />
      </Route>

      <ModeratorRoute path={config.PAGES.moderator.path} user={user}>
        <ModeratorPage
          user={user as User}
          label={config.PAGES.moderator.label}
          handleClose={history.goBack}
        />
      </ModeratorRoute>

      <ModeratorRoute path={linkToFeedbackReports()} user={user}>
        <FeedbackRoute user={user} />
      </ModeratorRoute>

      <Route path={linkToPhotoPage()}>
        <PhotoRoute />
      </Route>

      <SignedInRoute path={linkToAccountPage()} user={user}>
        <AccountPageRoute
          config={config}
          user={user}
          geojson={geojson}
          handleClose={history.goBack}
          handlePhotoClick={handlePhotoClick}
        />
      </SignedInRoute>

      <Route path={config.PAGES.writeFeedback.path}>
        <WriteFeedbackPage
          label={config.PAGES.writeFeedback.label}
          user={user}
          location={gpsLocation}
          online={online}
          handleClose={history.goBack}
        />
      </Route>

      <Route
        path={[
          `${config.PAGES.displayPhoto.path}/:id`,
          `${config.PAGES.embeddable.path}${config.PAGES.displayPhoto.path}/:id`
        ]}
        render={({ location }) => (
          <DisplayPhoto
            user={user}
            config={config}
            handleClose={history.goBack}
            feature={selectedFeature}
            location={location}
          />
        )}
      />
    </Switch>
  );
}
