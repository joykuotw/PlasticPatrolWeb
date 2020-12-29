import React, { useCallback, useContext } from "react";

import _ from "lodash";

import { Link } from "react-router-dom";

import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import PageWrapper from "../../components/PageWrapper";
import MapLocation from "../../types/MapLocation";
import Feature from "types/Feature";
import Geojson from "types/Geojson";
import Tooltip from "components/common/Tooltip";
import User from "types/User";
import { Config } from "custom/config";
import {
  MissionsContext,
  MissionsProviderData
} from "../../providers/MissionsProvider";
import MissionThumbnail from "../missions/MissionThumbnail";
import { linkToMissionsPage } from "../../routes/missions/links";

import styles from "standard.scss";
import {
  MissionFirestoreData,
  userOnMissionLeaderboard
} from "../../types/Missions";

const LARGE_COLLECTION_THRESHOLD = 1000;

const LARGE_UPLOAD_TOOLTIP =
  `Large uploads track any individual uploads ` +
  `that contain more than ${LARGE_COLLECTION_THRESHOLD} ` +
  `pieces. These are accounted for separately in the ` +
  `leaderboard and here in your account for bookkeeping purposes.`;

const useStyles = makeStyles((theme) => ({
  avatar: {
    margin: 10,
    height: 100,
    width: 100
  },
  row: {
    display: "flex",
    width: "100%"
  },
  wrapper: {
    alignItems: "center"
  },
  missionsWrapper: {
    alignItems: "left",
    width: "100%",
    boxSizing: "border-box",
    padding: 20
  },
  missionsTitle: {
    paddingBottom: 10
  },
  missionJoinPrompt: {
    paddingTop: 20,
    color: styles.darkGrey,
    fontWeight: "bold"
  },
  link: {
    color: theme.palette.primary.main
  }
}));

interface Props {
  user: User;
  geojson: Geojson;
  handlePhotoClick: (feature: Feature) => void;
  handleClose: () => void;
  config: Config;
}

export default function AccountPage({
  user,
  geojson,
  handlePhotoClick,
  handleClose,
  config
}: Props) {
  const classes = useStyles();

  const calcUrl = useCallback(
    (feature: Feature): string => {
      const mapLocation = new MapLocation(
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0],
        config.ZOOM_FLYTO
      );
      const urlFormated = mapLocation.urlFormated();
      return `${config.PAGES.displayPhoto.path}/${feature.properties.id}@${urlFormated}`;
    },
    [config]
  );

  const myPhotos =
    geojson &&
    geojson.features.filter((f) => f.properties.owner_id === user.id);
  const largeUploads = myPhotos.filter(
    (f) => f.properties.pieces > LARGE_COLLECTION_THRESHOLD
  );
  const myLastPhotos: Feature[] = _.reverse(
    _.sortBy(myPhotos, (o) => o.properties.moderated)
  ).slice(0, 20);

  const numPieces = _.sumBy(myPhotos, (o) => o.properties.pieces);

  const missionData = useContext<MissionsProviderData | undefined>(
    MissionsContext
  );
  const missions = missionData?.missions?.filter(
    (mission: MissionFirestoreData) =>
      userOnMissionLeaderboard(mission, user.id) && !mission.hidden
  );

  return (
    <PageWrapper
      label="Account"
      navigationHandler={{ handleClose }}
      className={classes.wrapper}
    >
      <Avatar
        className={classes.avatar}
        alt="profile-image"
        src={user.photoURL}
      />
      <Typography gutterBottom variant="h5">
        {user.displayName}
      </Typography>
      <Typography component="p">{user.email}</Typography>
      <Typography>{user.location}</Typography>
      <Typography>{user.description}</Typography>

      <br />

      {myPhotos && (
        <Typography variant="body1">
          Num. of uploads <strong>{myPhotos.length}</strong>
        </Typography>
      )}
      {!isNaN(numPieces) && (
        <Typography variant="body1">
          Total pieces <strong>{numPieces}</strong>
        </Typography>
      )}
      {largeUploads.length > 0 && (
        <>
          <Typography variant="body1">
            Num. of large uploads <strong>{largeUploads.length}</strong>
            <Tooltip tooltip={LARGE_UPLOAD_TOOLTIP} />
          </Typography>
          <Typography variant="body1">
            Total Pieces in large uploads{" "}
            <strong>{_.sumBy(largeUploads, (f) => f.properties.pieces)}</strong>
          </Typography>
        </>
      )}

      <br />

      {myLastPhotos.length && (
        <>
          <Typography variant="h6">
            Last {myLastPhotos.length} approved
          </Typography>

          {_.map(myLastPhotos, (photo) => (
            <Typography variant="body1" key={photo.properties.id}>
              {photo.properties.pieces && (
                <span>
                  <strong>{photo.properties.pieces}</strong> pieces{" "}
                </span>
              )}
              <Link to={calcUrl(photo)} onClick={() => handlePhotoClick(photo)}>
                {photo.properties.moderated &&
                photo.properties.moderated.toDateString
                  ? photo.properties.moderated.toDateString()
                  : photo.properties.moderated}
              </Link>
            </Typography>
          ))}
        </>
      )}

      {config.ENABLE_MISSIONS && (
        <div className={classes.missionsWrapper}>
          <Typography variant="h6" className={classes.missionsTitle}>
            My missions
          </Typography>

          {missions === undefined || missions?.length === 0 ? (
            <Typography className={classes.missionJoinPrompt}>
              You haven't joined any missions yet!
              <br />
              Tap{" "}
              <Link to={linkToMissionsPage()} className={classes.link}>
                here
              </Link>{" "}
              to find a mission to join.
            </Typography>
          ) : (
            missions?.map((mission) => (
              <MissionThumbnail key={mission.id} mission={mission} />
            ))
          )}
        </div>
      )}
    </PageWrapper>
  );
}
