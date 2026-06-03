import api from "../axiosInstance";

/**
 * Fetch paginated sub-reseller transaction history.
 * Supports all filter combinations as separate dedicated params.
 *
 * @param {number} pageNo     - 0-based page index
 * @param {number} size       - page size (default 20)
 * @param {string} search     - partial Transaction ID (e.g. "b7a14b", "00B80026")
 * @param {string} type       - PURCHASE | DEDUCTION | REFUND | TRANSFER_IN | TRANSFER_OUT | MANUAL_ADJUSTMENT
 * @param {string} fromDate   - YYYY-MM-DD
 * @param {string} toDate     - YYYY-MM-DD
 * @param {string} minAmount  - numeric string e.g. "1"
 * @param {string} maxAmount  - numeric string e.g. "100"
 */
export const subResellerTransactionHistory = async (
  pageNo    = 0,
  size      = 20,
  search    = "",
  type      = "",
  fromDate  = "",
  toDate    = "",
  minAmount = "",
  maxAmount = "",
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", pageNo);
    params.append("size", size);
    if (search.trim()) params.append("search",    search.trim());
    if (type)          params.append("type",       type);
    if (fromDate)      params.append("fromDate",   fromDate);
    if (toDate)        params.append("toDate",     toDate);
    if (minAmount)     params.append("minAmount",  minAmount);
    if (maxAmount)     params.append("maxAmount",  maxAmount);

    const response = await api.get(
      `/api/sub-reseller/credits/transactions?${params.toString()}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch transaction history",
    };
  }
};