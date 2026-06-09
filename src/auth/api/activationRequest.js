import api from "../axiosInstance";

/**
 * GET activation requests — unified for RESELLER and SUB_RESELLER.
 *
 * @param {string} role        - "RESELLER" | "SUB_RESELLER"
 * @param {number} page        - 0-based page index
 * @param {number} size        - page size (default 20)
 * @param {string} search      - free-text: request ID / device ID / MAC address / plan name
 * @param {string} status      - "PENDING" | "APPROVED" | "REJECTED" | ""
 * @param {string} planName    - plan name, partial match (e.g. "trial", "MONTHLY") | ""
 * @param {string} fromDate    - YYYY-MM-DD | ""
 * @param {string} toDate      - YYYY-MM-DD | ""
 * @param {string} minCredits  - numeric string | ""
 * @param {string} maxCredits  - numeric string | ""
 */
export const getActivationRequests = async (
  role,
  page       = 0,
  size       = 20,
  search     = "",
  status     = "",
  planName   = "",
  fromDate   = "",
  toDate     = "",
  minCredits = "",
  maxCredits = "",
) => {
  try {
    const base = role === "SUB_RESELLER"
      ? "/api/sub-reseller/activation-request"
      : "/api/reseller/activation-request";

    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);
    if (search.trim()) params.append("search",     search.trim());
    if (status)        params.append("status",     status);
    if (planName)      params.append("planName",   planName);
    if (fromDate)      params.append("fromDate",   fromDate);
    if (toDate)        params.append("toDate",     toDate);
    if (minCredits)    params.append("minCredits", minCredits);
    if (maxCredits)    params.append("maxCredits", maxCredits);

    const response = await api.get(`${base}?${params.toString()}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch requests",
    };
  }
};

/**
 * GET subscription plans — uses the public plans endpoint.
 * Role is accepted for forward-compatibility but currently both roles
 * use the same public endpoint.
 * @param {string} role - "RESELLER" | "SUB_RESELLER"
 */
export const getPlans = async (role) => {
  try {
    const response = await api.get("/api/payment/public/plans");
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch plans",
    };
  }
};

/**
 * POST — create a new activation request.
 * @param {string} role    - "RESELLER" | "SUB_RESELLER"
 * @param {object} payload - { deviceId, planName, amount, currency }
 */
export const createActivationRequest = async (role, payload) => {
  try {
    const url = role === "SUB_RESELLER"
      ? "/api/sub-reseller/activation-request"
      : "/api/reseller/activation-request";
    const response = await api.post(url, payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to submit request",
    };
  }
};