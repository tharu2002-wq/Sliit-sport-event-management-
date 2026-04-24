const TOKEN_KEY = "sportSync_token";
const USER_KEY = "sportSync_user";
const ADMIN_TOKEN_KEY = "adminAuthToken";
const USER_TOKEN_KEY = "userAuthToken";

const normalizeRole = (role) => String(role || "").toLowerCase();

export function setAuthSession(data) {
  const { token, _id, name, email, role, ...rest } = data;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);

    // Keep legacy role-based keys in sync for older API/service modules.
    const normalizedRole = normalizeRole(role);
    if (normalizedRole === "student") {
      localStorage.setItem(USER_TOKEN_KEY, token);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } else if (normalizedRole === "admin" || normalizedRole === "organizer") {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.removeItem(USER_TOKEN_KEY);
    }
  }
  localStorage.setItem(USER_KEY, JSON.stringify({ _id, name, email, role, ...rest }));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(ADMIN_TOKEN_KEY) ||
    localStorage.getItem(USER_TOKEN_KEY)
  );
}

/**
 * @returns {Record<string, unknown> & { _id: string; name: string; email: string; role: string } | null}
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    const id = user?._id || user?.id;
    if (user && id) {
      return { ...user, _id: id };
    }
  } catch (err) {
    // Silence parse errors
  }
  return null;
}
