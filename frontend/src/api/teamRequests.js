import { api } from "./client";

export async function getMyTeamRequest() {
  const { data } = await api.get("/team-requests/me");
  return data;
}

export async function getMyTeamRequests() {
  const { data } = await api.get("/team-requests/me/all");
  return Array.isArray(data?.requests) ? data.requests : [];
}

export async function createTeamRequest(payload) {
  const { data } = await api.post("/team-requests", payload);
  return data;
}

export async function listTeamRequests(params = {}) {
  const { data } = await api.get("/team-requests", { params });
  return Array.isArray(data) ? data : [];
}

/**
 * @param {string} id
 * @param {{ reason?: string }} [payload]
 */
export async function rejectTeamRequest(id, payload = {}) {
  const { data } = await api.patch(`/team-requests/${id}/reject`, payload);
  return data;
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} payload — teamName, sportType, society, captain, members, contactEmail?, contactPhone?
 */
export async function acceptTeamRequest(id, payload) {
  const { data } = await api.patch(`/team-requests/${id}/accept`, payload);
  return data;
}
