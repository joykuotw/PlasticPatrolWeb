import React, { useRef } from "react";

import mapboxgl from "mapbox-gl";
import useEffectOnMount from "hooks/useEffectOnMount";
import config from "custom/config";
import { useGPSLocation } from "providers/LocationProvider";

import LocationOnIcon from "@material-ui/icons/LocationOn";
import { makeStyles } from "@material-ui/core";
import { LatLong } from "types/GPSLocation";

const useStyles = makeStyles(() => ({
  mapContainer: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "80%",
    width: "100%"
  },
  map: { height: "100%", width: "100%", position: "absolute" },
  iconRoot: { position: "relative", marginBottom: "15px" }
}));

type Props = {
  onLocationUpdate: (location: LatLong) => void;
};
export default function GeoTagMap({ onLocationUpdate }: Props) {
  const mapRef = useRef(null);

  const initialLocation = useGPSLocation();
  const styles = useStyles();

  useEffectOnMount(() => {
    mapboxgl.accessToken = config.MAPBOX_TOKEN;

    const center = initialLocation
      ? { lat: initialLocation.latitude, lon: initialLocation.longitude }
      : { lat: config.CENTER[1], lon: config.CENTER[0] };

    onLocationUpdate({
      latitude: center.lat,
      longitude: center.lon
    });

    const map = new mapboxgl.Map({
      //@ts-ignore
      container: mapRef.current,
      zoom: config.ZOOM_FLYTO,
      style: "mapbox://styles/mapbox/streets-v11",
      center
    });

    map.on("move", () => {
      onLocationUpdate({
        latitude: Number(map.getCenter().lat.toFixed(7)),
        longitude: Number(map.getCenter().lng.toFixed(7))
      });
    });
  });

  return (
    <div className={styles.mapContainer}>
      <div ref={mapRef} className={styles.map} />
      <LocationOnIcon fontSize="large" classes={{ root: styles.iconRoot }} />
    </div>
  );
}
