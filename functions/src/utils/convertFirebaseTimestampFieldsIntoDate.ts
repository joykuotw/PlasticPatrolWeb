import { cloneDeep, forEach } from "lodash";

export default function convertFirebaseTimestampFieldsIntoDate(photo: any) {
  const newPhoto = cloneDeep(photo);
  forEach(newPhoto, (value, field) => {
    if (value.constructor.name === "Timestamp") {
      newPhoto[field] = value.toDate();
    }
  });
  return newPhoto;
}
