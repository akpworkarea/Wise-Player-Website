import axios from "axios";
import api from "./axiosInstance";
const token = localStorage.getItem("token");

export const createReseller = async (data) => {
  try {
    const response = await api.post(
      "/api/reseller/sub-resellers",
      data, // ✅ send directly
    );
   
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create reseller",
    };
  }
};

export const getAllResellerInfo = async (page = 0) => {
  try {
    const response = await api.get(
      `/api/reseller/sub-resellers?page=${page}&size=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: true, data: response.data };

  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch reseller data",
    };
  }
};


export const transferCredits = async (payload) => {
  try {
    const response = await api.post(
      "/api/reseller/credits/transfer",
      payload
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Transfer failed",
    };
  }
};

export const updateSubReseller = async (id, payload) => {
  try {
    const response = await api.put(
      `/api/reseller/sub-resellers/${id}`,
      payload
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Update failed",
    };
  }
};