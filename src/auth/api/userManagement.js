import api from "../axiosInstance";

/**
 * Unified device-management API — one file for both RESELLER and
 * SUB_RESELLER, matching the pattern used in activationRequest.js.
 * Pass role = "RESELLER" | "SUB_RESELLER" and the correct endpoint
 * is picked internally, so components no longer need to branch on
 * userRole themselves.
 */

// ── GET devices (paginated, filterable) ──────────────────────────────────────
/**
 * @param {string} role           - "RESELLER" | "SUB_RESELLER"
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
export const getUserDevices = async (
  role,
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
    const base = role === "SUB_RESELLER"
      ? "/api/sub-reseller/users"
      : "/api/reseller/users";

    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);
    if (search.trim())  params.append("search",         search.trim());
    if (status)          params.append("status",         status);
    if (subscription)    params.append("subscription",   subscription);
    if (registeredFrom)  params.append("registeredFrom", registeredFrom);
    if (registeredTo)    params.append("registeredTo",   registeredTo);
    if (expiresFrom)     params.append("expiresFrom",    expiresFrom);
    if (expiresTo)       params.append("expiresTo",      expiresTo);

    const response = await api.get(`${base}?${params.toString()}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch users",
    };
  }
};

// ── POST create a new device ──────────────────────────────────────────────────
/**
 * @param {string} role    - "RESELLER" | "SUB_RESELLER"
 * @param {object} payload - { deviceId, deviceModel, osVersion, platform }
 *
 * NOTE: the old split files were inconsistent here — createUser(deviceId)
 * for RESELLER only ever sent { deviceId }, dropping deviceModel/osVersion/
 * platform, while createSubResellerUser sent the full payload. This unified
 * version always sends the full payload for both roles.
 */
export const createDevice = async (role, payload) => {
  try {
    const url = role === "SUB_RESELLER"
      ? "/api/sub-reseller/user"
      : "/api/reseller/user";
    const response = await api.post(url, payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create device",
    };
  }
};

// ── PUT toggle/disable a device ───────────────────────────────────────────────
/**
 * @param {string} role     - "RESELLER" | "SUB_RESELLER"
 * @param {string} deviceId
 */
export const disableDevice = async (role, deviceId) => {
  try {
    const base = role === "SUB_RESELLER"
      ? "/api/sub-reseller/users"
      : "/api/reseller/users";
    const response = await api.put(`${base}/${deviceId}/disable`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update device status",
    };
  }
};

// ── GET subscription plans ────────────────────────────────────────────────────
/**
 * Uses the public plans endpoint. Role is accepted for forward-compatibility
 * in case plan visibility ever differs per role; both currently share it.
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

// ── POST activate a plan on a device ──────────────────────────────────────────
/**
 * Instantly deducts credits and activates the device — no pending/approval
 * step. Moved here from activationRequest.js since RequestManagement no
 * longer exists as a separate page; this is now triggered directly from
 * the "Activate Plan" action on each device row/card.
 *
 * @param {string} role    - "RESELLER" | "SUB_RESELLER"
 * @param {object} payload - { deviceId, planName, amount, currency }
 */
export const activateDevicePlan = async (role, payload) => {
  try {
    const url = role === "SUB_RESELLER"
      ? "/api/sub-reseller/activation-request"
      : "/api/reseller/activation-request";
    const response = await api.post(url, payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to activate plan",
    };
  }
};