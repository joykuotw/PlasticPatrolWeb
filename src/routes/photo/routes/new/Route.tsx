import React, { createRef, useState } from "react";
import { Route, useHistory } from "react-router-dom";

import { linkToTutorialPage } from "routes/tutorial/links";

import AddPhotoDialog from "pages/photo/components/AddPhotoDialog";
import { usePhotoPageDispatch, setFile, FileType } from "pages/photo/state";
import { NewPhotoPage } from "pages/photo";
import { DesktopPhotoFallback } from "components/common/DesktopPhotoFallback";

import { linkToCategorise } from "../categorise/links";
import { linkToAddDialog, linkToNewPhoto } from "./links";

const linkToTutorialWithRedirect = () => ({
  pathname: linkToTutorialPage(),
  state: {
    redirectOnGetStarted: linkToNewPhoto()
  }
});

export default function NewPhotoRoute() {
  const history = useHistory();

  const dispatch = usePhotoPageDispatch();
  const handlePhotoSelect = (file: FileType, fromCamera: boolean) => {
    dispatch(setFile(file, fromCamera));
    history.push(linkToCategorise());
  };
  const desktopPhotoRef = createRef<HTMLInputElement>();

  // @ts-ignore
  const isCordova = !!window.cordova;

  return (
    <>
      <NewPhotoPage
        onPhotoClick={() => {
          isCordova
            ? history.push(linkToAddDialog())
            : desktopPhotoRef.current && desktopPhotoRef.current.click();
        }}
        linkToTutorialPage={linkToTutorialWithRedirect}
      />
      <DesktopPhotoFallback
        ref={desktopPhotoRef}
        handlePhotoSelect={handlePhotoSelect}
      />
      <Route path={linkToAddDialog()} exact>
        <AddPhotoDialog
          onClose={() => history.goBack()}
          handlePhotoSelect={(image, fromCamera) =>
            handlePhotoSelect(image, fromCamera)
          }
        />
      </Route>
    </>
  );
}
