import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import Button from "@material-ui/core/Button";
import BackIcon from "@material-ui/icons/ArrowBack";
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

import { Feedback } from "types/Feedback";

import { isIphoneWithNotchAndCordova, isIphoneAndCordova } from "../../utils";

const useStyles = makeStyles((theme) => ({
  notchTop: {
    paddingTop: isIphoneWithNotchAndCordova()
      ? "env(safe-area-inset-top)"
      : isIphoneAndCordova
      ? theme.spacing(1.5)
      : ""
  },
  iconButton: {
    marginRight: theme.spacing(2)
  },
  main: {
    marginTop: theme.spacing(2)
  },
  button: {
    margin: theme.spacing(1.5)
  },
  notchBottom: {
    paddingBottom: isIphoneWithNotchAndCordova()
      ? "env(safe-area-inset-bottom)"
      : 0
  }
}));

type Props = {
  handleClose: () => void;
  feedbacks: Array<Feedback>;
  handleToggleResolvedClick: (feedback?: Feedback) => Promise<void>;
  fetchFeedbackById: (id: string) => Promise<void>;
};

export default function FeedbackDetailsPage({
  handleClose,
  feedbacks,
  handleToggleResolvedClick,
  fetchFeedbackById
}: Props) {
  const { feedbackId } = useParams();
  const feedback = feedbacks.find(({ id }) => id === feedbackId);
  const fetchedAll = useRef(false);
  const fetchedSingle = useRef(false);
  const fetchingSingle = useRef(false);
  const feedbacksL = feedbacks.length;

  useEffect(() => {
    if (feedbacksL > 0) {
      fetchedAll.current = true;
    }
    const shouldFetch =
      !feedback &&
      fetchedAll.current &&
      !fetchedSingle.current &&
      !fetchingSingle.current;

    if (shouldFetch) {
      fetchingSingle.current = true;
      fetchFeedbackById(feedbackId).then((res) => {
        fetchedSingle.current = true;
        fetchingSingle.current = false;
      });
    }
  }, [feedbacksL, feedback, feedbackId, fetchFeedbackById]);

  const styles = useStyles();

  return (
    <Dialog open aria-labelledby="responsive-dialog-title">
      <AppBar position="static" className={styles.notchTop}>
        <Toolbar>
          <BackIcon className={styles.iconButton} onClick={handleClose} />
          <Typography variant="h6" color="inherit">
            Feedback details
          </Typography>
        </Toolbar>
      </AppBar>

      <DialogContent className={styles.main}>
        {feedback ? (
          Object.keys(feedback).map((key) => {
            let value;

            if (key === "created" || key === "updated") {
              const b = feedback[key].toDate();
              value = String(b);
            } else if (key === "location") {
              value = `lat ${feedback[key].latitude}, lon ${feedback[key].longitude}`;
            } else {
              // @ts-ignore
              value = feedback[key];
            }
            return (
              <div key={key} style={{ textAlign: "justify", padding: "5px" }}>
                <b>{key + ": "}</b>
                {value}
              </div>
            );
          })
        ) : fetchedAll.current && fetchedSingle.current && !feedback ? (
          <>
            Sorry we can't find that feedback any more <br />
            <br />
            If you think it should still exist please get in touch so that a
            developer can take a look into it
            <br />
            <br />
            Feedback ID: {feedbackId}
          </>
        ) : (
          <Dialog
            open
            PaperProps={{
              style: { backgroundColor: "transparent", boxShadow: "none" }
            }}
          >
            <CircularProgress color="primary" />
          </Dialog>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          disabled={!feedback}
          className={styles.button}
          fullWidth
          variant="contained"
          color="primary"
          onClick={async () => {
            await handleToggleResolvedClick(feedback);
            handleClose();
          }}
        >
          {feedback && feedback.resolved ? "Unsolved" : "Resolved"}
        </Button>
      </DialogActions>
      <div className={styles.notchBottom} />
    </Dialog>
  );
}
