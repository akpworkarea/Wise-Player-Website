import api from "../axiosInstance";

/**
 * Unified playlist API — one file for both RESELLER and SUB_RESELLER,
 * same pattern as device.js. Pass role = "RESELLER" | "SUB_RESELLER".
 */
const base = (role) =>
  role === "SUB_RESELLER" ? "/api/sub-reseller/playlists" : "/api/reseller/playlists";

// ── GET all playlists ─────────────────────────────────────────────────────
export const getPlaylists = async (role) => {
  try {
    const response = await api.get(base(role));
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch playlists" };
  }
};

// ── GET single playlist ───────────────────────────────────────────────────
export const getPlaylistById = async (role, id) => {
  try {
    const response = await api.get(`${base(role)}/${id}`);
    return { success: true, data: response.data?.data ?? response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch playlist" };
  }
};

// ── POST create M3U playlist ──────────────────────────────────────────────
export const createM3uPlaylist = async (role, payload) => {
  try {
    const response = await api.post(`${base(role)}/m3u`, payload);
    return { success: true, data: response.data?.data ?? response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to create M3U playlist" };
  }
};

// ── POST create Xtream playlist ───────────────────────────────────────────
export const createXtreamPlaylist = async (role, payload) => {
  try {
    const response = await api.post(`${base(role)}/xtream`, payload);
    return { success: true, data: response.data?.data ?? response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to create Xtream playlist" };
  }
};

// ── PATCH update playlist (works for either type) ─────────────────────────
export const updatePlaylist = async (role, id, payload) => {
  try {
    const response = await api.patch(`${base(role)}/${id}`, payload);
    return { success: true, data: response.data?.data ?? response.data, message: response.data?.message };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to update playlist" };
  }
};

// ── DELETE playlist ────────────────────────────────────────────────────────
export const deletePlaylist = async (role, id) => {
  try {
    const response = await api.delete(`${base(role)}/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to delete playlist" };
  }
};

// ── PUT assign playlist to a device ───────────────────────────────────────
export const assignPlaylist = async (role, id, deviceId) => {
  try {
    const response = await api.put(`${base(role)}/${id}/assign`, { deviceId });
    return { success: true, data: response.data?.data ?? response.data, message: response.data?.message };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to assign playlist" };
  }
};

// ── DELETE unassign playlist from its device ──────────────────────────────
export const unassignPlaylist = async (role, id) => {
  try {
    const response = await api.delete(`${base(role)}/${id}/assign`);
    return { success: true, data: response.data?.data ?? response.data, message: response.data?.message };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to unassign playlist" };
  }
};

// ── PATCH toggle pin ───────────────────────────────────────────────────────
export const togglePinPlaylist = async (role, id) => {
  try {
    const response = await api.patch(`${base(role)}/${id}/pin`);
    return { success: true, data: response.data?.data ?? response.data, message: response.data?.message };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to update pin state" };
  }
};