const useProdData = process.env.REACT_APP_USE_PROD_DATA === "true";
const config =
  !useProdData && process.env.NODE_ENV === "development"
    ? require("./config.dev.json")
    : require("./config.json");

export default config;
