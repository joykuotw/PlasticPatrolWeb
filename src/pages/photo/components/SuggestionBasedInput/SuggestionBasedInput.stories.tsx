// @ts-nocheck

import React from "react";

import SuggestionBasedInput from "./SuggestionBasedInput";

export default {
  title: "SuggestionBasedInput",
  component: SuggestionBasedInput
};

const props = {
  setType: () => {},
  className: ""
};

export const defaultSelector = () => <SuggestionBasedInput {...props} />;
