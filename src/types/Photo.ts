import { Map } from "immutable";
import Geojson from "./Geojson";
import Feature from "./Feature";
import { Category } from "./Category";
import { MissionId } from "./Missions";

type Photo = {
  id: any;
  main: any;
  thumbnail: any;
  updated: Date;
  moderated?: Date;
  owner_id: string;
  pieces: number;
  location: firebase.firestore.GeoPoint;
  published: boolean;
  categories: Category[];
  missions: MissionId[];
};

export type PhotosContainer = {
  geojson: Geojson;
  featuresDict: Map<string, Feature>;
};

export default Photo;

// need to resolve

export { isCordovaCameraImageFile as isCordovaCameraImage } from "pages/photo/state/types";
export type {
  CordovaCameraImage,
  ImageMetaData as ImageMetadata
} from "pages/photo/state/types";
