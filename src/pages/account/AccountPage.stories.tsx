import React from "react";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import "firebase/performance";
// import 'firebase/messaging';
// import 'firebase/functions';
import "firebase/storage";
import "firebase/analytics";

import ProfilePage from "./AccountPage";
import User from "types/User";
import Geojson from "types/Geojson";
import Feature from "types/Feature";
import config, { Metadata } from "custom/config";

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
  isAnonymous: true,
  phoneNumber: "19175551919",
  photoURL: "",
  description: "some thing",
  location: undefined,
  profileURL: "",
  challenges: []
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
      updated: new Date(),
      moderated: new Date(),
      owner_id: ownerId,
      pieces: 10,
      location: new firebase.firestore.GeoPoint(0, 0),
      published: true,
      categories: [],
      challenges: []
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
