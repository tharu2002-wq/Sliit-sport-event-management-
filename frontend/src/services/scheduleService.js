import api from "./api";

export const getSchedules = async (params) => {
  const { data } = await api.get("/schedules", { params });
  return data;
};

export const createSchedule = async (payload) => {
  const { data } = await api.post("/schedules", payload);
  return data;
};

export const updateSchedule = async (id, payload) => {
  const { data } = await api.put(`/schedules/${id}`, payload);
  return data;
};

export const deleteSchedule = async (id) => {
  const { data } = await api.delete(`/schedules/${id}`);
  return data;
};
