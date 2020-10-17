import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import "react-circular-progressbar/dist/styles.css";
import { useHistory } from "react-router";
import Button from "@material-ui/core/Button";
import ChallengeForm from "../common/ChallengeForm";
import { ChallengeConfigurableData, EmptyChallengeData, isChallengeReady } from "../../../types/Challenges";
import { createChallenge } from "../../../providers/ChallengesProvider";
import User from "../../../types/User";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    padding: "5%",
  },
  submitButton: {
    width: "100%"
  }
}));

type Props = {
  user: User;
};

export default function CreateChallenge({user}: Props) {
  const styles = useStyles();
  const history = useHistory();
  const handleBack = { handleBack: () => history.goBack(), confirm: true };

  const [challengeFormData, setChallengeFormData] = useState<ChallengeConfigurableData>(EmptyChallengeData);
  const challengeReady = isChallengeReady(challengeFormData);

  return (
    <PageWrapper label={"Create a challenge"}
                 navigationHandler={handleBack}
                 className={styles.wrapper}>
      <ChallengeForm initialData={undefined}
                     refreshCounter={0}
                     onChallengeDataUpdated={setChallengeFormData}/>
      <Button className={styles.submitButton}
              // onClick={() => history.push(linkToSubmitChallengeDialog())}
              onClick={() => createChallenge(user.id, challengeFormData)}
              color="primary"
              variant="contained"
              disabled={!challengeReady}>
        Create challenge
      </Button>
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
