import Button from "@material-ui/core/Button";
import { linkToAddChallengeCoverPhotoDialog, linkToSubmitChallengeDialog } from "../../../routes/challenges/links";
import { DesktopPhotoFallback } from "../../../components/common/DesktopPhotoFallback";
import { Route } from "react-router-dom";
import AddPhotoDialog from "../../photo/components/AddPhotoDialog/AddPhotoDialog";
import React, { createRef, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import styles from "../../../standard.scss";
import { Challenge, ChallengeConfigurableData } from "../../../types/Challenges";
import { CordovaCameraImage, ImageMetadata, isCordovaCameraImage } from "../../../types/Photo";
import { useGPSLocation } from "../../../providers/LocationProvider";
import loadPhoto from "../../photo/pages/CategorisePhotoPage/utils";
import {useHistory} from "react-router";

const CHALLENGE_NAME_LIMIT = 100;
const CHALLENGE_DESCRIPTION_LIMIT = 300;
const CHALLENGE_PIECE_TARGET_LIMIT = 1000000;

const useStyles = makeStyles((theme) => ({
  form: {
    height: "100%",
    display: "flex",
    flexFlow: "column",
  },

  inputLengthTracker: {
    width: "100%",
    textAlign: "right",
    marginBottom: "5px",
    color: styles.mediumGrey,
  },

  name: {
    border: "none",
    borderRadius: "5px",
    padding: "5px",
    background: styles.lightGrey,
    fontSize: 16,
    boxSizing: "border-box",
    width: "100%",
    textOverflow: "ellipsis",
    "&:focus": {
      outline: "none"
    },
  },

  description: {
    border: "none",
    borderRadius: "5px",
    padding: "5px",
    background: styles.lightGrey,
    fontSize: 16,
    boxSizing: "border-box",
    width: "100%",
    textOverflow: "ellipsis",
    fontFamily: theme.typography.fontFamily,
    '& input': {
      font: 'inherit',
    },
    "&:focus": {
      outline: "none"
    },
  },

  pieceTarget: {
    border: "none",
    borderRadius: "5px",
    padding: "5px",
    marginBottom: "10px",
    background: styles.lightGrey,
    fontSize: 16,
    boxSizing: "border-box",
    width: "100%",
    textOverflow: "ellipsis",
    "&:focus": {
      outline: "none"
    },
  },

  coverPhotoWrapper: {
    width: "100%",
    textAlign: "center",
  },

  coverPhotoPreview: {
    maxWidth: "100%",
    maxHeight: "200px",
  },

  addPhotoButton: {
    marginBottom: "10px",
  },

  datesWrapper: {
    display: "flex",
    marginBottom: "10px",
  },

  startDate: {
    flex: 1,
  },

  endDate: {
    flex: 1,
  },

  dateLabel: {
    color: styles.mediumGrey,
    fontSize: 14,
  },

  dateSummary: {
    color: theme.palette.primary.main,
    fontSize: 14,
  },

  inputWarning: {
    color: "#f00",
    margin: "5px 0",
  },

  dateInput: {
    border: "none",
    borderRadius: "5px",
    padding: "5px",
    background: styles.lightGrey,
    fontSize: 16,
    boxSizing: "border-box",
    textOverflow: "ellipsis",
    "&:focus": {
      outline: "none"
    },
  },

  privateToggleWrapper: {
    margin: "10px 0",
  },
}));


function validateStringInput(input: string, lengthLimit: number, setter: (newValue: string) => void) {
  if (input.length > lengthLimit) {
    return;
  }

  setter(input);
}

function validateNumberInput(input: string, limit: number, setter: (newValue: number) => void) {
  if ( !/^[1-9]\d*$/.test(input) || parseInt(input) > limit) {
    return;
  }

  setter(parseInt(input));
}

export function isChallengeReady(name: string, description: string, targetPieces: number,
                          coverPhoto: ImageMetadata | undefined, startDate: Date | null,
                          endDate: Date | null) {
  // Check challenge has a name and description
  return name !== "" && description !== ""
    // Has a valid number of pieces to collect
    && targetPieces > 0
    // Has selected a cover photo
    && coverPhoto !== undefined
    // Has a start date set from today onwards
    && startDate !== null && startDate > new Date()
    // Has an end date set after the start date
    && endDate !== null && endDate > startDate;
}

type Props = {
  initialData?: ChallengeConfigurableData;
  updateChallengeReady: (challenge?: ChallengeConfigurableData) => void;
}

export default function ChallengeForm({initialData, updateChallengeReady}: Props) {

  const classes = useStyles();
  const history = useHistory();
  const gpsLocation = useGPSLocation();

  // Magic for handling photo uploads.
  const desktopPhotoRef = createRef<HTMLInputElement>();
  const handlePhotoSelect = (image: File | CordovaCameraImage, fromCamera: boolean) => {
    const fileState = isCordovaCameraImage(image) ?
      {
        filePath: (image as CordovaCameraImage).filename,
        cordovaMetadata: JSON.parse((image as CordovaCameraImage).json_metadata as string),
        fromCamera: fromCamera
      } :
      {file: image, fromCamera: fromCamera};

    loadPhoto({fileState, fromCamera, gpsLocation, callback: setCoverPhoto});
  };

  const today = new Date();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetPieces, setTargetPieces] = useState( 0);
  const [isPrivate, setIsPrivate] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<ImageMetadata | undefined>();

  // If we're editing an existing challenge, the parent component passes in data.
  // We should allow users to discard changes, easy way to do this is have this form
  // component reset itself to this initial data just by us pushing a state change.
  useEffect(() => {
    if (initialData !== undefined) {
      let initialStartDate = new Date();
      initialStartDate.setTime(initialData.startTime);
      let initialEndDate = new Date();
      initialEndDate.setTime(initialData.endTime);

      setName(initialData.name);
      setDescription(initialData.description);
      setTargetPieces(initialData.targetPieces);
      setIsPrivate(initialData.isPrivate);
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setCoverPhoto(initialData.coverPhoto);
    }
  }, [initialData]);

  // Keep parent updated on whether the current data in form makes up a valid challenge.
  useEffect(() => {
    const challengeReady = isChallengeReady(name, description, targetPieces, coverPhoto, startDate, endDate);
    if (challengeReady && startDate && endDate) {
      updateChallengeReady({ name, description, targetPieces, coverPhoto, startTime: startDate.getTime(), endTime: endDate.getTime(), isPrivate });
    } else {
      updateChallengeReady(undefined);
    }
  }, [name, description, targetPieces, coverPhoto, startDate, endDate, isPrivate])

  return (
    <div>
      <input
        placeholder={"Enter a challenge name"}
        className={classes.name}
        value={name}
        onChange={(e) => validateStringInput(e.target.value, CHALLENGE_NAME_LIMIT, setName)}
      />
      <div className={classes.inputLengthTracker}>{name.length}/{CHALLENGE_NAME_LIMIT}</div>
      <textarea
        placeholder={"Enter a short description"}
        className={classes.description}
        value={description}
        rows={3}
        onChange={(e) => validateStringInput(e.target.value, CHALLENGE_DESCRIPTION_LIMIT, setDescription)}
      />
      <div className={classes.inputLengthTracker}>{description.length}/{CHALLENGE_DESCRIPTION_LIMIT}</div>

      <div className={classes.dateLabel}>Target pieces to collect</div>
      <input
        className={classes.pieceTarget}
        type="number"
        value={targetPieces.toString()}
        onChange={(e) => validateNumberInput(e.target.value, CHALLENGE_PIECE_TARGET_LIMIT, setTargetPieces)}
      />

      {coverPhoto &&
      <div className={classes.coverPhotoWrapper}>
        <img src={coverPhoto && coverPhoto.imgSrc}
             className={classes.coverPhotoPreview}/>
      </div>
      }

      <Button className={classes.addPhotoButton}
        // @ts-ignore
              onClick={() => !!window.cordova
                ? history.push(linkToAddChallengeCoverPhotoDialog())
                : desktopPhotoRef.current && desktopPhotoRef.current.click()}
              color="default"
              variant="contained">
        {(coverPhoto && coverPhoto.imgSrc) ? "Change cover photo" : "Add cover photo"}
      </Button>
      <DesktopPhotoFallback ref={desktopPhotoRef}
                            handlePhotoSelect={handlePhotoSelect}/>
      <Route path={linkToAddChallengeCoverPhotoDialog()}>
        <AddPhotoDialog onClose={() => history.goBack()}
                        handlePhotoSelect={handlePhotoSelect}/>
      </Route>

      <div className={classes.datesWrapper}>
        <div className={classes.startDate}>
          <div className={classes.dateLabel}>Start date</div>
          <input className={classes.dateInput}
                 type="date"
                 onChange={(e) => setStartDate(new Date(e.currentTarget.value))}/>
        </div>
        <div className={classes.endDate}>
          <div className={classes.dateLabel}>End date</div>
          <input className={classes.dateInput}
                 type="date"
                 onChange={(e) => setEndDate(new Date(e.currentTarget.value))}/>
        </div>
      </div>

      {(startDate !== null && startDate < today) &&
      <div className={classes.inputWarning}>
        Start date cannot be in the past
      </div>
      }

      {(startDate !== null && endDate !== null && endDate < startDate) &&
      <div className={classes.inputWarning}>
        End date cannot be before start date
      </div>
      }

      {(startDate !== null && endDate !== null && today <= startDate && startDate < endDate) &&
      <div className={classes.dateSummary}>
        Challenge will run for {(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)} days
      </div>
      }

      <div className={classes.privateToggleWrapper}>
        <input type="radio"
               checked={isPrivate}
               value={"Private challenge"}
               onChange={() => {}}
               onClick={() => setIsPrivate(!isPrivate)}/>
        Private challenge
      </div>
    </div>
  );
}