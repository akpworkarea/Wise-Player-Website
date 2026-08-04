import api from "./axiosInstance";

/**
 * GET all sub-resellers with optional server-side filters.
 * NOTE: response now also embeds `bulkPermissions` (role-level CRUD defaults)
 * alongside `content`, so a separate crud-permissions call is no longer needed.
 */
export const getAllResellerInfo = async (
  page       = 0,
  size       = 20,
  search     = "",
  status     = "",
  fromDate   = "",
  toDate     = "",
  minCredits = "",
  maxCredits = "",
  signal,                       // NEW
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);
    if (search.trim()) params.append("search",     search.trim());
    if (status)        params.append("status",     status);
    if (fromDate)      params.append("fromDate",   fromDate);
    if (toDate)        params.append("toDate",     toDate);
    if (minCredits)    params.append("minCredits", minCredits);
    if (maxCredits)    params.append("maxCredits", maxCredits);

    const response = await api.get(
      `/api/reseller/sub-resellers?${params.toString()}`,
      { signal },                // NEW
    );
    return { success: true, data: response.data };
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      return { success: false, cancelled: true };   // NEW — swallow silently
    }
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch reseller data",
    };
  }
};

export const createReseller = async (data) => {
  try {
    const response = await api.post("/api/reseller/sub-resellers", data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create reseller",
    };
  }
};

export const transferCredits = async (payload) => {
  try {
    const response = await api.post("/api/reseller/credits/transfer", payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Transfer failed",
    };
  }
};

export const updateSubReseller = async (id, payload) => {
  try {
    const response = await api.put(`/api/reseller/sub-resellers/${id}`, payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Update failed",
    };
  }
};

/**
 * DELETE a sub-reseller by ID.
 * DELETE /api/reseller/sub-resellers/{subresellerId}
 */
export const deleteSubReseller = async (id) => {
  try {
    const response = await api.delete(`/api/reseller/sub-resellers/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete sub-reseller",
    };
  }
};

/**
 * Bulk-update CRUD permissions for ALL sub-resellers under this reseller.
 * PATCH /api/reseller/sub-resellers/bulk-permissions
 * Body: { canCreate, canRead, canUpdate, canDelete }  — all booleans
 */
export const updateBulkPermissions = async (permissions) => {
  try {
    const response = await api.put(
      "/api/reseller/sub-resellers/bulk-permissions",
      permissions,
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update permissions",
    };
  }
};

/**
 * PATCH individual CRUD permissions for a single sub-reseller.
 * PATCH /api/reseller/crud-permissions/{subresellerUuid}
 */
export const updateIndividualPermission = async (subresellerId, permissions) => {
  try {
    const response = await api.patch(
      `/api/reseller/crud-permissions/${subresellerId}`,
      permissions,
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update permissions",
    };
  }
};