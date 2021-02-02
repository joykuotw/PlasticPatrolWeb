import loadImage from "blueimp-load-image";
import dms2dec from "dms2dec";

import config from "custom/config";

import { device } from "utils";
import { GPSLocation, LatLong } from "types/GPSLocation";
import {
  AndroidCordovaMetaData,
  CordovaMetaData,
  ImageMetaData,
  iosCordovaMetaData
} from "pages/photo/state/types";

type Args = {
  fileOrFileName: File | string;
  fromCamera: boolean;
  gpsLocation?: GPSLocation;
  cordovaMetadata?: CordovaMetaData;
  callback: (result: ImageMetaData) => void;
};

export default function loadPhoto(args: Args): void {
  //   https://github.com/blueimp/JavaScript-Load-Image#meta-data-parsing
  //@ts-ignore
  if (!window.cordova) {
    const { fileOrFileName } = args;
    loadImage.parseMetaData(
      fileOrFileName,
      (data) => {
        //@ts-ignore
        const imgExif = data.exif ? data.exif.getAll() : null;
        //@ts-ignore
        const imgIptc = data.iptc ? data.iptc.getAll() : null;
        doLoadPhoto({
          imgExif,
          imgIptc,
          ...args
        });
      },
      {
        maxMetaDataSize: 262144,
        disableImageHead: false
      }
    );
  } else {
    doLoadPhoto(args);
  }
}

function doLoadPhoto({
  fileOrFileName,
  fromCamera,
  gpsLocation,
  cordovaMetadata,
  callback,
  imgExif,
  imgIptc
}: Args & {
  imgExif?: any;
  imgIptc?: any;
  cordovaMetadata?: CordovaMetaData;
}): void {
  loadImage(
    fileOrFileName,
    (img) => {
      // @ts-ignore
      const imgSrc = img.toDataURL("image/jpeg");
      let imgLocation: any = null;
      if (fromCamera) {
        imgLocation = gpsLocation;
      } else {
        imgLocation = getLocationFromExifMetadata(imgExif, cordovaMetadata);
      }

      callback({
        imgSrc,
        imgExif,
        imgIptc,
        imgLocation
      });
    },
    {
      orientation: true,
      maxWidth: config.MAX_IMAGE_SIZE,
      maxHeight: config.MAX_IMAGE_SIZE
    }
  );
}

function getLocationFromExifMetadata(
  imgExif: any,
  cordovaMetadata?: CordovaMetaData
): LatLong | null {
  let latitude: number, longitude: number;
  try {
    //@ts-ignore
    if (!window.cordova || !cordovaMetadata) {
      // https://www.npmjs.com/package/dms2dec
      const lat = imgExif.GPSLatitude.split(",").map(Number);
      const latRef = imgExif.GPSLatitudeRef;
      const lon = imgExif.GPSLongitude.split(",").map(Number);
      const lonRef = imgExif.GPSLongitudeRef;
      const latLon = dms2dec(lat, latRef, lon, lonRef);
      latitude = latLon[0];
      longitude = latLon[1];

      return { latitude, longitude };
    } else {
      if (device() === "iOS") {
        const iosGPSMetadata = (cordovaMetadata as iosCordovaMetaData).GPS;
        const latRef = iosGPSMetadata.LatitudeRef;
        const lonRef = iosGPSMetadata.LongitudeRef;
        const Latitude = iosGPSMetadata.Latitude;
        const Longitude = iosGPSMetadata.Longitude;
        latitude = latRef === "N" ? Latitude : -Latitude;
        longitude = lonRef === "E" ? Longitude : -Longitude;
        return { latitude, longitude };
      } else if (device() === "Android") {
        const androidMetadata = cordovaMetadata as AndroidCordovaMetaData;
        const lat = androidMetadata.gpsLatitude;
        const latRef = androidMetadata.gpsLatitudeRef;
        const lon = androidMetadata.gpsLongitude;
        const lonRef = androidMetadata.gpsLongitudeRef;
        const latLon = dms2dec(lat, latRef, lon, lonRef);
        latitude = latLon[0];
        longitude = latLon[1];
        return {
          latitude,
          longitude
        };
      } else {
        return null;
      }
    }
  } catch (e) {
    console.error(`Error extracting GPS from file: ${e}`);
    return null;
  }
}
