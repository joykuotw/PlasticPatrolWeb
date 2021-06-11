const useProdData = process.env.REACT_APP_USE_PROD_DATA === "true";
const config =
  !useProdData && process.env.NODE_ENV === "development"
    ? require("./config.test.json")
    : require("./config.json");

console.log(config);

export default config;
