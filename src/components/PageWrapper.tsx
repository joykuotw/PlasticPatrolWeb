import React, { FunctionComponent, useEffect, useState } from "react";
import classnames from "classnames";

import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import CloseIcon from "@material-ui/icons/Close";
import AddIcon from "@material-ui/icons/Add";
import BackIcon from "@material-ui/icons/ArrowBack";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import standardStyles from "standard.scss";

import { isIphoneWithNotchAndCordova, isIphoneAndCordova } from "../utils";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@material-ui/core";

declare global {
  interface Window {
    StatusBar: {
      styleDefault: () => void;
      styleLightContent: () => void;
    };
  }
}

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    height: "100%",
    width: "100vw",
    position: "fixed",
    right: 0,
    left: 0,
    bottom: 0
  },
  main: {
    marginBottom: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    flex: 1,
    height: "100%",
    overflowY: "auto",

    "-webkit-overflow-scrolling": "touch"
  },
  iconButton: {
    marginRight: 20
  },
  grow: {
    flexGrow: 1
  },
  notchTop: {
    paddingTop: isIphoneWithNotchAndCordova()
      ? "env(safe-area-inset-top)"
      : isIphoneAndCordova
      ? theme.spacing(1.5)
      : undefined
  },
  notchBottom: {
    paddingBottom: isIphoneWithNotchAndCordova()
      ? "env(safe-area-inset-bottom)"
      : "0px"
  },

  button: {
    color: theme.palette.primary.contrastText
  },
  buttonDisabled: {
    color: `${standardStyles.primaryTextDisabled} !important`
  }
}));

type CloseNavigationHandler = { handleClose: () => void };
type BackNavigationHandler = { handleBack: () => void; confirm?: boolean };
type NavigationHandler = CloseNavigationHandler | BackNavigationHandler;

type AddAction = () => void;

interface Props {
  label: string;
  className?: string;
  navigationHandler: NavigationHandler;
  addAction?: AddAction;
}

interface PhotoPageProps {
  handlePrev: () => void;
  handleNext?: () => void;
  enableNext: boolean;
  nextClicked: boolean;
  error: boolean;
  sendFile: () => void;
  label: string;
  handleClose: () => void;
}

const useStatusBarHighlighting = () => {
  const theme = useTheme();
  useEffect(() => {
    const palette = theme.palette;
    if (isIphoneAndCordova && palette.primary.main === palette.common.black) {
      window.StatusBar.styleDefault();
    }

    // on unmount, set to styleLightContent
    return () => {
      const palette = theme.palette;
      if (isIphoneAndCordova && palette.primary.main === palette.common.black) {
        window.StatusBar.styleLightContent();
      }
    };
  });
};

export const PhotoPageWrapper: FunctionComponent<PhotoPageProps> = ({
  handlePrev,
  handleNext,
  enableNext,
  nextClicked,
  error,
  sendFile,
  label,
  children,
  handleClose
}) => {
  const classes = useStyles();
  useStatusBarHighlighting();
  return (
    <div className={classes.container}>
      <AppBar position="static" className={classes.notchTop}>
        <Toolbar>
          {nextClicked ? (
            <BackIcon className={classes.iconButton} onClick={handlePrev} />
          ) : (
            <CloseIcon
              className={classes.iconButton}
              onClick={handleClose}
              data-test="Close"
            />
          )}
          <Typography className={classes.grow} variant="h6" color="inherit">
            {label}
          </Typography>
          {!nextClicked && (
            <Button
              disabled={!enableNext}
              className={classes.button}
              onClick={handleNext}
              classes={{ disabled: classes.buttonDisabled }}
            >
              Next
            </Button>
          )}
          {nextClicked && (
            <Button
              disabled={error}
              className={classes.button}
              onClick={sendFile}
              classes={{ disabled: classes.buttonDisabled }}
            >
              Upload
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <div className={classes.main}>{children}</div>
      <div className={classes.notchBottom} />
    </div>
  );
};

function isCloseNavigationHandler(
  navigationHandler: NavigationHandler
): navigationHandler is CloseNavigationHandler {
  if ((navigationHandler as CloseNavigationHandler).handleClose !== undefined) {
    return true;
  } else {
    return false;
  }
}

interface ConfirmBackProps {
  open: boolean;
  handleConfirm: () => void;
  handleCancel: () => void;
}

const ConfirmBack = ({
  open,
  handleConfirm,
  handleCancel
}: ConfirmBackProps) => {
  return (
    <Dialog
      open={open}
      onClose={() => handleCancel()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to go back? Your progress might be lost
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(e) => {
            handleCancel();
          }}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          onClick={(e) => {
            handleConfirm();
          }}
          color="primary"
        >
          Go back
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PageWrapper: FunctionComponent<Props> = ({
  children,
  label,
  navigationHandler,
  className,
  addAction
}) => {
  const classes = useStyles();
  const [confirmBack, setConfirmBack] = useState(false);
  useStatusBarHighlighting();

  var navIcon;
  if (isCloseNavigationHandler(navigationHandler)) {
    const { handleClose } = navigationHandler;
    navIcon = (
      <CloseIcon
        className={classes.iconButton}
        onClick={handleClose}
        data-test="Close"
      />
    );
  } else {
    const { handleBack, confirm } = navigationHandler;
    navIcon = (
      <BackIcon
        className={classes.iconButton}
        onClick={() => {
          if (confirm) {
            setConfirmBack(true);
          } else {
            handleBack();
          }
        }}
      />
    );
  }

  return (
    <div className={classes.container}>
      <AppBar position="static" className={classes.notchTop}>
        <Toolbar>
          {navIcon}
          <Typography className={classes.grow} variant="h6" color="inherit">
            {label}
          </Typography>
          {addAction !== undefined && <AddIcon onClick={addAction} />}
        </Toolbar>
      </AppBar>
      <div className={classnames(classes.main, className)}>{children}</div>
      <div className={classes.notchBottom} />
      <ConfirmBack
        open={confirmBack}
        handleCancel={() => setConfirmBack(false)}
        handleConfirm={() => {
          setConfirmBack(false);
          // @ts-ignore
          navigationHandler.handleBack();
        }}
      />
    </div>
  );
};

export default PageWrapper;
