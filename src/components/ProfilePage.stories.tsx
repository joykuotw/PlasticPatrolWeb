import React from "react";

import ProfilePage from "./ProfilePage";
import User from "types/User";
import Geojson from "types/Geojson";
import Feature from "types/Feature";
import config, { Metadata } from "custom/config";
import { ownerWindow } from "@material-ui/core";
import { Router } from "react-router-dom";
import { MemoryRouter } from "react-router";

export default { title: "ProfilePage", component: ProfilePage };

const metadata: Metadata = {
  metadataServerUrl: "",
  serverUrl: "",
  twSite: "",
  twCreator: "",
  twDomain: "",
  _twDescriptionField: "",
  twDescription: "",
  twTitle: ""
};

const user: User = {
  id: "user-1",
  displayName: "Alfred Test",
  isModerator: false,
  email: "test@test.com",
  emailVerified: true,
  isAnonymous: true,
  phoneNumber: "19175551919",
  photoURL: "",
  description: "some thing",
  location: undefined,
  profileURL: ""
};

const makeFeature = (ownerId: string, pictureId: string): Feature => {
  const feature: Feature = {
    feature: "Feature",
    geometry: {
      type: "Point",
      coordinates: [0, 0]
    },
    properties: {
      id: pictureId,
      main: "",
      thumbnail: "",
      updated: "",
      moderated: new Date(),
      owner_id: ownerId,
      pieces: 10
    }
  };
  return feature;
};

const geojson: Geojson = {
  type: "FeatureCollection",
  features: Array.from({ length: 100 }).map(() =>
    makeFeature(user.id, "pictureId-1")
  )
};

const props = {
  user,
  label: "blah",
  geojson,
  handlePhotoClick: () => {},
  handleClose: () => {},
  config: config
};

export const Default = () => (
  <MemoryRouter initialEntries={["/"]}>
    <ProfilePage {...props} />
  </MemoryRouter>
);
