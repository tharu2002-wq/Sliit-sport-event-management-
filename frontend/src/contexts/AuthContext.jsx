import { createContext, useContext, useMemo, useState } from "react";
import { loginRequest, registerRequest } from "../api/auth";
import { clearAuthSession, getStoredUser, setAuthSession } from "../utils/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const login = async (credentials) => {
    const data = await loginRequest(credentials);
    setAuthSession(data);
    const { _id, name, email, role, ...rest } = data;
    const nextUser = { _id, name, email, role, ...rest };
    setUser(nextUser);
    return nextUser;
  };

  const register = async (payload) => {
    const data = await registerRequest(payload);
    setAuthSession(data);
    const { _id, name, email, role, ...rest } = data;
    const nextUser = { _id, name, email, role, ...rest };
    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  const updateUser = (data) => {
    const nextUser = { ...user, ...data };
    setUser(nextUser);
    setAuthSession(nextUser); // Persistence
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateUser,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
