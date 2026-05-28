import axios from 'axios';
import api from './axiosInstance';
const token = localStorage.getItem("token");

/**
 * Fetch paginated users with optional server-side filters.
 * @param {number} page        - 0-based page index
 * @param {number} size        - page size (default 20)
 * @param {string} search      - device ID / MAC fragment (optional)
 * @param {string} status      - "ACTIVE" | "INACTIVE" | "" (optional)
 * @param {string} subscription - subscription type string (optional)
 */
export const subscibedUserinfo = async (
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

    const response = await api.get(`/api/reseller/users?${params.toString()}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch dashboard data",
    };
  }
};

export const DisableUserAccount = async (deviceId) => {
  try {
    const response = await api.put(`/api/reseller/users/${deviceId}/disable`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch dashboard data",
    };
  }
};

export const createUser = async (deviceId) => {
  try {
    const response = await api.post(
      `/api/reseller/user`,
      { deviceId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create user",
    };
  }
};