import React from "react";
import { useHistory, useLocation } from "react-router";

import PageWrapper from "components/PageWrapper";
import PhotoPageStateProvider from "pages/photo/state";
import PhotoPageSubRouter from "./routes/SubRouter";
import { linkToNewPhoto } from "./routes/new/links";

export default function PhotoRoute() {
  const history = useHistory();
  const location = useLocation();

  const navigationHandler =
    location.pathname === linkToNewPhoto()
      ? { handleClose: () => history.push("/") }
      : { handleBack: () => history.goBack(), confirm: true };

  return (
    <PhotoPageStateProvider>
      <PageWrapper
        label={"Record your litter"}
        navigationHandler={navigationHandler}
      >
        <PhotoPageSubRouter />
      </PageWrapper>
    </PhotoPageStateProvider>
  );
}
