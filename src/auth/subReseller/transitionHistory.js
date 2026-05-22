import api from "../axiosInstance";

export const subResellerTransactionHistory = async (pageNo) => {
  try {
    const response = await api.get(
      `/api/sub-reseller/credits/transactions?page=${pageNo}&size=20`
    );

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch transaction history",
    };
  }
};