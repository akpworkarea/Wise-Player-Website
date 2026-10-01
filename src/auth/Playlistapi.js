import api from './axiosInstance';

// ─── Playlist APIs ──────────────────────────────────────────────────────────
// All endpoints are public and scoped by MAC address.
// Base path: /api/playlist/public/{macAddress}

/**
 * 1. GET all playlists for a MAC address.
 * GET /api/playlist/public/{macAddress}?pin={pin}
 *
 * `pin` is optional — if the device hasn't set one, the API (and this
 * helper) fall back to the default PIN "0000".
 */
export const getPlaylists = async (macAddress, pin) => {
  try {
    if (!macAddress) return { success: false, message: 'MAC address is missing!' };
    const safePin = pin && String(pin).trim() ? String(pin).trim() : '0000';
    const response = await api.get(`/api/playlist/public/${macAddress}`, {
      params: { pin: safePin },
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.error   ||
        error.response?.data?.message ||
        'Failed to fetch playlists',
    };
  }
};

/**
 * 2. CREATE a new playlist for a MAC address.
 * POST /api/playlist/public/{macAddress}/m3u  body: { name, m3uUrl }
 */
export const saveM3uPlaylist = async (macAddress, playlistData) => {
  try {
    if (!macAddress) return { success: false, message: 'MAC address is missing!' };
    const response = await api.post(`/api/playlist/public/${macAddress}/m3u`, {
      name: playlistData.name,
      m3uUrl: playlistData.m3uUrl,
    });
    return { success: true, message: response.data.message || 'Playlist saved!', data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.error   ||
        error.response?.data?.message ||
        'Failed to save playlist',
    };
  }
};

/**
 * 3. UPDATE (PUT) an existing playlist by ID.
 * PUT /api/playlist/public/{macAddress}/{playlistId}  body: { name, m3uUrl }
 */
export const updatePlaylist = async (macAddress, playlistId, playlistData) => {
  try {
    if (!macAddress) return { success: false, message: 'MAC address is missing!' };
    if (!playlistId) return { success: false, message: 'Playlist ID is missing!' };
    const response = await api.put(`/api/playlist/public/${macAddress}/${playlistId}`, {
      name: playlistData.name,
      m3uUrl: playlistData.m3uUrl,
    });
    return { success: true, message: response.data.message || 'Playlist updated!', data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.error   ||
        error.response?.data?.message ||
        'Failed to update playlist',
    };
  }
};

/**
 * 4. DELETE a playlist by ID.
 * DELETE /api/playlist/public/{macAddress}/{playlistId}
 */
export const deletePlaylist = async (macAddress, playlistId) => {
  try {
    if (!macAddress) return { success: false, message: 'MAC address is missing!' };
    if (!playlistId) return { success: false, message: 'Playlist ID is missing!' };
    const response = await api.delete(`/api/playlist/public/${macAddress}/${playlistId}`);
    return { success: true, message: response.data?.message || 'Playlist deleted!', data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.error   ||
        error.response?.data?.message ||
        'Failed to delete playlist',
    };
  }
};