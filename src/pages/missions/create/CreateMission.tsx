import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import "react-circular-progressbar/dist/styles.css";
import { useHistory } from "react-router";
import Button from "@material-ui/core/Button";
import MissionForm from "../common/MissionForm";
import {
  ConfigurableMissionData,
  EmptyMissionData,
  isMissionDataValid,
  isDuplicatingExistingMissionName,
  isSameDay
} from "../../../types/Missions";
import User from "../../../types/User";
import { linkToMissionsPage } from "../../../routes/missions/links";
import { useUser } from "../../../providers/UserProvider";
import { createMission } from "../../../features/firebase/missions";
import { useMissions } from "../../../providers/MissionsProvider";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    padding: "5%"
  },

  submitButton: {
    marginTop: "10px",
    width: "100%"
  },

  formErrorWarning: {
    color: "#f00",
    margin: "5px 0"
  }
}));

type Props = {};

export default function CreateMission({}: Props) {
  const styles = useStyles();
  const history = useHistory();
  const handleBack = { handleBack: () => history.goBack(), confirm: true };

  const missionData = useMissions();
  const missions = missionData?.missions || [];
  const [
    missionFormData,
    setMissionFormData
  ] = useState<ConfigurableMissionData>(EmptyMissionData);

  const user = useUser();
  if (user === undefined) {
    return (
      <PageWrapper
        label={"Create a mission"}
        navigationHandler={handleBack}
        className={styles.wrapper}
      >
        You need to be logged in to create a mission!
      </PageWrapper>
    );
  }

  const duplicatingExistingMissionName = isDuplicatingExistingMissionName(
    missionFormData,
    missions
  );
  const missionReady =
    isMissionDataValid(missionFormData) && !duplicatingExistingMissionName;

  const createAndViewMission = async () => {
    await createMission(user, missionFormData);
    await missionData?.refresh();
    history.push(linkToMissionsPage());
  };

  return (
    <PageWrapper
      label={"Create a mission"}
      navigationHandler={handleBack}
      className={styles.wrapper}
    >
      <MissionForm
        initialData={undefined}
        refreshCounter={0}
        onMissionDataUpdated={setMissionFormData}
      />
      <Button
        className={styles.submitButton}
        onClick={createAndViewMission}
        color="primary"
        variant="contained"
        disabled={!missionReady}
      >
        Create mission
      </Button>
      {duplicatingExistingMissionName && (
        <div className={styles.formErrorWarning}>
          Cannot have the same name as an existing mission
        </div>
      )}
    </PageWrapper>
  );
}
