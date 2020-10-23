import { linkToPhotoPage } from "routes/photo/links";

export function linkToGeotag() {
  return `${linkToPhotoPage()}/geotag`;
}
