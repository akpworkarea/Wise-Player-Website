import api from "../axiosInstance";

// ✅ GET REQUESTS (Unified)
export const getActivationRequests = async (
  role,
  status = "",
  page = 0
) => {
  try {
    const url =
      role === "SUB_RESELLER"
        ? "/api/sub-reseller/activation-request"
        : "/api/reseller/activation-request";

    let apiUrl = url;

    // ✅ status first
    if (status) {
      apiUrl += `?status=${status}&page=${page}&size=20`;
    } else {
      apiUrl += `?page=${page}&size=20`;
    }

    const response = await api.get(apiUrl);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch requests",
    };
  }
};

// ✅ POST REQUEST (Unified)
export const createActivationRequest = async (role, payload) => {
  try {
    const url =
      role === "SUB_RESELLER"
        ? "/api/sub-reseller/activation-request"
        : "/api/reseller/activation-request";

    const response = await api.post(url, payload);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to submit request",
    };
  }
};

// ✅ GET PLANS
export const getPlans = async () => {
  try {
    const response = await api.get("/api/payment/public/plans");

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch plans",
    };
  }
};