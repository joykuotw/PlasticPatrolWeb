import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import "react-circular-progressbar/dist/styles.css";
import { useHistory } from "react-router";
import Button from "@material-ui/core/Button";
import { Route, useParams } from "react-router-dom";
import MissionForm from "../common/MissionForm";
import {
  MissionFirestoreData,
  ConfigurableMissionData,
  equal,
  isMissionDataValid,
  isDuplicatingExistingMissionName
} from "../../../types/Missions";
import { editMission } from "../../../features/firebase/missions";
import {
  MissionsProviderData,
  useMissions
} from "../../../providers/MissionsProvider";
import {
  linkToMission,
  linkToMissionsPage
} from "../../../routes/missions/links";

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

export default function EditMission({}: Props) {
  const styles = useStyles();
  const history = useHistory();
  const handleBack = { handleBack: () => history.goBack(), confirm: true };

  const missionData = useMissions();
  const missions = missionData?.missions || [];

  const { missionId } = useParams();
  const originalMission = missions.find((ch) => ch.id.toString() === missionId);
  if (originalMission === undefined) {
    console.warn(
      `Trying to edit mission ${missionId} but couldn't find mission data in list.`
    );
  }

  const [formRefreshCounter, setFormRefreshCounter] = useState(0);
  const [missionFormData, setMissionFormData] = useState<
    ConfigurableMissionData | undefined
  >(originalMission);

  const duplicatingExistingMissionName = isDuplicatingExistingMissionName(
    missionFormData,
    missions,
    missionId
  );
  const missionReady: boolean = isMissionDataValid(missionFormData);
  const missionChanged: boolean =
    originalMission === undefined ||
    missionFormData === undefined ||
    !equal(originalMission, missionFormData);

  const applyEdits = async () => {
    if (missionFormData === undefined) {
      return;
    }
    await editMission(missionId, missionFormData);
    await missionData?.refresh();
    await history.push(linkToMission(missionId));
  };

  const discardEdits = () => {
    setMissionFormData(originalMission);
    setFormRefreshCounter(formRefreshCounter + 1);
  };

  return (
    <PageWrapper
      label={"Edit mission"}
      navigationHandler={handleBack}
      className={styles.wrapper}
    >
      <MissionForm
        initialData={originalMission}
        refreshCounter={formRefreshCounter}
        onMissionDataUpdated={setMissionFormData}
      />
      <div className={styles.buttons}>
        <Button
          className={styles.button}
          onClick={applyEdits}
          color="primary"
          variant="contained"
          disabled={!missionReady || !missionChanged}
        >
          Apply changes
        </Button>
        <Button
          className={styles.button}
          onClick={discardEdits}
          color="primary"
          variant="contained"
          disabled={!missionChanged}
        >
          Discard changes
        </Button>
      </div>
      {duplicatingExistingMissionName && (
        <div className={styles.formErrorWarning}>
          Cannot have the same name as an existing mission
        </div>
      )}
    </PageWrapper>
  );
}
