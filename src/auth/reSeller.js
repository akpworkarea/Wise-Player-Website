import api from "./axiosInstance";

/**
 * GET all sub-resellers with optional server-side filters.
 * @param {number} page        - 0-based page index
 * @param {number} size        - page size (default 20)
 * @param {string} search      - name / username / ID partial (?search=)
 * @param {string} status      - "true" | "false" | ""  (boolean string)
 * @param {string} fromDate    - YYYY-MM-DD | ""
 * @param {string} toDate      - YYYY-MM-DD | ""
 * @param {string} minCredits  - numeric string | ""
 * @param {string} maxCredits  - numeric string | ""
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
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);
    if (search.trim()) params.append("search",     search.trim());
    if (status)        params.append("status",     status);       // "true" | "false"
    if (fromDate)      params.append("fromDate",   fromDate);
    if (toDate)        params.append("toDate",     toDate);
    if (minCredits)    params.append("minCredits", minCredits);
    if (maxCredits)    params.append("maxCredits", maxCredits);

    const response = await api.get(
      `/api/reseller/sub-resellers?${params.toString()}`
    );
    return { success: true, data: response.data };
  } catch (error) {
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
    const response = await api.put(`/api/reseller/sub-resellers/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete sub-reseller",
    };
  }
};