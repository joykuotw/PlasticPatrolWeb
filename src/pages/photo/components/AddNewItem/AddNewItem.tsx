import React, { useState } from "react";
import { Button, makeStyles } from "@material-ui/core";

import { Item, SuggestionBasedText } from "../../types";
import QuantitySelector from "../QuantitySelector";
import SuggestionBasedInput from "../SuggestionBasedInput";
import categories from "custom/categories.json";
import brands from "custom/brands.json";

import styles from "standard.scss";

type Props = {
  onCancelClick: () => void;
  onConfirmClick: (item: Item) => void;
  initialItem?: Item;
};

const button = (theme: any) => ({
  width: 130,
  justifySelf: "center",
  marginTop: theme.spacing(1),
  "text-transform": "none"
});

declare global {
  interface Window {
    cordova?: any;
  }
}

const useStyles = makeStyles((theme) => ({
  brandWrapper: {
    display: "flex",
    alignItems: "center",
    width: "200%",
    boxSizing: "border-box",
    background: styles.lightGrey,
    color: "black",
    padding: `${theme.spacing(0.5)}px ${theme.spacing(1)}px`,
    border: `${styles.mediumGrey} solid 1px`,
    fontWeight: "bold",
    "&:focus": {
      outline: "none"
    }
  },
  brand: {
    border: "none",
    background: styles.lightGrey,
    color: "black",
    fontWeight: "bold",
    marginLeft: theme.spacing(1),
    fontSize: 11,
    width: "100%",
    "&:focus": {
      outline: "none"
    }
  },
  wrapper: {
    display: "grid",
    gridTemplateAreas: `
    "type type"
    "brand brand"
    "quantityText quantitySelector"
    "cancel add"
`,
    height: "50%",
    gridTemplateColumns: "50%",
    gridTemplateRows: "1fr min-content min-content min-content",
    maxWidth: window.outerWidth - theme.spacing(2)
  },
  type: {
    gridArea: "type"
  },
  quantityText: {
    gridArea: "quantityText",
    textAlign: "center"
  },
  quantitySelector: {
    gridArea: "quantitySelector"
  },
  cancel: {
    gridArea: "cancel",
    ...button(theme)
  },
  add: {
    gridArea: "add",
    ...button(theme)
  }
}));

export default function AddNewItem({
  onCancelClick,
  onConfirmClick,
  initialItem
}: Props) {
  const [quantity, setQuantity] = useState(initialItem?.quantity || 0);
  const [type, setType] = useState<SuggestionBasedText>(
    initialItem?.type || { leafKey: null, label: null }
  );
  const [brand, setBrand] = useState<string>(initialItem?.brand || "");

  const styles = useStyles();

  const itemButtonIsDisabled = !(quantity && type && type.label);

  return (
    <div className={styles.wrapper}>
      <div>
        <SuggestionBasedInput
          sourceData={categories}
          inputPrompt={
            'Search for the litter type e.g. "plastic bottle" or "crisp packet"'
          }
          setType={setType}
          className={styles.type}
          initialLabel={initialItem?.type?.label || ""}
        />
        <SuggestionBasedInput
          sourceData={brands}
          inputPrompt={
            'Search for the litter brand e.g. "Coca Cola" or "Cadbury"'
          }
          setType={(suggestion: SuggestionBasedText) =>
            setBrand(suggestion?.label || "")
          }
          className={styles.type}
          initialLabel={initialItem?.brand}
        />
      </div>
      <p className={styles.quantityText}>Quantity</p>
      <QuantitySelector
        quantity={quantity}
        setQuantity={setQuantity}
        className={styles.quantitySelector}
      />
      <Button
        onClick={onCancelClick}
        variant="outlined"
        color="primary"
        className={styles.cancel}
      >
        Cancel
      </Button>
      <Button
        disabled={itemButtonIsDisabled}
        onClick={() =>
          onConfirmClick({
            quantity,
            type,
            brand
          })
        }
        variant="contained"
        color="primary"
        className={styles.add}
      >
        {initialItem ? "Edit" : "Add"} item(s)
      </Button>
    </div>
  );
}
