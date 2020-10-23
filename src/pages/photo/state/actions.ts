import { LatLong } from "types/GPSLocation";

import actionTypes from "./actionTypes";
import { FileType, ImageMetaData } from "./types";

export function setFile(file: FileType, fromCamera: boolean) {
  return {
    type: actionTypes.SET_FILE_STATE,
    payload: { file, fromCamera }
  };
}

export function setMetaData(payload: ImageMetaData) {
  return {
    type: actionTypes.SET_META_DATA,
    payload
  };
}

export function setLocation(payload: LatLong) {
  return {
    type: actionTypes.SET_LOCATION,
    payload
  };
}

export function resetState() {
  return { type: actionTypes.RESET_STATE };
}
