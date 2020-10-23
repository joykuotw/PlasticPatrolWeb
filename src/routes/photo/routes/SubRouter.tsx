import React from "react";
import { Route, Redirect, Switch } from "react-router";

import { linkToNewPhoto } from "./new/links";
import NewPhotoRoute from "./new/Route";

import { linkToCategorise } from "./categorise/links";
import CategorisePhotoRoute from "./categorise/Route";

import { linkToGeotag } from "./geotag/links";
import GeoTagPhotoRoute from "./geotag/Route";

export default function PhotoPageSubRouter() {
  return (
    <Switch>
      <Route path={linkToCategorise()}>
        <CategorisePhotoRoute />
      </Route>
      <Route path={linkToGeotag()}>
        <GeoTagPhotoRoute />
      </Route>
      <Route path={linkToNewPhoto()}>
        <NewPhotoRoute />
      </Route>
      <Redirect to={linkToNewPhoto()} />
    </Switch>
  );
}
