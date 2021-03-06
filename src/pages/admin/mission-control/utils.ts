import { saveAs } from "file-saver";
import Photo from "types/Photo";

export function getCsv(
  arrayOfData: Array<Array<any>>,
  headers: string[],
  filename: string = "csv"
) {
  const newLine = "\r\n";
  const makeRow = (row: any[]) => row.join(",").concat(newLine);

  const data = arrayOfData.reduce(
    (csv, row) => csv + makeRow(row),
    makeRow(headers)
  );

  const blob = new Blob([String.fromCharCode(0xfeff), data], {
    type: "csv;charset=utf-8"
  });

  saveAs(blob, filename);
}

export function flattenPhotosForCsv(photos: Photo[]) {
  const data: any[][] = [];

  photos.forEach(
    ({
      id,
      categories = [],
      pieces: totalPieces,
      location: { latitude, longitude },
      owner_id,
      published
    }) => {
      const fields = {
        id,
        totalPieces,
        latitude,
        longitude,
        uploaderId: owner_id,
        published,
        brand: undefined,
        type: undefined,
        numberFromType: undefined
      };

      if (Object.values(categories).length) {
        categories.forEach((category) => {
          const { brand, label, number } = category;

          const categoryFields = {
            ...fields,
            brand,
            type: label,
            numberFromType: number
          };
          data.push(Object.values(categoryFields));
        });
      } else {
        data.push(
          Object.values({
            ...fields,
            brand: undefined,
            type: undefined,
            numberFromType: undefined
          })
        );
      }
    }
  );

  return {
    data,
    headers: [
      "id",
      "totalPieces",
      "latitude",
      "longitude",
      "uploaderId",
      "published",
      "brand",
      "type",
      "numberFromType"
    ]
  };
}
