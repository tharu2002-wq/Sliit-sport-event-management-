import axios from "axios";

const explicitApiUrl = import.meta.env.VITE_API_URL;
const DEFAULT_API_BASES = [
  "http://localhost:5000/api",
  "http://localhost:5001/api",
  "http://localhost:5002/api",
];

const API_BASE_CANDIDATES = [
  ...(explicitApiUrl ? [explicitApiUrl] : []),
  ...DEFAULT_API_BASES,
].filter((value, index, list) => list.indexOf(value) === index);

const api = axios.create({
  baseURL: API_BASE_CANDIDATES[0],
});

const ADMIN_TOKEN_KEY = "adminAuthToken";
const USER_TOKEN_KEY = "userAuthToken";
const USER_PATH_PREFIXES = ["/student", "/user"];

const isUserPortalPath = (path = "") =>
  USER_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));

const isAuthEndpoint = (url = "") => {
  return (
    url.includes("/auth/admin/login") ||
    url.includes("/auth/admin/register") ||
    url.includes("/auth/user/login") ||
    url.includes("/auth/user/register")
  );
};

const getCandidateIndex = (baseURL) => {
  const normalized = String(baseURL || "");
  return API_BASE_CANDIDATES.findIndex((candidate) => candidate === normalized);
};

api.interceptors.request.use((config) => {
  const requestUrl = String(config.url || "");
  const isAdminAuthRoute = requestUrl.includes("/auth/admin/");
  const isUserAuthRoute = requestUrl.includes("/auth/user/");

  let token = null;
  if (isAdminAuthRoute) {
    token = localStorage.getItem(ADMIN_TOKEN_KEY);
  } else if (isUserAuthRoute) {
    token = localStorage.getItem(USER_TOKEN_KEY);
  } else {
    const path = window.location.pathname;
    token = isUserPortalPath(path)
      ? localStorage.getItem(USER_TOKEN_KEY)
      : localStorage.getItem(ADMIN_TOKEN_KEY);
  }

  if (token && !isAuthEndpoint(requestUrl)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestConfig = error?.config;
    const hasNoResponse = !error?.response;

    if (hasNoResponse && requestConfig && API_BASE_CANDIDATES.length > 1) {
      const currentIndex =
        typeof requestConfig.__baseCandidateIndex === "number"
          ? requestConfig.__baseCandidateIndex
          : Math.max(getCandidateIndex(requestConfig.baseURL || api.defaults.baseURL), 0);

      const nextIndex = currentIndex + 1;

      if (nextIndex < API_BASE_CANDIDATES.length) {
        requestConfig.__baseCandidateIndex = nextIndex;
        requestConfig.baseURL = API_BASE_CANDIDATES[nextIndex];
        return api.request(requestConfig);
      }
    }

    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || "");

    if (status === 401 && !isAuthEndpoint(requestUrl)) {
      const path = window.location.pathname;
      const isAdminPath = !isUserPortalPath(path);
      localStorage.removeItem(isAdminPath ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY);
      const redirectPath = path.startsWith("/admin") ? "/admin/login" : "/user/login";

      if (path !== redirectPath) {
        window.location.replace(redirectPath);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
