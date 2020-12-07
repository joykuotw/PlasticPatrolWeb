import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import "react-circular-progressbar/dist/styles.css";
import { useHistory } from "react-router";
import Button from "@material-ui/core/Button";
import { Route, useParams } from "react-router-dom";
import ChallengeForm from "../common/ChallengeForm";
import {
  ChallengeFirestoreData,
  ConfigurableChallengeData,
  equal,
  isChallengeDataValid,
  isDuplicatingExistingChallengeName
} from "../../../types/Challenges";
import { editChallenge } from "../../../features/firebase/challenges";
import {
  ChallengesProviderData,
  useChallenges
} from "../../../providers/ChallengesProvider";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    padding: "5%"
  },
  buttons: {
    display: "flex",
    marginTop: `${theme.spacing(1)}px`,
    flexDirection: "row"
  },
  button: {
    marginLeft: 5,
    marginRight: 5
  },
  formErrorWarning: {
    color: "#f00",
    margin: "5px 0"
  }
}));

type Props = {};

export default function EditChallenge({}: Props) {
  const styles = useStyles();
  const history = useHistory();
  const handleBack = { handleBack: () => history.goBack(), confirm: true };

  const challengeData = useChallenges();
  const challenges = challengeData?.challenges || [];

  const { challengeId } = useParams();
  const originalChallenge = challenges.find(
    (ch) => ch.id.toString() === challengeId
  );
  if (originalChallenge === undefined) {
    console.warn(
      `Trying to edit challenge ${challengeId} but couldn't find challenge data in list.`
    );
  }

  const [formRefreshCounter, setFormRefreshCounter] = useState(0);
  const [challengeFormData, setChallengeFormData] = useState<
    ConfigurableChallengeData | undefined
  >(originalChallenge);

  const duplicatingExistingChallengeName = isDuplicatingExistingChallengeName(
    challengeFormData,
    challenges,
    challengeId
  );
  const challengeReady: boolean = isChallengeDataValid(challengeFormData);
  const challengeChanged: boolean =
    originalChallenge === undefined ||
    challengeFormData === undefined ||
    !equal(originalChallenge, challengeFormData);

  const applyEdits = () => {
    if (challengeFormData === undefined) {
      return;
    }
    editChallenge(challengeId, challengeFormData);
  };

  const discardEdits = () => {
    setChallengeFormData(originalChallenge);
    setFormRefreshCounter(formRefreshCounter + 1);
  };

  return (
    <PageWrapper
      label={"Edit challenge"}
      navigationHandler={handleBack}
      className={styles.wrapper}
    >
      <ChallengeForm
        initialData={originalChallenge}
        refreshCounter={formRefreshCounter}
        onChallengeDataUpdated={setChallengeFormData}
      />
      <div className={styles.buttons}>
        <Button
          className={styles.button}
          onClick={applyEdits}
          color="primary"
          variant="contained"
          disabled={!challengeReady || !challengeChanged}
        >
          Apply changes
        </Button>
        <Button
          className={styles.button}
          onClick={discardEdits}
          color="primary"
          variant="contained"
          disabled={!challengeChanged}
        >
          Discard changes
        </Button>
      </div>
      {duplicatingExistingChallengeName && (
        <div className={styles.formErrorWarning}>
          Cannot have the same name as an existing challenge
        </div>
      )}
    </PageWrapper>
  );
}
