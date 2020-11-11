import * as functions from "firebase-functions";

import * as json2csv from "json2csv";

import { firestore } from "../firestore";

import categoriesJSON from "./categories.json";

type Category = {
  barcode: string;
  label: string;
  brand: string;
  leafkey?: string;
  leafKey?: string;
  number: number;
};

type Photo = {
  categories: Category[];
  updated: FirebaseFirestore.Timestamp;
  moderated?: FirebaseFirestore.Timestamp;
  location: FirebaseFirestore.GeoPoint;
  moderator_id: string;
  owner_id: string;
  published: boolean;
};

type OutputPhoto = {
  barcode?: string;
  label?: string;
  brand?: string;
  number?: number;
  updated: Date;
  moderated?: Date;
  latitude: number;
  longitude: number;
};

const WEB_CACHE_AGE_S = 1 * 60 * 60 * 24 * 1; // 1day

function makePhotoUrls(id: string) {
  const thumbnailUrl = `https://storage.googleapis.com/plastic-patrol-fd3b3.appspot.com/photos/${id}/thumbnail.jpg`;
  const orignalPhotoUrl = `https://storage.googleapis.com/plastic-patrol-fd3b3.appspot.com/photos/${id}/original.jpg`;
  const photoSize1024Url = ` https://storage.googleapis.com/plastic-patrol-fd3b3.appspot.com/photos/${id}/1024.jpg`;

  return {
    thumbnailUrl,
    orignalPhotoUrl,
    photoSize1024Url
  };
}

async function getCSV(
  req: functions.https.Request,
  res: functions.Response<any>
) {
  try {
    if (req.method !== "GET") {
      res.status(403).send("Forbidden!");
      return;
    }
    res.set(
      "Cache-Control",
      `public, max-age=${WEB_CACHE_AGE_S}, s-maxage=${WEB_CACHE_AGE_S * 2}`
    );

    const querySnapshot = await firestore
      .collection("photos")
      .where("published", "==", true)
      .get();

    const photos: OutputPhoto[] = [];
    querySnapshot.forEach((doc) => {
      const photo = doc.data() as Photo;
      const id = doc.id;
      const { categories = [], moderated, updated, location } = photo;

      const commonData = {
        moderated: moderated && moderated.toDate(),
        updated: updated.toDate(),
        ...location,
        ...makePhotoUrls(id)
      };

      if (categories.length > 0) {
        categories.forEach((category) => {
          const { leafKey, leafkey, label } = category;
          const lk = leafKey || leafkey;
          if (lk && !label) {
            // @ts-ignore
            const label =
              (categoriesJSON[lk] || {}).label || "UNKNOWN_LEAF_KEY";
            category.label = label;
            delete category.leafkey;
            delete category.leafKey;
          }

          photos.push({
            ...commonData,
            ...category
          });
        });
      } else {
        photos.push(commonData);
      }
    });

    const parser = new json2csv.Parser();

    const csvString = parser.parse(photos);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="' + "photos-" + Date.now() + '.csv"'
    );
    res.status(200).send(csvString);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
    return;
  }
}

export default functions
  .runWith({
    memory: "512MB",
    timeoutSeconds: 60
  })
  .https.onRequest(getCSV);
