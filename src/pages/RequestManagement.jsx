import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, X, Filter, ChevronDown,
  SlidersHorizontal, Calendar, Coins, Tag,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../auth/utilfunction";
import { useDashboard } from "../context/dashboardContext";
import { getActivationRequests, createActivationRequest, getPlans } from "../auth/api/activationRequest";
import { useTranslation } from "react-i18next";

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setD(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return d;
}

// ─── Status styles ────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  PENDING:  { pill: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  APPROVED: { pill: "bg-green-100  text-green-700",  dot: "bg-green-500"  },
  REJECTED: { pill: "bg-red-100    text-red-600",    dot: "bg-red-500"    },
};
const statusStyle = (s) =>
  STATUS_STYLE[s] || { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };

const FILTER_TABS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

// ─── CopyButton — MODULE LEVEL so it never remounts on parent re-render ──────
// If defined inside the component, every setCopiedId call creates a new
// component type → React unmounts+remounts → visible flicker on every copy.
const CopyButton = ({ text, id, field, copiedId, copiedField, onCopy, copyLabel, copiedLabel }) => {
  const isThis = copiedId === id && copiedField === field;
  return (
    <div className="relative inline-flex shrink-0">
      <button
        onClick={() => onCopy(text, id, field)}
        className="text-[10px] border border-gray-300 px-2 py-0.5 rounded hover:bg-red-50 hover:border-[#800000] hover:text-[#800000] transition text-gray-500 whitespace-nowrap"
      >
        {isThis ? copiedLabel : copyLabel}
      </button>
      {isThis && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
          {copiedLabel}
        </span>
      )}
    </div>
  );
};


const FilterSection = ({ icon: Icon, label, children }) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-[#800000]" />
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
    {children}
  </div>
);

// ─── FilterPanelContent — MODULE LEVEL (never remounts → inputs keep focus) ──
const FilterPanelContent = ({
  planFilter,  setPlanFilter,
  dateFrom,    setDateFrom,
  dateTo,      setDateTo,
  minCredits,  setMinCredits,
  maxCredits,  setMaxCredits,
  planOptions,          // string[] of plan names from API
  activeFilterCount,
  clearAll,
}) => (
  <div className="space-y-5">

    {/* ── PLAN — dynamic from /api/payment/public/plans ── */}
    <FilterSection icon={Tag} label="Plan">
      <div className="flex flex-wrap gap-2">
        {["", ...planOptions].map((plan) => {
          const isActive = planFilter === plan;
          return (
            <button
              key={plan || "all-plan"}
              onClick={() => setPlanFilter(plan)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition active:scale-95
                ${isActive
                  ? "bg-[#800000] text-white border-[#800000]"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#800000] hover:text-[#800000]"
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-white" : plan ? "bg-[#800000]/50" : "bg-gray-300"}`} />
              {plan || "All Plans"}
            </button>
          );
        })}
      </div>
    </FilterSection>

    {/* ── DATE RANGE ── */}
    <FilterSection icon={Calendar} label="Date Range">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "From", value: dateFrom, set: setDateFrom, min: undefined },
          { label: "To",   value: dateTo,   set: setDateTo,   min: dateFrom || undefined },
        ].map(({ label, value, set, min }) => (
          <div key={label} className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">{label}</label>
            <input
              type="date"
              value={value}
              min={min}
              onChange={(e) => set(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="w-full px-3 py-2.5 text-xs bg-[#f4f4f7] border border-gray-200 rounded-xl
                         focus:border-[#800000] focus:outline-none transition text-gray-700 font-semibold cursor-pointer"
            />
          </div>
        ))}
      </div>
      {(dateFrom || dateTo) && (
        <button onClick={() => { setDateFrom(""); setDateTo(""); }}
          className="text-[10px] text-gray-400 hover:text-[#800000] font-semibold flex items-center gap-1 mt-1 transition">
          <X size={10} /> Clear dates
        </button>
      )}
    </FilterSection>

    {/* ── CREDITS RANGE ── */}
    <FilterSection icon={Coins} label="Credits Range">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Min", value: minCredits, set: setMinCredits, ph: "0",  min: "0" },
          { label: "Max", value: maxCredits, set: setMaxCredits, ph: "∞",  min: minCredits || "0" },
        ].map(({ label, value, set, ph, min }) => (
          <div key={label} className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">{label}</label>
            <input
              type="number"
              placeholder={ph}
              value={value}
              min={min}
              step="1"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onChange={(e) => set(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#f4f4f7] border border-gray-200 rounded-xl
                         focus:border-[#800000] focus:outline-none transition text-gray-700 font-semibold
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                         [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        ))}
      </div>
      {(minCredits || maxCredits) && (
        <button onClick={() => { setMinCredits(""); setMaxCredits(""); }}
          className="text-[10px] text-gray-400 hover:text-[#800000] font-semibold flex items-center gap-1 mt-1 transition">
          <X size={10} /> Clear credits
        </button>
      )}
    </FilterSection>

    {activeFilterCount > 0 && (
      <div className="pt-3 border-t border-gray-100">
        <button onClick={clearAll}
          className="w-full py-2 text-xs font-bold text-[#800000] hover:bg-red-50 rounded-xl transition">
          Clear all filters
        </button>
      </div>
    )}
  </div>
);

// ─── StatusBadge — module level ───────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const ts = statusStyle(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${ts.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ts.dot}`} />
      {status}
    </span>
  );
};

// ─── SkeletonRow — module level ───────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-t animate-pulse">
    {[13, 14, 13, 9, 7, 13, 10, 13].map((w, i) => (
      <td key={i} className="px-2 py-3.5">
        <div className="h-3 bg-gray-200 rounded mx-auto" style={{ width: `${w * 5}%` }} />
      </td>
    ))}
  </tr>
);

// ─── SkeletonCard — module level ──────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow border border-gray-200 p-4 animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-6 bg-gray-200 rounded-full w-20" />
    </div>
    <div className="h-3 bg-gray-200 rounded w-1/2" />
    <div className="pt-2 border-t border-gray-100 space-y-1.5">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

// ─── RequestCard — module level ───────────────────────────────────────────────
// All copy state + handlers passed as props — no closure over parent state.
// This is the critical fix: when copiedId resets after 1500ms the parent
// re-renders, but since RequestCard is a stable module-level reference React
// does NOT unmount it — it just receives new props. Zero flicker.
const RequestCard = ({
  req, copiedId, copiedField, onCopy,
  copyLabel, copiedLabel, truncateId: tid,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-3"
  >
    {/* Header: status badge */}
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
        Request
      </span>
      <StatusBadge status={req.status} />
    </div>

    {/* ID rows — 3-col grid: label | value | copy button
        grid-cols-[5rem_1fr_auto] guarantees copy buttons always sit
        in the same rightmost column regardless of value length.          */}
    <div className="grid grid-cols-[5rem_1fr_auto] items-center gap-x-2 gap-y-2.5">

      {/* MAC */}
      <span className="text-[11px] font-semibold text-gray-500 leading-none">MAC</span>
      <span className="font-mono text-[11px] font-bold text-gray-800 truncate leading-none"
        title={req.macAddress}>
        {req.macAddress || "—"}
      </span>
      <span className="justify-self-end">
        {req.macAddress
          ? <CopyButton text={req.macAddress} id={req.id} field="mac"
              copiedId={copiedId} copiedField={copiedField}
              onCopy={onCopy} copyLabel={copyLabel} copiedLabel={copiedLabel} />
          : <span className="w-[38px] inline-block" />}
      </span>

      {/* Device ID */}
      <span className="text-[11px] font-semibold text-gray-500 leading-none">Device ID</span>
      <span className="text-[11px] font-semibold text-[#800000] truncate leading-none"
        title={req.deviceId}>
        {tid(req.deviceId, 10, 6)}
      </span>
      <span className="justify-self-end">
        <CopyButton text={req.deviceId} id={req.id} field="device"
          copiedId={copiedId} copiedField={copiedField}
          onCopy={onCopy} copyLabel={copyLabel} copiedLabel={copiedLabel} />
      </span>

      {/* Reseller ID */}
      <span className="text-[11px] font-semibold text-gray-500 leading-none">Reseller ID</span>
      <span className="text-[11px] font-semibold text-blue-600 truncate leading-none"
        title={req.resellerId}>
        {tid(req.resellerId, 8, 5)}
      </span>
      <span className="justify-self-end">
        <CopyButton text={req.resellerId} id={req.id} field="reseller"
          copiedId={copiedId} copiedField={copiedField}
          onCopy={onCopy} copyLabel={copyLabel} copiedLabel={copiedLabel} />
      </span>
    </div>

    {/* Details */}
    <div className="text-xs text-gray-500 space-y-1.5 pt-2.5 border-t border-gray-100">
      <div className="flex justify-between gap-2">
        <span className="font-medium text-gray-600 shrink-0">Plan:</span>
        <span className="font-semibold text-gray-700 text-right">{req.planName || "—"}</span>
      </div>
      <div className="flex justify-between gap-2">
        <span className="font-medium text-gray-600 shrink-0">Credits:</span>
        <span className="font-black text-[#800000]">{req.creditsUsed ?? "—"}</span>
      </div>
      <div className="flex justify-between gap-2">
        <span className="font-medium text-gray-600 shrink-0">Created:</span>
        <span className="text-right">{req.createdAt}</span>
      </div>
      {req.adminNotes && (
        <div className="pt-1.5 border-t border-gray-100 space-y-0.5">
          <span className="font-medium text-gray-600 block">Admin Notes:</span>
          <span className="text-gray-500 line-clamp-2 leading-relaxed">{req.adminNotes}</span>
        </div>
      )}
    </div>
  </motion.div>
);

// ─── EmptyState — module level ────────────────────────────────────────────────
const EmptyState = ({ hasFilters, noDataLabel, onClear }) => (
  <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
    <Search size={28} className="opacity-40" />
    <p className="font-semibold text-sm text-center">
      {hasFilters ? "No requests match your filters" : noDataLabel}
    </p>
    {hasFilters && (
      <button onClick={onClear} className="text-xs text-[#800000] font-bold hover:underline">
        Clear filters
      </button>
    )}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
function RequestManagement() {
  const { userRole }         = useAuth();
  const { t }                = useTranslation();
  const { refetchDashboard } = useDashboard();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [requests,    setRequests]    = useState([]);
  const [planOptions, setPlanOptions] = useState([]);   // plan names from API
  const [totalPages,  setTotalPages]  = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingData, setLoadingData] = useState(true);

  // ── Status tab ────────────────────────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState("ALL");

  // ── Search (debounced) — ?search= ────────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const debouncedSearch               = useDebounce(search, 450);

  // ── Filter panel ──────────────────────────────────────────────────────────
  const [showFilter,  setShowFilter]  = useState(false);
  const [planFilter,  setPlanFilter]  = useState("");   // ?planName=
  const [dateFrom,    setDateFrom]    = useState("");   // ?fromDate=
  const [dateTo,      setDateTo]      = useState("");   // ?toDate=
  const [minCredits,  setMinCredits]  = useState("");   // ?minCredits=
  const [maxCredits,  setMaxCredits]  = useState("");   // ?maxCredits=
  const debouncedMin  = useDebounce(minCredits, 500);
  const debouncedMax  = useDebounce(maxCredits, 500);

  // ── Modal ─────────────────────────────────────────────────────────────────
  const [showModal,   setShowModal]   = useState(false);
  const [apiError,    setApiError]    = useState("");
  const [newRequest,  setNewRequest]  = useState({ deviceId: "", planName: "" });

  // ── Copy ──────────────────────────────────────────────────────────────────
  const [copiedId,    setCopiedId]    = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const desktopFilterRef = useRef(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const h = (e) => {
      if (desktopFilterRef.current && !desktopFilterRef.current.contains(e.target))
        setShowFilter(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Load plans using role-aware getPlans from activationRequest API ─────────
  useEffect(() => {
    getPlans(userRole)
      .then((res) => { if (res.success) setPlanOptions(res.data.map((p) => p.name)); })
      .catch(() => {});
  }, [userRole]);

  // ── Fetch requests ────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async (page = 1) => {
    setLoadingData(true);
    try {
      const status = activeTab === "ALL" ? "" : activeTab;
      const res = await getActivationRequests(
        userRole,
        page - 1, 20,
        debouncedSearch,
        status,
        planFilter,
        dateFrom, dateTo,
        debouncedMin, debouncedMax,
      );
      if (!res.success) return;
      setRequests((res.data?.content || []).map((item) => ({
        id:          item.id          ?? "",
        status:      item.status      ?? "",
        createdAt:   formatDate(item.createdAt),
        resellerId:  item.resellerId  ?? "",
        deviceId:    item.deviceId    ?? "",
        macAddress:  item.macAddress  ?? "",
        planName:    item.planName    ?? "",
        creditsUsed: item.creditsUsed ?? null,
        adminNotes:  item.adminNotes  ?? "",
      })));
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, [debouncedSearch, activeTab, planFilter, dateFrom, dateTo, debouncedMin, debouncedMax, userRole]);

  useEffect(() => { setCurrentPage(1); },
    [debouncedSearch, activeTab, planFilter, dateFrom, dateTo, debouncedMin, debouncedMax]);

  useEffect(() => { fetchRequests(currentPage); }, [currentPage, fetchRequests]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const copyToClipboard = (text, id, field) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id); setCopiedField(field);
    setTimeout(() => { setCopiedId(null); setCopiedField(null); }, 1500);
  };

  const clearFilters = () => {
    setPlanFilter(""); setDateFrom(""); setDateTo("");
    setMinCredits(""); setMaxCredits(""); setShowFilter(false);
  };

  const truncateId = (id, start = 7, end = 4) => {
    if (!id) return "—";
    if (id.length <= start + end) return id;
    return `${id.slice(0, start)}…${id.slice(-end)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setApiError("");
    const payload = { deviceId: newRequest.deviceId, planName: newRequest.planName, amount: 5, currency: "CREDITS" };
    const res = await createActivationRequest(userRole, payload);
    if (!res.success) { setApiError(res.message); return; }
    setShowModal(false); setNewRequest({ deviceId: "", planName: "" });
    await fetchRequests(currentPage); await refetchDashboard();
  };

  const activeFilterCount = [planFilter, dateFrom, dateTo, minCredits, maxCredits].filter(Boolean).length;
  const hasActiveFilters  = !!(debouncedSearch || activeFilterCount);
  const showPagination    = totalPages > 1;

  const filterProps = {
    planFilter, setPlanFilter,
    dateFrom,   setDateFrom,
    dateTo,     setDateTo,
    minCredits, setMinCredits,
    maxCredits, setMaxCredits,
    planOptions,
    activeFilterCount,
    clearAll: clearFilters,
  };

  // ── Sub-components ─────────────────────────────────────────────────────────
  // All sub-components are defined at MODULE LEVEL below the component.
  // This prevents React from treating them as new component types on every
  // render, which was causing cards to unmount+remount (visible flicker)
  // every time copiedId state changed (on copy click and on 1500ms reset).

  const inputCls = "w-full px-4 py-3 bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-sm font-semibold text-gray-800";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-[#f4f4f7] p-4 space-y-4">

      {/* ══ HEADER ══════════════════════════════════════════════════════════
          Mobile/tablet : title row + [search flex-1] [filter icon] [+ icon]
          Desktop (lg+) : title left | search (max-w-sm) + Filters + New Request right
          Search always has flex-1 so it fills space; filter + button are shrink-0.
          On small screens filter and new-request show icon-only to save space.
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        {/* Title */}
        <div className="shrink-0">
          <h2 className="text-lg font-bold text-[#800000]">
            {t("requests.request_management")}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {t("requests.manage_activation_requests") || "Search by MAC · Device ID · Reseller ID"}
          </p>
        </div>

        {/* Controls row — search + filter + button */}
        <div className="flex items-center gap-2 lg:gap-3">

          {/* Search — flex-1 so it fills; lg caps at max-w-sm like TransactionHistory */}
          <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm flex-1 min-w-0 lg:max-w-sm">
            <div className="relative flex-1 min-w-0">
              {loadingData && debouncedSearch ? (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#800000] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              )}
              <input
                type="text"
                placeholder={t("requests.search_placeholder") || "Search by MAC, Device ID or Reseller ID…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-2.5 text-sm text-gray-700 bg-white focus:outline-none placeholder-gray-400"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter button — icon-only on mobile/sm, "Filters" label on lg+ */}
          <div className="relative shrink-0" ref={desktopFilterRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilter((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2.5 lg:px-4 rounded-xl border text-sm font-semibold transition
                ${activeFilterCount > 0
                  ? "bg-[#800000] text-white border-[#800000] shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#800000] hover:text-[#800000] shadow-sm"
                }`}
            >
              <SlidersHorizontal size={15} />
              {/* Label hidden below md (mobile), shown on md+ */}
              <span className="hidden md:inline">{t("requests.filters") || "Filters"}</span>
              <AnimatePresence>
                {activeFilterCount > 0 && (
                  <motion.span key="fbadge" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="bg-white text-[#800000] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none shrink-0">
                    {activeFilterCount}
                  </motion.span>
                )}
              </AnimatePresence>
              <ChevronDown size={12} className={`hidden md:block transition-transform duration-200 ${showFilter ? "rotate-180" : ""}`} />
            </motion.button>

            {/* Desktop dropdown (lg+) — positioned above sidebar z-index */}
            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="hidden md:block absolute right-0 top-full mt-2 z-[60] bg-white border border-gray-200 rounded-2xl shadow-2xl w-80 p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Filter size={14} className="text-[#800000]" />
                      <span className="text-sm font-bold text-gray-800">Filter Requests</span>
                    </div>
                    <button onClick={() => setShowFilter(false)}
                      className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100">
                      <X size={14} />
                    </button>
                  </div>
                  <FilterPanelContent {...filterProps} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* New Request — icon-only on mobile/sm, full label on lg+ */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-[#800000] text-white px-3 py-2.5 lg:px-5 rounded-xl text-sm font-semibold hover:bg-[#6a0000] transition active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Plus size={15} />
            <span className="hidden md:inline">{t("requests.new_request")}</span>
          </button>
        </div>
      </div>

      {/* ══ STATUS TABS ══════════════════════════════════════════════════════ */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === tab
                ? "bg-[#800000] text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#800000] hover:text-[#800000]"
            }`}
          >
            {t(`requests.${tab.toLowerCase()}`) || tab}
          </button>
        ))}
      </div>

      {/* ══ MOBILE BOTTOM DRAWER (< md, <768px only) ═════════════════════════
          Tablet (768–1023px) uses the desktop dropdown below the filter button.
          This prevents the drawer from fighting with the sidebar at 768–1023px.
      ════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showFilter && (
          <>
            <motion.div key="req-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilter(false)}
              className="md:hidden fixed inset-0 bg-black/40 z-[55]" />
            <motion.div
              key="req-drawer"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col"
            >
              <div className="pt-3 pb-1 flex justify-center shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <Filter size={15} className="text-[#800000]" />
                  <span className="text-base font-bold text-gray-800">Filter Requests</span>
                </div>
                <button onClick={() => setShowFilter(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 px-5 py-5">
                <FilterPanelContent {...filterProps} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Active filter / search pills ── */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">
              {loadingData ? "Searching…" : `${requests.length} result${requests.length !== 1 ? "s" : ""}`}
            </span>
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full font-mono">
                <Search size={10} className="shrink-0 font-sans" />{debouncedSearch}
                <button onClick={() => setSearch("")}><X size={10} /></button>
              </span>
            )}
            {planFilter && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <Tag size={10} />{planFilter}
                <button onClick={() => setPlanFilter("")}><X size={10} /></button>
              </span>
            )}
            {(dateFrom || dateTo) && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <Calendar size={10} />
                {dateFrom && dateTo ? `${dateFrom} → ${dateTo}` : dateFrom ? `From ${dateFrom}` : `To ${dateTo}`}
                <button onClick={() => { setDateFrom(""); setDateTo(""); }}><X size={10} /></button>
              </span>
            )}
            {(minCredits || maxCredits) && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <Coins size={10} />
                {minCredits && maxCredits ? `${minCredits}–${maxCredits} cr` : minCredits ? `Min ${minCredits}` : `Max ${maxCredits}`}
                <button onClick={() => { setMinCredits(""); setMaxCredits(""); }}><X size={10} /></button>
              </span>
            )}
            {(activeFilterCount + (debouncedSearch ? 1 : 0)) > 1 && (
              <button onClick={() => { setSearch(""); clearFilters(); }}
                className="text-xs text-gray-400 hover:text-[#800000] font-semibold transition">
                Clear all
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ DESKTOP TABLE (lg+, 1024px+) — 8 cols, table-fixed, no scroll ════
          MAC | Device ID | Reseller ID | Plan | Credits | Created | Status | Admin Notes
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-xs table-fixed">
          <colgroup>
            <col style={{ width: "15%" }} /> {/* MAC Address */}
            <col style={{ width: "14%" }} /> {/* Device ID   */}
            <col style={{ width: "13%" }} /> {/* Reseller ID */}
            <col style={{ width: "9%"  }} /> {/* Plan        */}
            <col style={{ width: "7%"  }} /> {/* Credits     */}
            <col style={{ width: "14%" }} /> {/* Created     */}
            <col style={{ width: "11%" }} /> {/* Status      */}
            <col style={{ width: "17%" }} /> {/* Admin Notes */}
          </colgroup>

          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              {[
                t("requests.mac_address")  || "MAC Address",
                t("requests.device_id")    || "Device ID",
                t("requests.reseller_id")  || "Reseller ID",
                t("requests.plan")         || "Plan",
                t("requests.credits")      || "Credits",
                t("requests.created")      || "Created",
                t("requests.status")       || "Status",
                t("requests.admin_notes")  || "Admin Notes",
              ].map((col) => (
                <th key={col} className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loadingData ? (
              [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            ) : requests.length > 0 ? (
              requests.map((req, idx) => (
                <tr key={req.id}
                  className={`text-center transition-colors duration-150 hover:bg-red-50/30 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}>

                  {/* MAC Address */}
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-center gap-1 min-w-0">
                      <span className="font-mono text-[11px] font-semibold text-gray-700 truncate min-w-0" title={req.macAddress}>
                        {req.macAddress || "—"}
                      </span>
                      {req.macAddress && (
                        <span className="shrink-0">
                          <CopyButton text={req.macAddress} id={req.id} field="mac"
                            copiedId={copiedId} copiedField={copiedField} onCopy={copyToClipboard}
                            copyLabel={t("requests.copy")||"Copy"} copiedLabel={t("requests.copied")||"Copied!"} />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Device ID */}
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-center gap-1 min-w-0">
                      <span className="text-[#800000] font-semibold text-[11px] truncate min-w-0" title={req.deviceId}>
                        {truncateId(req.deviceId)}
                      </span>
                      <span className="shrink-0">
                        <CopyButton text={req.deviceId} id={req.id} field="device"
                          copiedId={copiedId} copiedField={copiedField} onCopy={copyToClipboard}
                          copyLabel={t("requests.copy")||"Copy"} copiedLabel={t("requests.copied")||"Copied!"} />
                      </span>
                    </div>
                  </td>

                  {/* Reseller ID */}
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-center gap-1 min-w-0">
                      <span className="text-blue-600 font-semibold text-[11px] truncate min-w-0" title={req.resellerId}>
                        {truncateId(req.resellerId)}
                      </span>
                      <span className="shrink-0">
                        <CopyButton text={req.resellerId} id={req.id} field="reseller"
                          copiedId={copiedId} copiedField={copiedField} onCopy={copyToClipboard}
                          copyLabel={t("requests.copy")||"Copy"} copiedLabel={t("requests.copied")||"Copied!"} />
                      </span>
                    </div>
                  </td>

                  <td className="px-2 py-3 font-semibold text-gray-700 text-[11px]">{req.planName || "—"}</td>
                  <td className="px-2 py-3 font-black text-[#800000]">{req.creditsUsed ?? "—"}</td>
                  <td className="px-2 py-3 text-gray-500 text-[11px]">{req.createdAt}</td>

                  {/* Status */}
                  <td className="px-2 py-3">
                    <div className="flex justify-center">
                      <StatusBadge status={req.status} />
                    </div>
                  </td>

                  {/* Admin Notes — own column */}
                  <td className="px-2 py-3 text-left">
                    <span className="block text-[11px] text-gray-500 font-medium truncate w-full" title={req.adminNotes}>
                      {req.adminNotes || <span className="text-gray-300 italic">—</span>}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-12">
                  <EmptyState hasFilters={hasActiveFilters} noDataLabel={t("requests.no_data_found")} onClear={() => { setSearch(""); clearFilters(); }} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ══ TABLET CARDS (md – lg, 768–1023px) ══════════════════════════════ */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-3">
        {loadingData ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : requests.length > 0 ? (
          requests.map((req) => (
            <RequestCard key={req.id} req={req}
              copiedId={copiedId} copiedField={copiedField}
              onCopy={copyToClipboard} truncateId={truncateId}
              copyLabel={t("requests.copy")||"Copy"}
              copiedLabel={t("requests.copied")||"Copied!"} />
          ))
        ) : (
          <div className="col-span-2">
            <EmptyState hasFilters={hasActiveFilters} noDataLabel={t("requests.no_data_found")} onClear={() => { setSearch(""); clearFilters(); }} />
          </div>
        )}
      </div>

      {/* ══ MOBILE CARDS (< md, <768px) — single column ═════════════════════ */}
      <div className="md:hidden space-y-3">
        {loadingData ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : requests.length > 0 ? (
          requests.map((req) => (
            <RequestCard key={req.id} req={req}
              copiedId={copiedId} copiedField={copiedField}
              onCopy={copyToClipboard} truncateId={truncateId}
              copyLabel={t("requests.copy")||"Copy"}
              copiedLabel={t("requests.copied")||"Copied!"} />
          ))
        ) : (
          <EmptyState hasFilters={hasActiveFilters} noDataLabel={t("requests.no_data_found")} onClear={() => { setSearch(""); clearFilters(); }} />
        )}
      </div>

      {/* ══ PAGINATION ═══════════════════════════════════════════════════════ */}
      {showPagination && (
        <div className="flex justify-center items-center gap-3 p-3 flex-wrap">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
            {t("requests.prev")}
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {t("requests.page")} {currentPage} {t("requests.of")} {totalPages}
          </span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
            {t("requests.next")}
          </button>
        </div>
      )}

      {/* ══ NEW REQUEST MODAL ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 md:pl-[240px] lg:pl-[260px]">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-[#800000] px-6 py-4 flex items-center justify-between">
                <h5 className="text-white font-bold text-base">{t("requests.submit_request")}</h5>
                <button onClick={() => { setShowModal(false); setApiError(""); }}
                  className="text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-3">
                {apiError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">{apiError}</div>
                )}
                <input type="text" placeholder={t("requests.device_id")}
                  value={newRequest.deviceId}
                  onChange={(e) => setNewRequest({ ...newRequest, deviceId: e.target.value })}
                  className={inputCls} />
                <div className="relative">
                  <select value={newRequest.planName}
                    onChange={(e) => setNewRequest({ ...newRequest, planName: e.target.value })}
                    className={`${inputCls} appearance-none pr-10 cursor-pointer`}>
                    <option value="">{t("requests.select_plan")}</option>
                    {planOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#800000]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit"
                    className="flex-1 py-3 bg-[#800000] text-white font-bold rounded-xl hover:bg-[#6a0000] transition active:scale-95 text-sm">
                    {t("requests.submit")}
                  </button>
                  <button type="button" onClick={() => { setShowModal(false); setApiError(""); }}
                    className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition active:scale-95 text-sm">
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