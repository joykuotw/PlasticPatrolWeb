import React from "react";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import PhotoFields from "./PhotoFields";

export default { title: "ModeratingPhotoFields", component: PhotoFields };

const dataProps = {
  photo: {
    imgSrc:
      "https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg?cs=srgb&dl=assorted-plastic-bottles-802221.jpg&fm=jpg",
    id: "jsdfsdfsdfs",
    main: "main",
    thumbnail:
      "https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg?cs=srgb&dl=assorted-plastic-bottles-802221.jpg&fm=jpg",
    updated: new Date(),
    moderated: new Date(),
    owner_id: "020xjsdf",
    pieces: 20,
    location: new firebase.firestore.GeoPoint(0, 0),
    published: true,
    categories: [
      {
        number: 10,
        brand: "Coke",
        label: "Plastic Bottle",
        error: false
      }
    ],
    missions: []
  }
};

export const Default = () => <PhotoFields {...dataProps} />;
