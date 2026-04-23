import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  loginAdmin,
  loginUser,
  registerAdmin,
  registerUser,
} from "../services/authService";

const AuthContext = createContext(null);
const ADMIN_TOKEN_KEY = "adminAuthToken";
const USER_TOKEN_KEY = "userAuthToken";

const USER_PATH_PREFIXES = ["/student", "/user"];

const getPortalFromPath = (path = "") =>
  USER_PATH_PREFIXES.some((prefix) => path.startsWith(prefix)) ? "user" : "admin";

const getTokenKeyByPortal = (portal) => (portal === "admin" ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const portal = getPortalFromPath(window.location.pathname);
      const tokenKey = getTokenKeyByPortal(portal);
      const token = localStorage.getItem(tokenKey);

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { user: currentUser } = await getCurrentUser();

        const invalidRoleForPortal =
          (portal === "admin" && currentUser.role !== "Admin") ||
          (portal === "user" && currentUser.role === "Admin");

        if (invalidRoleForPortal) {
          localStorage.removeItem(tokenKey);
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(currentUser);
      } catch (error) {
        localStorage.removeItem(tokenKey);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const loginAsAdmin = async (payload) => {
    const { token, user: loggedInUser } = await loginAdmin(payload);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const registerAsAdmin = async (payload) => {
    const { token, user: createdUser } = await registerAdmin(payload);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    setUser(createdUser);
    return createdUser;
  };

  const loginAsUser = async (payload) => {
    const { token, user: loggedInUser } = await loginUser(payload);
    localStorage.setItem(USER_TOKEN_KEY, token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const registerAsUser = async (payload) => {
    const { token, user: createdUser } = await registerUser(payload);
    localStorage.setItem(USER_TOKEN_KEY, token);
    setUser(createdUser);
    return createdUser;
  };

  const logout = () => {
    if (user?.role === "Admin") {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } else if (user?.role === "Student") {
      localStorage.removeItem(USER_TOKEN_KEY);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(USER_TOKEN_KEY);
    }

    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      loginAsAdmin,
      registerAsAdmin,
      loginAsUser,
      registerAsUser,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
