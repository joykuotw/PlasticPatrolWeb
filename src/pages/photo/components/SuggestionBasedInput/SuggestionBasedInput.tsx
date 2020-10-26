import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo
} from "react";

import Search from "@material-ui/icons/Search";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { makeStyles } from "@material-ui/core/styles";

import useOnOutsideClick from "hooks/useOnOutsideClick";

import { SuggestionBasedText } from "../../types";
import {
  getSuggestionsMatchingInput,
  getLeafKey,
  getSortedSuggestions
} from "./utils";

import styles from "standard.scss";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  inputWrapper: {
    display: "flex",
    width: "200%",
    alignItems: "center",
    background: styles.lightGrey,
    padding: `${theme.spacing(0.5)}px ${theme.spacing(1)}px`,
    border: `${styles.mediumGrey} solid 1px`,
    marginBottom: theme.spacing(1),
    boxSizing: "border-box"
  },
  viewListIcon: {
    opacity: "50%",
    cursor: "pointer",
    "&:hover": {
      opacity: "100%"
    },
    height: "24px"
  },
  input: {
    border: "none",
    background: styles.lightGrey,
    color: "black",
    fontWeight: "bold",
    marginLeft: theme.spacing(1),
    boxSizing: "border-box",
    width: "100%",
    textOverflow: "ellipsis",
    "&:focus": {
      outline: "none"
    },
    "&::placeholder": {
      fontSize: 11
    }
  },
  suggestion: {
    display: "flex",
    alignItems: "center",
    background: "#4e4e4e",
    "&:hover": {
      background: "#4e4e4e"
    },
    color: "white",
    textTransform: "none",
    width: "max-content",
    margin: `${theme.spacing(0.5)}px ${theme.spacing(1)}px ${theme.spacing(
      0.5
    )}px 0`
  },
  suggestionWrapper: {
    display: "flex",
    flexWrap: "wrap",
    width: "200%"
  },
  suggestionList: {
    listStyleType: "none",
    paddingLeft: "0px",
    marginTop: "0px",
    marginBottom: "0px"
  },
  suggestionListItem: {
    padding: "6px",

    marginLeft: "0",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,.05)"
    },
    "&:first-child": {
      paddingTop: "0px"
    },
    "&:last-child": {
      paddingBottom: "0px"
    }
  }
}));

type Props = {
  sourceData: Object;
  inputPrompt: string;
  setType: (type: SuggestionBasedText) => void;
  className: string;
  initialLabel?: string;
};

export default function SuggestionBasedInput({
  sourceData,
  inputPrompt,
  initialLabel,
  className,
  setType
}: Props) {
  const styles = useStyles();
  const [label, setLabel] = useState(initialLabel || "");
  const [focused, setFocused] = useState(false);
  const [showSuggestionList, setShowSuggestionList] = useState(false);
  const outsideClickRef = useOnOutsideClick(() => setFocused(false));

  const allSuggestions = useMemo(() => getSortedSuggestions(sourceData), [
    sourceData
  ]);
  const suggestionsMatchingLabel = useMemo(
    () => getSuggestionsMatchingInput(allSuggestions, label),
    [allSuggestions, label]
  );
  const leafKey = useMemo(() => getLeafKey(allSuggestions, label), [
    allSuggestions,
    label
  ]);

  const onSuggestionClick = useCallback((suggestion: string) => {
    setLabel(suggestion);
    setShowSuggestionList(false);
    setFocused(false);
  }, []);

  const setTypeRef = useRef(setType);
  const labelRef = useRef(label);
  useEffect(() => {
    labelRef.current = label;
  }, [label]);
  useEffect(() => {
    setTypeRef.current = setType;
  }, [setType]);

  useEffect(() => {
    setTypeRef.current({ leafKey, label: labelRef.current });
  }, [leafKey, label]);

  const showViewListIcon = !focused && !leafKey;

  return (
    //@ts-ignore
    <div ref={outsideClickRef} className={className}>
      <div className={styles.inputWrapper}>
        <Search />
        <input
          placeholder={inputPrompt}
          className={styles.input}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onFocus={() => setFocused(true)}
        />
        {showViewListIcon && (
          <div
            className={styles.viewListIcon}
            onClick={() => setShowSuggestionList(true)}
          >
            <VisibilityIcon />
          </div>
        )}
      </div>
      <div className={styles.suggestionWrapper}>
        {focused &&
          suggestionsMatchingLabel.map(({ label, key }) => (
            <Suggestion
              label={label}
              Key={key}
              key={`${label}-${key}`}
              className={styles.suggestion}
              onClick={onSuggestionClick}
            />
          ))}
      </div>
      <Dialog
        open={showSuggestionList}
        onClose={() => {}}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <ul className={styles.suggestionList}>
            {allSuggestions.map(({ label }) => (
              <li
                key={label}
                onClick={() => onSuggestionClick(label)}
                className={styles.suggestionListItem}
              >
                {label}
              </li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(e) => {
              setShowSuggestionList(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

type SuggestionProps = {
  label: string;
  Key: string;
  className: string;
  onClick: (suggestion: string) => void;
};

function Suggestion({ label, className, onClick }: SuggestionProps) {
  return (
    <Button
      className={className}
      onClick={() => onClick(label)}
      color="primary"
    >
      {label}
    </Button>
  );
}
