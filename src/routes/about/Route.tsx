import React from "react";
import AboutPage from "pages/about";

type Props = {
  reloadPhotos: () => void;
  handleClose: () => void;
  sponsorImage?: string;
};

export default function AboutPageRoute(props: Props) {
  return <AboutPage {...props} />;
}
