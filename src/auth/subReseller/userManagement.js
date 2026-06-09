import api from "../axiosInstance";

/**
 * Fetch paginated sub-reseller users with optional server-side filters.
 * @param {number} page           - 0-based page index
 * @param {number} size           - page size (default 20)
 * @param {string} search         - MAC address / Device ID partial (?search=)
 * @param {string} status         - "ACTIVE" | "INACTIVE" | ""
 * @param {string} subscription   - plan name | ""
 * @param {string} registeredFrom - YYYY-MM-DD | ""
 * @param {string} registeredTo   - YYYY-MM-DD | ""
 * @param {string} expiresFrom    - YYYY-MM-DD | ""
 * @param {string} expiresTo      - YYYY-MM-DD | ""
 */
export const subResellerUserInfo = async (
  page           = 0,
  size           = 20,
  search         = "",
  status         = "",
  subscription   = "",
  registeredFrom = "",
  registeredTo   = "",
  expiresFrom    = "",
  expiresTo      = "",
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);
    if (search.trim())   params.append("search",         search.trim());
    if (status)          params.append("status",         status);
    if (subscription)    params.append("subscription",   subscription);
    if (registeredFrom)  params.append("registeredFrom", registeredFrom);
    if (registeredTo)    params.append("registeredTo",   registeredTo);
    if (expiresFrom)     params.append("expiresFrom",    expiresFrom);
    if (expiresTo)       params.append("expiresTo",      expiresTo);

    const response = await api.get(`/api/sub-reseller/users?${params.toString()}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch users",
    };
  }
};

export const createSubResellerUser = async (payload) => {
  try {
    const response = await api.post("/api/sub-reseller/user", payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create user",
    };
  }
};

export const disableSubResellerUser = async (deviceId) => {
  try {
    const response = await api.put(`/api/sub-reseller/users/${deviceId}/disable`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message,
    };
  }
};