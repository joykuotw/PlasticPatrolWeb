import type { State, Action } from "./types";
import actionTypes from "./actionTypes";
import { initialState } from "./consts";

export default function reducer(state: State, action: Action) {
  switch (action.type) {
    case actionTypes.SET_FILE_STATE:
      return action.payload;

    case actionTypes.SET_META_DATA: {
      return action.payload;
    }
    case actionTypes.SET_LOCATION: {
      return { ...state, imgLocation: action.payload };
    }
    case actionTypes.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
