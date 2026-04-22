import api from "./api";

export const getSocieties = async (params) => {
  const { data } = await api.get("/societies", { params });
  return data;
};

export const getNextSocietyCode = async () => {
  const { data } = await api.get("/societies/next-code");
  return data;
};

export const getSocietyDetails = async (id) => {
  const { data } = await api.get(`/societies/${id}`);
  return data;
};

export const createSociety = async (payload) => {
  const { data } = await api.post("/societies", payload);
  return data;
};

export const updateSociety = async (id, payload) => {
  const { data } = await api.put(`/societies/${id}`, payload);
  return data;
};

export const deleteSociety = async (id) => {
  const { data } = await api.delete(`/societies/${id}`);
  return data;
};
