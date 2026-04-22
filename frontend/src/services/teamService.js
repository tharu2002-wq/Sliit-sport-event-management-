import api from "./api";

export const getTeams = async (params) => {
  const { data } = await api.get("/teams", { params });
  return data;
};

export const getMyTeamRequests = async () => {
  const { data } = await api.get("/teams/my-requests");
  return data;
};

export const createTeam = async (payload) => {
  const { data } = await api.post("/teams", payload);
  return data;
};

export const updateTeam = async (id, payload) => {
  const { data } = await api.put(`/teams/${id}`, payload);
  return data;
};

export const reviewTeamRequest = async (id, payload) => {
  const { data } = await api.patch(`/teams/${id}/review`, payload);
  return data;
};

export const deleteTeam = async (id) => {
  const { data } = await api.delete(`/teams/${id}`);
  return data;
};
