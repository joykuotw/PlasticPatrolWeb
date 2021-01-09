import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import Snackbar from "@material-ui/core/Snackbar";
import { withStyles } from "@material-ui/core/styles";

import { Routes } from "routes/Routes";

import { linkToNewPhoto } from "routes/photo/routes/new/links";
import getMapIsVisible from "utils/getMapIsVisible";
import {
  linkToLoginWithRedirectOnSuccess,
  linkToLogin
} from "routes/login/links";

import WelcomePage from "./pages/welcome";
import Map from "./components/MapPage/Map";
import DrawerContainer from "./components/DrawerContainer";
import TermsDialog from "./components/TermsDialog";

import MapLocation from "./types/MapLocation";
import config from "./custom/config";
import { extractPathnameParams } from "./providers/PhotosProvider";

import { gtagEvent } from "./gtag.js";
import "./App.scss";
import { signOut } from "./features/firebase/authFirebase";

const styles = (theme) => ({
  rootDialog: {
    padding: theme.spacing(2),
    margin: 0
  },
  dialogClose: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1)
  }
});

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      leftDrawerOpen: false,
      mapLocation: new MapLocation()
    };

    this.domRefInput = {};
  }

  async componentDidMount() {
    let { mapLocation } = extractPathnameParams(this.props.location);
    this.setState({ mapLocation });
  }

  async componentWillUnmount() {
    // Terrible hack !!! it will be fixed with redux
    this.setState = console.log;
  }

  handleCameraClick = () => {
    if (config.SECURITY.UPLOAD_REQUIRES_LOGIN && !this.props.user) {
      this.props.history.push(
        linkToLoginWithRedirectOnSuccess(linkToNewPhoto())
      );
    } else {
      this.props.history.push(linkToNewPhoto());
    }
  };

  toggleLeftDrawer = (isItOpen) => () => {
    gtagEvent(isItOpen ? "Opened" : "Closed", "Menu");
    this.setState({ leftDrawerOpen: isItOpen });
  };

  handleMapLocationChange = (mapLocation) => {
    const { location } = this.props.history;
    if (!getMapIsVisible(location.pathname)) {
      return;
    }

    const currentMapLocation = extractPathnameParams(location).mapLocation;

    // change url coords if the coords are different and if we are in the map
    if (
      currentMapLocation == null ||
      !currentMapLocation.isEqual(mapLocation)
    ) {
      const currentUrl = this.props.location;
      const prefix = currentUrl.pathname.split("@")[0];
      const withSlash = prefix.endsWith("/") ? prefix : `${prefix}/`;
      const newUrl = `${withSlash}@${mapLocation.urlFormated()}`;
      this.props.history.replace(newUrl);
      this.setState({ mapLocation });
    }
  };

  handleLocationClick = () => {
    gtagEvent("Location FAB clicked", "Map");
    const { latitude, longitude } = this.props.gpsLocation;
    this.setState({
      mapLocation: new MapLocation(
        latitude,
        longitude,
        this.state.mapLocation.zoom
      )
    });
  };

  handlePhotoClick = (feature) => {
    const { history } = this.props;

    let pathname = `${config.PAGES.displayPhoto.path}/${feature.properties.id}`;
    const currentPath = history.location.pathname;

    const coordsUrl =
      currentPath.split("@")[1] ||
      new MapLocation(
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0],
        config.ZOOM_FLYTO
      ).urlFormated();
    pathname =
      currentPath === config.PAGES.embeddable.path
        ? currentPath + pathname
        : pathname;

    // if it is in map, change the url
    if (getMapIsVisible(history.location.pathname)) {
      history.replace(`${currentPath.split("@")[0]}@${coordsUrl}`);
    }

    history.push(`${pathname}@${coordsUrl}`);
  };

  handleClickLoginLogout = () => {
    if (this.props.user) {
      signOut();
    } else {
      this.props.history.push(linkToLogin());
    }
  };

  render() {
    const {
      user,
      history,
      gpsLocation,
      geojson,
      online,
      sponsorImage,
      selectedFeature
    } = this.props;
    const { leftDrawerOpen, mapLocation } = this.state;
    return (
      <div className="geovation-app">
        <TermsDialog />

        <main className="content">
          <WelcomePage />
          <Map
            history={history}
            visible={getMapIsVisible(history.location.pathname)}
            geojson={geojson}
            user={user}
            config={config}
            embeddable={history.location.pathname.match(
              new RegExp(config.PAGES.embeddable.path, "g")
            )}
            handleCameraClick={this.handleCameraClick}
            toggleLeftDrawer={this.toggleLeftDrawer}
            handlePhotoClick={this.handlePhotoClick}
            mapLocation={mapLocation}
            handleMapLocationChange={(newMapLocation) =>
              this.handleMapLocationChange(newMapLocation)
            }
            handleLocationClick={this.handleLocationClick}
            gpsOffline={!(gpsLocation && gpsLocation.online)}
            gpsDisabled={!(gpsLocation && gpsLocation.updated)}
          />
          <Routes
            user={user}
            gpsLocation={gpsLocation}
            online={online}
            geojson={geojson}
            reloadPhotos={this.reloadPhotos}
            handlePhotoClick={this.handlePhotoClick}
            selectedFeature={selectedFeature}
            sponsorImage={sponsorImage}
          />
        </main>

        <Snackbar open={!geojson} message="Loading photos..." />

        <DrawerContainer
          user={user}
          online={online}
          handleClickLoginLogout={this.handleClickLoginLogout}
          leftDrawerOpen={leftDrawerOpen}
          toggleLeftDrawer={this.toggleLeftDrawer}
          sponsorImage={sponsorImage}
        />
      </div>
    );
  }
}

export default withRouter(withStyles(styles, { withTheme: true })(App));
