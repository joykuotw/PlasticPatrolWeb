import { LatLong } from "types/GPSLocation";

export type CordovaCameraImage = {
  filename: string;
  json_metadata: string;
};

export type AndroidCordovaMetaData = {
  gpsLatitude: string;
  gpsLatitudeRef: string;
  gpsLongitude: string;
  gpsLongitudeRef: string;
};

export type iosCordovaMetaData = {
  GPS: {
    LatitudeRef: string;
    LongitudeRef: string;
    Latitude: number;
    Longitude: number;
  };
};

export type CordovaMetaData = AndroidCordovaMetaData | iosCordovaMetaData;

export type FileType = File | CordovaCameraImage;

export function isCordovaCameraImageFile(
  file: any
): file is CordovaCameraImage {
  return file.filename !== undefined;
}

function isBrowserImageFile(file: any): file is File {
  return file.name !== undefined;
}

export type ImageMetaData = {
  imgSrc: string;
  imgExif: any;
  imgLocation: LatLong;
  imgIptc: any;
};

export type BrowserFileState = {
  fromCamera: boolean;
  file: File;
};

export type CordovaFileState = {
  fromCamera: boolean;
  file: CordovaCameraImage;
};

export type FileState = BrowserFileState | CordovaFileState;

type BrowserState = BrowserFileState;
type CordovaState = CordovaFileState;

export type State = Partial<BrowserState | CordovaState> | ImageMetaData;

export type Action = { type: string; payload?: any };

export function isImageMetaState(state: State): state is ImageMetaData {
  // @ts-ignore
  return !!state.imgSrc;
}

export function isCordovaImageState(state: State): state is CordovaState {
  return (
    !isImageMetaState(state) &&
    !!state.file &&
    isCordovaCameraImageFile(state.file)
  );
}

export function isBrowserImageState(state: State): state is BrowserState {
  return (
    !isImageMetaState(state) && !!state.file && isBrowserImageFile(state.file)
  );
}
