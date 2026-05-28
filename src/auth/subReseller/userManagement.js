import api from "../axiosInstance";

/**
 * Fetch paginated sub-reseller users with optional server-side filters.
 * @param {number} page        - 0-based page index
 * @param {number} size        - page size (default 20)
 * @param {string} search      - device ID / MAC fragment (optional)
 * @param {string} status      - "ACTIVE" | "INACTIVE" | "" (optional)
 * @param {string} subscription - subscription type string (optional)
 */
export const subResellerUserInfo = async (
  page = 0,
  size = 20,
  search = "",
  status = "",
  subscription = ""
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);
    if (search.trim())       params.append("search", search.trim());
    if (status)              params.append("status", status);
    if (subscription)        params.append("subscription", subscription);

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