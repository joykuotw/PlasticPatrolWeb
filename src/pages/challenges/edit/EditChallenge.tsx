import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import "react-circular-progressbar/dist/styles.css";
import { useHistory } from "react-router";
import Button from "@material-ui/core/Button";
import { Route, useParams } from "react-router-dom";
import ChallengeForm from "../common/ChallengeForm";
import { Challenge, ChallengeConfigurableData, equal, isChallengeReady } from "../../../types/Challenges";
import { editChallenge } from "../../../providers/ChallengesProvider";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    padding: "5%",
  },
  buttons: {
    display: "flex",
    flexDirection: "row",
  },
  button: {
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
  }
}));

type Props = {
  challenges: Challenge[];
};

export default function EditChallenge({challenges}: Props) {
  const styles = useStyles();
  const history = useHistory();
  const handleBack = { handleBack: () => history.goBack(), confirm: true };

  const {challengeId} = useParams();
  const originalChallenge = challenges.find(ch => ch.id.toString() === challengeId);
  if (originalChallenge === undefined) {
     console.warn(`Trying to edit challenge ${challengeId} but couldn't find challenge data in list.`);
  }

  const [formRefreshCounter, setFormRefreshCounter] = useState(0);
  const [challengeFormData, setChallengeFormData] = useState<ChallengeConfigurableData | undefined>(originalChallenge);

  const challengeReady: boolean = isChallengeReady(challengeFormData);
  const challengeChanged: boolean = originalChallenge === undefined
                                  || challengeFormData === undefined
                                  || !equal(originalChallenge, challengeFormData);

  const applyEdits = () => {
      if (challengeFormData === undefined) {
          return;
      }
    editChallenge(challengeId, challengeFormData)
  };

  const discardEdits = () => {
    setChallengeFormData(originalChallenge);
    setFormRefreshCounter(formRefreshCounter + 1);
  };

  return (
    <PageWrapper label={"Edit challenge"}
                 navigationHandler={handleBack}
                 className={styles.wrapper}>
      <ChallengeForm initialData={originalChallenge}
                     refreshCounter={formRefreshCounter}
                     onChallengeDataUpdated={setChallengeFormData}/>
      <div className={styles.buttons}>
        <Button className={styles.button}
                onClick={applyEdits}
                color="primary"
                variant="contained"
                disabled={!challengeReady || !challengeChanged}>
          Apply changes
        </Button>
        <Button className={styles.button}
                onClick={discardEdits}
                color="primary"
                variant="contained"
                disabled={!challengeChanged}>
          Discard changes
        </Button>
      </div>
      {/*{challengeFormData && (*/}
      {/*  <Route path={linkToSubmitChallengeDialog()}>*/}
      {/*    <UploadChallengeDialog*/}
      {/*      challengeCreateData={challengeFormData}*/}
      {/*      onCancelUpload={() => {*/}
      {/*      }}/>*/}
      {/*  </Route>*/}
      {/*)}*/}
    </PageWrapper>
  );
}
