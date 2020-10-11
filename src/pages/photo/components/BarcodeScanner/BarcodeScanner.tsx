import React from "react";
import CropFreeIcon from "@material-ui/icons/CropFree";
import IconButton from "@material-ui/core/IconButton";
import dbFirebase, {
  ProductInfo
} from "../../../../features/firebase/dbFirebase";
import { makeStyles } from "@material-ui/core";
import { findLastIndex } from "lodash";

declare global {
  interface Window {
    cordova?: any;
  }
}

interface ScannerResult {
  cancelled: boolean;
  text: string;
  format: string;
}

const { getBarcodeInfo } = dbFirebase;

export type BarcodeResult =
  | ProductInfo
  | "cancelled"
  | "not found"
  | "scan error"
  | "lookup error";

const useStyles = makeStyles(() => ({
  barcodeIcon: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
}));

interface Props {
  onResult: (result: BarcodeResult) => void;
  className?: string;
}

export function isProductInfo(result: BarcodeResult): result is ProductInfo {
  return result !== undefined && (result as ProductInfo).brand !== undefined;
}

function scan(): Promise<number> {
  return new Promise((resolve, reject) => {
    window.cordova.plugins.barcodeScanner.scan(
      (result: ScannerResult) => {
        if (result.cancelled) {
          reject("canceled");
        } else {
          const id = parseInt(result.text);
          if (isNaN(id)) {
            reject("NaN");
          } else {
            resolve(id);
          }
        }
      },
      () => {
        reject("scan error");
      }
    );
  });
}

const BarcodeScanner = ({ onResult, className }: Props) => {
  const classes = useStyles();
  return (
    <div className={classes.barcodeIcon}>
      <p>Scan a barcode</p>
      <IconButton
        disableRipple
        className={className}
        onClick={async () => {
          var id;
          try {
            id = await scan();
          } catch {
            onResult("scan error");
            return;
          }

          try {
            const result = await getBarcodeInfo(id);
            onResult(result || "not found");
          } catch {
            onResult("lookup error");
          }
        }}
      >
        <CropFreeIcon />
      </IconButton>
    </div>
  );
};

export default BarcodeScanner;
