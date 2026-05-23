import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../auth/utilfunction";
import { useDashboard } from "../context/dashboardContext";
import {
  getActivationRequests,
  createActivationRequest,
  getPlans,
} from "../auth/api/activationRequest";
import { useTranslation } from "react-i18next";

function RequestManagement() {
  const { userRole } = useAuth();
  const { t } = useTranslation();
  const { refetchDashboard } = useDashboard();

  const [requests, setRequests] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [apiError, setApiError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [newRequest, setNewRequest] = useState({ deviceId: "", planName: "" });

  // ── Stable fetch — maps data once, never re-sorts on refetch ──
  const fetchRequests = async (page = currentPage, currentFilter = filter) => {
    const backendPage = page - 1;
    const status = currentFilter === "ALL" ? "" : currentFilter;
    const res = await getActivationRequests(userRole, status, backendPage);
    if (!res.success) return;

    const data = res.data?.content || [];

    // Preserve row order by only updating changed fields in-place
    setRequests((prev) => {
      const incoming = data.map((item) => ({
        id: item.id,
        status: item.status,
        createdAt: formatDate(item.createdAt),
        resellerId: item.resellerId,
        deviceId: item.deviceId,
        planName: item.planName,
        creditsUsed: item.creditsUsed,
      }));

      if (prev.length === 0) return incoming;

      // Merge in-place so existing rows don't jump
      const freshMap = {};
      incoming.forEach((r) => { freshMap[r.id] = r; });
      const merged = prev.map((r) => freshMap[r.id] ? { ...r, ...freshMap[r.id] } : r);
      const existingIds = new Set(prev.map((r) => r.id));
      incoming.forEach((r) => { if (!existingIds.has(r.id)) merged.push(r); });
      return merged;
    });

    setTotalPages(res.data.totalPages || 1);
  };

  const fetchPlans = async () => {
    const res = await getPlans();
    if (!res.success) return;
    setTiers(res.data.map((p) => p.name));
  };

  // On mount
  useEffect(() => {
    fetchRequests(1, filter);
    fetchPlans();
  }, [userRole]);

  // Page or filter change — full replace (different dataset)
  useEffect(() => {
    setRequests([]);
    fetchRequests(currentPage, filter);
  }, [currentPage, filter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const copyToClipboard = (text, id, field) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopiedField(field);
    setTimeout(() => { setCopiedId(null); setCopiedField(null); }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const payload = {
      deviceId: newRequest.deviceId,
      planName: newRequest.planName,
      amount: 5,
      currency: "CREDITS",
    };
    const res = await createActivationRequest(userRole, payload);
    if (!res.success) {
      setApiError(res.message);
      return;
    }
    setShowModal(false);
    setNewRequest({ deviceId: "", planName: "" });
    setRequests([]);
    await fetchRequests(currentPage, filter);
    await refetchDashboard();
  };

  const truncateId = (id, len = 8) => {
    if (!id) return "";
    return id.length <= len ? id : `${id.slice(0, len)}...`;
  };

  const statusBadge = (status) => {
    const map = {
      PENDING:  "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-600",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  // ── Reusable copy button — same pattern across all components ──
  const CopyButton = ({ text, id, field }) => {
    const isThis = copiedId === id && copiedField === field;
    return (
      <div className="relative inline-flex">
        <button
          onClick={() => copyToClipboard(text, id, field)}
          className="text-[10px] border border-gray-300 px-2 py-0.5 rounded hover:bg-red-50 hover:border-[#800000] hover:text-[#800000] transition text-gray-500"
        >
          {isThis ? t("requests.copied") : t("requests.copy")}
        </button>
        {isThis && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
            {t("requests.copied")}
          </span>
        )}
      </div>
    );
  };

  const inputCls = "w-full px-4 py-3 bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-sm font-semibold text-gray-800";

  const filterTabs = ["ALL", "PENDING", "APPROVED", "REJECTED"];

  return (
    <div className="min-h-screen w-full bg-[#f4f4f7] p-4 space-y-5">

      {/* ── HEADER: title left | button right ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="shrink-0">
          <h2 className="text-lg font-bold text-[#800000]">
            {t("requests.request_management")}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {t("requests.manage_activation_requests") || "Manage activation requests"}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[#800000] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0000] transition active:scale-95 shrink-0 whitespace-nowrap self-start lg:self-auto"
        >
          <Plus size={16} />
          {t("requests.new_request")}
        </button>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setFilter(tab); setCurrentPage(1); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === tab
                ? "bg-[#800000] text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#800000] hover:text-[#800000]"
            }`}
          >
            {t(`requests.${tab.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          DESKTOP + TABLET TABLE  (md+)
          table-fixed + colgroup = zero horizontal scroll
          from 768px to 1920px
      ════════════════════════════════════════════ */}
      <div className="hidden md:block bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: "24%" }} /> {/* Device ID */}
            <col style={{ width: "24%" }} /> {/* Reseller ID */}
            <col style={{ width: "14%" }} /> {/* Plan */}
            <col style={{ width: "10%" }} /> {/* Credits */}
            <col style={{ width: "16%" }} /> {/* Created */}
            <col style={{ width: "12%" }} /> {/* Status */}
          </colgroup>

          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              {[
                t("requests.device_id"),
                t("requests.reseller_id"),
                t("requests.plan"),
                t("requests.credits"),
                t("requests.created"),
                t("requests.status"),
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {requests.length > 0 ? (
              requests.map((req, idx) => (
                <tr
                  key={req.id}
                  className={`text-center transition-colors duration-150 hover:bg-red-50/30 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                  }`}
                >
                  {/* Device ID */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span
                        className="text-[#800000] font-semibold text-xs cursor-default"
                        title={req.deviceId}
                      >
                        {truncateId(req.deviceId)}
                      </span>
                      <CopyButton text={req.deviceId} id={req.id} field="device" />
                    </div>
                  </td>

                  {/* Reseller ID */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span
                        className="text-blue-600 font-semibold text-xs cursor-default"
                        title={req.resellerId}
                      >
                        {truncateId(req.resellerId)}
                      </span>
                      <CopyButton text={req.resellerId} id={req.id} field="reseller" />
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-xs text-gray-700 font-semibold">
                    {req.planName}
                  </td>

                  <td className="px-4 py-3.5 text-xs font-black text-[#800000]">
                    {req.creditsUsed ?? "-"}
                  </td>

                  <td className="px-4 py-3.5 text-xs text-gray-500">
                    {req.createdAt}
                  </td>

                  <td className="px-4 py-3.5">
                    {statusBadge(req.status)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Search size={28} className="opacity-40" />
                    <p className="font-semibold text-sm">
                      {t("requests.no_data_found")}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ════════════════════════════════════════════
          MOBILE CARDS  (< md)
      ════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-3"
            >
              {/* Top: device ID + status */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-sm font-semibold text-[#800000]"
                    title={req.deviceId}
                  >
                    {truncateId(req.deviceId, 6)}
                  </span>
                  <CopyButton text={req.deviceId} id={req.id} field="device" />
                </div>
                {statusBadge(req.status)}
              </div>

              {/* Reseller ID row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-500">
                  {t("requests.reseller")}:
                </span>
                <span
                  className="text-xs text-blue-600 font-semibold"
                  title={req.resellerId}
                >
                  {truncateId(req.resellerId, 6)}
                </span>
                <CopyButton text={req.resellerId} id={req.id} field="reseller" />
              </div>

              {/* Details */}
              <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-100">
                <p>
                  <span className="font-medium text-gray-600">{t("requests.plan")}:</span>{" "}
                  {req.planName}
                </p>
                <p>
                  <span className="font-medium text-gray-600">{t("requests.credits")}:</span>{" "}
                  <span className="font-black text-[#800000]">{req.creditsUsed ?? "-"}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-600">{t("requests.created")}:</span>{" "}
                  {req.createdAt}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
            <Search size={28} className="opacity-40" />
            <p className="font-semibold text-sm">{t("requests.no_requests")}</p>
          </div>
        )}
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 p-3 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t("requests.prev")}
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {t("requests.page")} {currentPage} {t("requests.of")} {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t("requests.next")}
          </button>
        </div>
      )}

      {/* ── NEW REQUEST MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Modal header */}
              <div className="bg-[#800000] px-6 py-4 flex items-center justify-between">
                <h5 className="text-white font-bold text-base">
                  {t("requests.submit_request")}
                </h5>
                <button
                  onClick={() => { setShowModal(false); setApiError(""); }}
                  className="text-white hover:bg-white/20 p-1.5 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-3">
                {apiError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
                    {apiError}
                  </div>
                )}

                <input
                  type="text"
                  placeholder={t("requests.device_id")}
                  value={newRequest.deviceId}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, deviceId: e.target.value })
                  }
                  className={inputCls}
                />

                {/* Custom select with maroon chevron */}
                <div className="relative">
                  <select
                    value={newRequest.planName}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, planName: e.target.value })
                    }
                    className={`${inputCls} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="">{t("requests.select_plan")}</option>
                    {tiers.map((tier, i) => (
                      <option key={i} value={tier}>{tier}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#800000]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 3.5L5 6.5L8 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#800000] text-white font-bold rounded-xl hover:bg-[#6a0000] transition active:scale-95 text-sm"
                  >
                    {t("requests.submit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setApiError(""); }}
                    className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition active:scale-95 text-sm"
                  >
                    {t("requests.cancel")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default RequestManagement;