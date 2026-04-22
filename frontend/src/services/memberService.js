import api from "./api";

export const getMembers = async (params) => {
  const { data } = await api.get("/members", { params });
  return data;
};

export const createMember = async (payload) => {
  const { data } = await api.post("/members", payload);
  return data;
};

export const updateMember = async (id, payload) => {
  const { data } = await api.put(`/members/${id}`, payload);
  return data;
};

export const deleteMember = async (id) => {
  const { data } = await api.delete(`/members/${id}`);
  return data;
};
