import Feature from "types/Feature";

export type CachedGeojson = {
  timestamp: number; // ms since epoch, like in Date
  geojson: Geojson;
};

export const isCachedGeojson = (obj: any): obj is CachedGeojson => {
  return obj && obj.timestamp !== undefined && obj.geojson !== undefined;
};

type Geojson = {
  type: "FeatureCollection";
  features: Feature[];
};

export default Geojson;
