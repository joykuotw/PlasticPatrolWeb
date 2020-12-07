import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import "react-circular-progressbar/dist/styles.css";
import { useHistory } from "react-router";
import Button from "@material-ui/core/Button";
import ChallengeForm from "../common/ChallengeForm";
import {
  ConfigurableChallengeData,
  EmptyChallengeData,
  isChallengeDataValid,
  isDuplicatingExistingChallengeName,
  isSameDay
} from "../../../types/Challenges";
import User from "../../../types/User";
import { linkToChallengesPage } from "../../../routes/challenges/links";
import { useUser } from "../../../providers/UserProvider";
import { createChallenge } from "../../../features/firebase/challenges";
import { useChallenges } from "../../../providers/ChallengesProvider";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    padding: "5%"
  },

  submitButton: {
    width: "100%"
  },

  formErrorWarning: {
    color: "#f00",
    margin: "5px 0"
  }
}));

type Props = {};

export default function CreateChallenge({}: Props) {
  const styles = useStyles();
  const history = useHistory();
  const handleBack = { handleBack: () => history.goBack(), confirm: true };

  const challengeData = useChallenges();
  const challenges = challengeData?.challenges || [];
  const [
    challengeFormData,
    setChallengeFormData
  ] = useState<ConfigurableChallengeData>(EmptyChallengeData);

  const user = useUser();
  if (user === undefined) {
    return (
      <PageWrapper
        label={"Create a challenge"}
        navigationHandler={handleBack}
        className={styles.wrapper}
      >
        You need to be logged in to create a challenge.
      </PageWrapper>
    );
  }

  const duplicatingExistingChallengeName = isDuplicatingExistingChallengeName(
    challengeFormData,
    challenges
  );
  const challengeReady =
    isChallengeDataValid(challengeFormData) &&
    !duplicatingExistingChallengeName;

  const createAndViewChallenge = async () => {
    if (user !== undefined) {
      await createChallenge(user, challengeFormData);
    } else {
      console.error(`Tried to create challenge but user was undefined.`);
    }
    history.push(linkToChallengesPage());
  };

  return (
    <PageWrapper
      label={"Create a challenge"}
      navigationHandler={handleBack}
      className={styles.wrapper}
    >
      <ChallengeForm
        initialData={undefined}
        refreshCounter={0}
        onChallengeDataUpdated={setChallengeFormData}
      />
      <Button
        className={styles.submitButton}
        onClick={createAndViewChallenge}
        color="primary"
        variant="contained"
        disabled={!challengeReady}
      >
        Create challenge
      </Button>
      {duplicatingExistingChallengeName && (
        <div className={styles.formErrorWarning}>
          Cannot have the same name as an existing challenge
        </div>
      )}
    </PageWrapper>
  );
}
