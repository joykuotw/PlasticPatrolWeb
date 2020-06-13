import React from "react";

import globe from "assets/images/intro/globe.png";
import logo from "assets/images/plasticPatrolLogoWhite.png";

import "./FirstSlide.scss";

export default function FirstSlide() {
  return (
    <div className="FirstSlide__container">
      <img src={logo} className="FirstSlide__logo" alt="" />
      <p className="FirstSlide__welcomeText">
        Welcome to the global movement to clean up the planet
      </p>
      <img src={globe} className="FirstSlide__globe" alt=""></img>
      <p className="FirstSlide__bottomText">Track + map rubbish</p>
    </div>
  );
}
