const runtimeEnv = window.__ENV__?.API_BASE_URL;
const buildEnv = process.env.REACT_APP_API_BASE_URL;

const API_BASE_URL =
  runtimeEnv && !runtimeEnv.includes("__API_BASE_URL__")
    ? runtimeEnv
    : buildEnv || "http://localhost:5000";

export default API_BASE_URL;
