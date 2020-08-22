import React, { useContext, useReducer } from "react";

import type { State, Action } from "./types";
import reducer from "./reducer";

type Props = { children: React.ReactNode };

const initialState = {
  rawData: {
    fromCamera: undefined,
    file: undefined
  },
  processedData: {
    imgSrc: undefined,
    imgExif: undefined,
    imgLocation: undefined,
    imgIptc: undefined
  }
};

const PhotoPageContext = React.createContext<{
  state: State;
  dispatch: (action: Action) => void;
}>({ state: initialState, dispatch: () => null });

export default function PhotoPageStateProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <PhotoPageContext.Provider value={{ state, dispatch }}>
      {children}
    </PhotoPageContext.Provider>
  );
}

export const usePhotoPageState = () => {
  return useContext(PhotoPageContext).state;
};

export const usePhotoPageDispatch = () => {
  return useContext(PhotoPageContext).dispatch;
};
