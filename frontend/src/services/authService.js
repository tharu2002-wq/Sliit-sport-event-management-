import api from "./api";

export const registerAdmin = async (payload) => {
  const { data } = await api.post("/auth/admin/register", payload);
  return data;
};

export const loginAdmin = async (payload) => {
  const { data } = await api.post("/auth/admin/login", payload);
  return data;
};

export const registerUser = async (payload) => {
  const { data } = await api.post("/auth/user/register", payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await api.post("/auth/user/login", payload);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};
