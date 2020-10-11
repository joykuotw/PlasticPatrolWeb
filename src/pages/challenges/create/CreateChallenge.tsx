import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import "react-circular-progressbar/dist/styles.css";
import { useHistory } from "react-router";
import Button from "@material-ui/core/Button";
import { Route } from "react-router-dom";
import { linkToSubmitChallengeDialog } from "../../../routes/challenges/links";
import UploadChallengeDialog from "./UploadChallengeDialog";
import ChallengeForm from "../common/ChallengeForm";
import { ChallengeConfigurableData } from "../../../types/Challenges";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    padding: "5%",
  },
  submitButton: {
    width: "100%"
  }
}));

type Props = {};

export default function CreateChallenge({}: Props) {

  const styles = useStyles();
  const history = useHistory();
  const handleBack = { handleBack: () => history.goBack(), confirm: true };

  const [challengeFormData, setChallengeFormData] = useState<ChallengeConfigurableData | undefined>(undefined);
  const challengeReady = challengeFormData !== undefined;

  return (
    <PageWrapper label={"Create a challenge"}
                 navigationHandler={handleBack}
                 className={styles.wrapper}>
      <ChallengeForm initialData={undefined}
                     updateChallengeReady={setChallengeFormData}/>

      <Button className={styles.submitButton}
              onClick={() => history.push(linkToSubmitChallengeDialog())}
              color="primary"
              variant="contained"
              disabled={!challengeReady}>
        Create challenge
      </Button>

      {challengeFormData && (
        <Route path={linkToSubmitChallengeDialog()}>
          <UploadChallengeDialog
            challengeCreateData={challengeFormData}
            onCancelUpload={() => {
            }}/>
        </Route>
      )}

    </PageWrapper>
  );
}
