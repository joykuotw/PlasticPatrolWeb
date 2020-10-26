import axios from "axios";
import * as functions from "firebase-functions";
import { CallableContext } from "firebase-functions/lib/providers/https";

type ProductInfo = {
  productName: string;
  brand: string;
};

const doBarcodeLookup = async (
  id: number
): Promise<ProductInfo | undefined> => {
  const key = functions.config().barcode.lookup.key;

  let result;
  try {
    result = await axios.get(
      `https://api.barcodelookup.com/v2/products?barcode=${id}&formatted=y&key=${key}`
    );
  } catch (e) {
    console.log(`Call to barcodelookup failed: ${e}`);
    return undefined;
  }
  const data = result.data;
  if (data.products && data.products.length > 0) {
    const { brand, product_name: productName } = data.products[0];
    return { brand, productName };
  } else {
    return undefined;
  }
};

const doEanLookup = async (id: number): Promise<ProductInfo | undefined> => {
  const key = functions.config().ean.lookup.key;
  let result;
  try {
    result = await axios.get(
      `http://api.ean-search.org/api?token=${key}&op=barcode-lookup&format=json&ean=${id}`
    );
  } catch (e) {
    console.log(`Call to eanlookup failed: ${e}`);
    return undefined;
  }
  const data = result.data;
  console.log(data);
  if (
    data.length !== undefined &&
    data.length > 0 &&
    data[0].error === undefined
  ) {
    const { name: productName } = data[0];
    return { productName, brand: "" };
  } else {
    return undefined;
  }
};

export const barcodeLookup = async (
  data: any,
  context: CallableContext
): Promise<ProductInfo | null> => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "permission denied"
    );
  }

  const id = parseInt(data.id);
  if (isNaN(id)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with " +
        'one arguments "id" containing the barcode id to lookup.'
    );
  }

  const [barcodeLookupResponse, eanLookupResponse] = await Promise.all([
    doBarcodeLookup(data.id),
    doEanLookup(data.id)
  ]);

  if (barcodeLookupResponse !== undefined) {
    console.log(
      `got product info from barcodelookup for id ${data.id}: ${JSON.stringify(
        barcodeLookupResponse
      )}`
    );
  } else {
    console.log(
      `failed to get product info from barcodelookup for id ${data.id}`
    );
  }

  if (eanLookupResponse !== undefined) {
    console.log(
      `got product info from eanlookup for id ${data.id}: ${JSON.stringify(
        eanLookupResponse
      )}`
    );
  } else {
    console.log(`failed to get product info from eanlookup for id ${data.id}`);
  }

  if (barcodeLookupResponse !== undefined) {
    return barcodeLookupResponse;
  } else if (eanLookupResponse !== undefined) {
    return eanLookupResponse;
  } else {
    console.log(`No barcode information found for id ${data.id}`);
    return null;
  }
};
