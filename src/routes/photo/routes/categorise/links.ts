import { linkToPhotoPage } from "routes/photo/links";

export function linkToCategorise() {
  return `${linkToPhotoPage()}/categorise`;
}

export function linkToUploadPhotoDialog() {
  return `${linkToCategorise()}/upload`;
}
