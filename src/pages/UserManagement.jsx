import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Power, X, Search, Filter, ChevronDown,
  SlidersHorizontal, Calendar, Tag, ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { subscibedUserinfo, DisableUserAccount, createUser } from "../auth/userManagement";
import { formatDate } from "../auth/utilfunction";
import { useAuth } from "../context/AuthContext";
import { createSubResellerUser, subResellerUserInfo, disableSubResellerUser } from "../auth/subReseller/userManagement";
import { fetchPublicPlans } from "../auth/apiservice"; // dynamic plan list
import { useTranslation } from "react-i18next";

// ─── Debounce ─────────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setD(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return d;
}

// ─── Device status styles ─────────────────────────────────────────────────────
const DEV_STATUS_STYLE = {
  ACTIVE:   { pill: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  INACTIVE: { pill: "bg-red-100   text-red-600",    dot: "bg-red-500"    },
};
const devStatusStyle = (s) =>
  DEV_STATUS_STYLE[s] || { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };

// ─── FilterSection header ─────────────────────────────────────────────────────
const FilterSection = ({ icon: Icon, label, children }) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-[#800000]" />
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
    {children}
  </div>
);

// ─── CopyButton — MODULE LEVEL (no flicker on state change) ──────────────────
const CopyButton = ({ value, copiedId, onCopy, copyLabel, copiedLabel }) => {
  const isThis = copiedId === value;
  return (
    <div className="relative inline-flex shrink-0">
      <button
        onClick={() => onCopy(value)}
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

// ─── StatusBadge — MODULE LEVEL ───────────────────────────────────────────────
const DevStatusBadge = ({ status }) => {
  const ts = devStatusStyle(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${ts.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ts.dot}`} />
      {status}
    </span>
  );
};

// ─── SkeletonRow — MODULE LEVEL ───────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-t animate-pulse">
    {[17, 20, 11, 12, 16, 13, 11].map((w, i) => (
      <td key={i} className="px-3 py-3.5">
        <div className="h-3 bg-gray-200 rounded mx-auto" style={{ width: `${w * 4}%` }} />
      </td>
    ))}
  </tr>
);

// ─── SkeletonCard — MODULE LEVEL ──────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow border border-gray-200 p-4 animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-2/5" />
      <div className="h-6 bg-gray-200 rounded-full w-16" />
    </div>
    <div className="h-3 bg-gray-200 rounded w-1/3" />
    <div className="pt-2 border-t border-gray-100 space-y-1.5">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

// ─── DeviceCard — MODULE LEVEL (prevents remount on copiedId change) ──────────
const DeviceCard = ({
  item, copiedId, onCopy, onToggle,
  copyLabel, copiedLabel, truncateId,
  planLabel, expiresLabel, registeredLabel, toggleLabel,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-3"
  >
    {/* Header: status badge */}
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Device</span>
      <DevStatusBadge status={item.deviceStatus} />
    </div>

    {/* ID rows — 3-col grid: label | value | copy — copy always in same column */}
    <div className="grid grid-cols-[5rem_1fr_auto] items-center gap-x-2 gap-y-2.5">
      {/* MAC */}
      <span className="text-[11px] font-semibold text-gray-500 leading-none">MAC</span>
      <span className="font-mono text-[11px] font-bold text-gray-800 truncate leading-none" title={item.macAddress}>
        {item.macAddress || "—"}
      </span>
      <span className="justify-self-end">
        {item.macAddress
          ? <CopyButton value={item.macAddress} copiedId={copiedId} onCopy={onCopy} copyLabel={copyLabel} copiedLabel={copiedLabel} />
          : <span className="w-[38px] inline-block" />}
      </span>

      {/* Device ID */}
      <span className="text-[11px] font-semibold text-gray-500 leading-none">Device ID</span>
      <span className="text-[11px] font-semibold text-[#800000] truncate leading-none" title={item.deviceId}>
        {truncateId(item.deviceId, 10, 6)}
      </span>
      <span className="justify-self-end">
        <CopyButton value={item.deviceId} copiedId={copiedId} onCopy={onCopy} copyLabel={copyLabel} copiedLabel={copiedLabel} />
      </span>
    </div>

    {/* Details */}
    <div className="text-xs text-gray-500 space-y-1.5 pt-2.5 border-t border-gray-100">
      <div className="flex justify-between gap-2">
        <span className="font-medium text-gray-600 shrink-0">{planLabel}:</span>
        <span className="font-semibold text-gray-700 text-right">{item.subscriptionType || "—"}</span>
      </div>
      <div className="flex justify-between gap-2">
        <span className="font-medium text-gray-600 shrink-0">{registeredLabel}:</span>
        <span className="text-right">{formatDate(item.registeredAt)}</span>
      </div>
      <div className="flex justify-between gap-2">
        <span className="font-medium text-gray-600 shrink-0">{expiresLabel}:</span>
        <span className="text-right">{formatDate(item.expiresAt)}</span>
      </div>
    </div>

    {/* Toggle button */}
    <button
      onClick={() => onToggle(item)}
      className={`w-full py-2.5 rounded-xl text-sm font-bold transition active:scale-95 ${
        item.deviceStatus === "INACTIVE"
          ? "border border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white"
          : "bg-[#800000] text-white hover:bg-[#6a0000]"
      }`}
    >
      {toggleLabel}
    </button>
  </motion.div>
);

// ─── EmptyState — MODULE LEVEL ────────────────────────────────────────────────
const EmptyState = ({ hasFilters, noDataLabel, onClear }) => (
  <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
    <Search size={28} className="opacity-40" />
    <p className="font-semibold text-sm text-center">
      {hasFilters ? "No results match your filters" : noDataLabel}
    </p>
    {hasFilters && (
      <button onClick={onClear} className="text-xs text-[#800000] font-bold hover:underline">
        Clear filters
      </button>
    )}
  </div>
);

// ─── FilterPanelContent — MODULE LEVEL (inputs keep focus, no remount) ────────
const FilterPanelContent = ({
  statusFilter,   setStatusFilter,
  subFilter,      setSubFilter,
  registeredFrom, setRegisteredFrom,
  registeredTo,   setRegisteredTo,
  expiresFrom,    setExpiresFrom,
  expiresTo,      setExpiresTo,
  planOptions,
  activeFilterCount,
  clearAll,
}) => {
  const STATUS_OPTS = ["", "ACTIVE", "INACTIVE"];
  return (
    <div className="space-y-5">

      {/* STATUS */}
      <FilterSection icon={ShieldCheck} label="Status">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTS.map((s) => {
            const isActive = statusFilter === s;
            return (
              <button key={s || "all-s"} onClick={() => setStatusFilter(s)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition active:scale-95
                  ${isActive ? "bg-[#800000] text-white border-[#800000]" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#800000] hover:text-[#800000]"}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-white" : s === "ACTIVE" ? "bg-green-500" : s === "INACTIVE" ? "bg-red-500" : "bg-gray-300"}`} />
                {s || "All"}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* PLAN — dynamic from API */}
      {planOptions.length > 0 && (
        <FilterSection icon={Tag} label="Plan">
          <div className="flex flex-wrap gap-2">
            {["", ...planOptions].map((p) => {
              const isActive = subFilter === p;
              return (
                <button key={p || "all-p"} onClick={() => setSubFilter(p)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition active:scale-95
                    ${isActive ? "bg-[#800000] text-white border-[#800000]" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#800000] hover:text-[#800000]"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-white" : p ? "bg-[#800000]/40" : "bg-gray-300"}`} />
                  {p || "All Plans"}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* REGISTERED DATE RANGE */}
      <FilterSection icon={Calendar} label="Registered">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "From", value: registeredFrom, set: setRegisteredFrom, min: undefined },
            { label: "To",   value: registeredTo,   set: setRegisteredTo,   min: registeredFrom || undefined },
          ].map(({ label, value, set, min }) => (
            <div key={label} className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">{label}</label>
              <input type="date" value={value} min={min}
                onChange={(e) => set(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="w-full px-3 py-2.5 text-xs bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-gray-700 font-semibold cursor-pointer" />
            </div>
          ))}
        </div>
        {(registeredFrom || registeredTo) && (
          <button onClick={() => { setRegisteredFrom(""); setRegisteredTo(""); }}
            className="text-[10px] text-gray-400 hover:text-[#800000] font-semibold flex items-center gap-1 mt-1 transition">
            <X size={10} /> Clear registered dates
          </button>
        )}
      </FilterSection>

      {/* EXPIRES DATE RANGE */}
      <FilterSection icon={Calendar} label="Expires">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "From", value: expiresFrom, set: setExpiresFrom, min: undefined },
            { label: "To",   value: expiresTo,   set: setExpiresTo,   min: expiresFrom || undefined },
          ].map(({ label, value, set, min }) => (
            <div key={label} className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">{label}</label>
              <input type="date" value={value} min={min}
                onChange={(e) => set(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="w-full px-3 py-2.5 text-xs bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-gray-700 font-semibold cursor-pointer" />
            </div>
          ))}
        </div>
        {(expiresFrom || expiresTo) && (
          <button onClick={() => { setExpiresFrom(""); setExpiresTo(""); }}
            className="text-[10px] text-gray-400 hover:text-[#800000] font-semibold flex items-center gap-1 mt-1 transition">
            <X size={10} /> Clear expires dates
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
};

// ═════════════════════════════════════════════════════════════════════════════
function UserManagement() {
  const { t }        = useTranslation();
  const { userRole } = useAuth();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [devices,     setDevices]     = useState([]);
  const [planOptions, setPlanOptions] = useState([]); // dynamic from API
  const [totalUser,   setTotalUser]   = useState(0);
  const [activeUser,  setActiveUser]  = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingData, setLoadingData] = useState(true);

  // ── Search ────────────────────────────────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const debouncedSearch               = useDebounce(search, 450);

  // ── Filter panel ──────────────────────────────────────────────────────────
  const [showFilters,    setShowFilters]    = useState(false);
  const [statusFilter,   setStatusFilter]   = useState(""); // ?status=
  const [subFilter,      setSubFilter]      = useState(""); // ?subscription=
  const [registeredFrom, setRegisteredFrom] = useState(""); // ?registeredFrom=
  const [registeredTo,   setRegisteredTo]   = useState(""); // ?registeredTo=
  const [expiresFrom,    setExpiresFrom]    = useState(""); // ?expiresFrom=
  const [expiresTo,      setExpiresTo]      = useState(""); // ?expiresTo=

  // ── Modal / confirm ───────────────────────────────────────────────────────
  const [showModal,      setShowModal]      = useState(false);
  const [newUser,        setNewUser]        = useState({ deviceId: "" });
  const [error,          setError]          = useState("");
  const [loading,        setLoading]        = useState(false);
  const [confirmModal,   setConfirmModal]   = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // ── Copy ──────────────────────────────────────────────────────────────────
  const [copiedId, setCopiedId] = useState(null);

  const desktopFilterRef = useRef(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const h = (e) => {
      if (desktopFilterRef.current && !desktopFilterRef.current.contains(e.target))
        setShowFilters(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Load dynamic plan list
  useEffect(() => {
    fetchPublicPlans()
      .then((data) => setPlanOptions((data || []).map((p) => p.name)))
      .catch(() => {});
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchPage = useCallback(async (page = 1) => {
    setLoadingData(true);
    try {
      const backendPage = page - 1;
      const res = userRole === "SUB_RESELLER"
        ? await subResellerUserInfo(backendPage, 20, debouncedSearch, statusFilter, subFilter, registeredFrom, registeredTo, expiresFrom, expiresTo)
        : await subscibedUserinfo(backendPage, 20, debouncedSearch, statusFilter, subFilter, registeredFrom, registeredTo, expiresFrom, expiresTo);

      if (res.success) {
        const data = res.data?.content || [];
        const sorted = [...data].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
        setDevices(sorted);
        setTotalUser(res.data.totalElements ?? sorted.length);
        setTotalPages(res.data.totalPages ?? 1);
        setActiveUser(sorted.filter((u) => u.deviceStatus === "ACTIVE").length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, [debouncedSearch, statusFilter, subFilter, registeredFrom, registeredTo, expiresFrom, expiresTo, userRole]);

  useEffect(() => { setCurrentPage(1); },
    [debouncedSearch, statusFilter, subFilter, registeredFrom, registeredTo, expiresFrom, expiresTo]);

  useEffect(() => { fetchPage(currentPage); }, [currentPage, fetchPage]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const truncateId = (id, start = 8, end = 5) => {
    if (!id) return "—";
    if (id.length <= start + end) return id;
    return `${id.slice(0, start)}…${id.slice(-end)}`;
  };

  const clearFilters = () => {
    setStatusFilter(""); setSubFilter("");
    setRegisteredFrom(""); setRegisteredTo("");
    setExpiresFrom(""); setExpiresTo("");
    setShowFilters(false);
  };

  const handleToggle = (item) => { setSelectedDevice(item); setConfirmModal(true); };

  const handleDisable = async () => {
    if (!selectedDevice) return;
    const deviceId = selectedDevice.deviceId;
    const response = userRole === "SUB_RESELLER"
      ? await disableSubResellerUser(deviceId)
      : await DisableUserAccount(deviceId);

    if (response?.success) {
      const toggle = (list) => list.map((item) =>
        item.deviceId === deviceId
          ? { ...item, deviceStatus: item.deviceStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
          : item
      );
      setDevices((prev) => {
        const updated = toggle(prev);
        setActiveUser(updated.filter((u) => u.deviceStatus === "ACTIVE").length);
        return updated;
      });
    }
    setConfirmModal(false);
    setSelectedDevice(null);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const macRegex = /^([0-9A-Fa-f]{2}([:-]?)){5}[0-9A-Fa-f]{2}$|^([0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}$/;
    if (!macRegex.test(newUser.deviceId)) { toast.error(t("userManagement.invalid_mac")); return; }
    setLoading(true);
    const payload = { deviceId: newUser.deviceId, deviceModel: "Generic Smart Device", osVersion: "1.0.0", platform: "UNKNOWN" };
    const response = userRole === "SUB_RESELLER"
      ? await createSubResellerUser(payload)
      : await createUser(newUser.deviceId);
    if (response?.success) {
      setShowModal(false); setNewUser({ deviceId: "" }); setError("");
      fetchPage(currentPage);
    } else { setError(response?.message); }
    setLoading(false);
  };

  const activeFilterCount = [statusFilter, subFilter, registeredFrom, registeredTo, expiresFrom, expiresTo].filter(Boolean).length;
  const hasFilters        = !!(debouncedSearch || activeFilterCount);
  const showPagination    = totalPages > 1;

  const filterProps = {
    statusFilter,   setStatusFilter,
    subFilter,      setSubFilter,
    registeredFrom, setRegisteredFrom,
    registeredTo,   setRegisteredTo,
    expiresFrom,    setExpiresFrom,
    expiresTo,      setExpiresTo,
    planOptions,
    activeFilterCount,
    clearAll: clearFilters,
  };

  // Stable props for DeviceCard
  const cardProps = {
    copiedId, onCopy: copyToClipboard, onToggle: handleToggle,
    copyLabel: t("userManagement.copy") || "Copy",
    copiedLabel: t("userManagement.copied") || "Copied!",
    truncateId,
    planLabel:       t("userManagement.plan")       || "Plan",
    expiresLabel:    t("userManagement.expires")    || "Expires",
    registeredLabel: t("userManagement.registered") || "Registered",
    toggleLabel:     t("userManagement.toggle_status") || "Toggle Status",
  };

  const inputCls = "w-full px-4 py-3 bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-sm font-semibold text-gray-800";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-[#f4f4f7] p-4 space-y-5">

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="shrink-0">
          <h3 className="font-bold text-[#800000] text-lg">
            {t("userManagement.device_management")}
          </h3>
          <p className="text-gray-500 text-sm mt-0.5">
            {t("userManagement.manage_members") || "Search by MAC address or Device ID"}
          </p>
        </div>

        {/* Search + Filter + Create — all one row */}
        <div className="flex items-center gap-2 lg:gap-3">

          {/* Search */}
          <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm flex-1 min-w-0 lg:max-w-sm">
            <div className="relative flex-1 min-w-0">
              {loadingData && debouncedSearch ? (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#800000] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              )}
              <input
                type="text"
                placeholder={t("userManagement.search_device") || "Search by MAC or Device ID…"}
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

          {/* Filter button */}
          <div className="relative shrink-0" ref={desktopFilterRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2.5 md:px-4 rounded-xl border text-sm font-semibold transition
                ${activeFilterCount > 0
                  ? "bg-[#800000] text-white border-[#800000] shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#800000] hover:text-[#800000] shadow-sm"
                }`}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden md:inline">{t("userManagement.filters") || "Filters"}</span>
              <AnimatePresence>
                {activeFilterCount > 0 && (
                  <motion.span key="fb" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="bg-white text-[#800000] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none shrink-0">
                    {activeFilterCount}
                  </motion.span>
                )}
              </AnimatePresence>
              <ChevronDown size={12} className={`hidden md:block transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
            </motion.button>

            {/* Desktop dropdown (md+) — anchored to button, never covers sidebar */}
            <AnimatePresence>
              {showFilters && (
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
                      <span className="text-sm font-bold text-gray-800">Filter Devices</span>
                    </div>
                    <button onClick={() => setShowFilters(false)}
                      className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100">
                      <X size={14} />
                    </button>
                  </div>
                  <FilterPanelContent {...filterProps} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Create Device button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-[#800000] text-white px-3 py-2.5 md:px-5 rounded-xl text-sm font-semibold hover:bg-[#6a0000] transition active:scale-95 shrink-0 whitespace-nowrap"
          >
            <UserPlus size={15} />
            <span className="hidden md:inline">{t("userManagement.create_new_device")}</span>
          </button>
        </div>
      </div>

      {/* ══ MOBILE BOTTOM DRAWER (< md only) ════════════════════════════════ */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div key="um-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="md:hidden fixed inset-0 bg-black/40 z-[55]" />
            <motion.div
              key="um-drawer"
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
                  <span className="text-base font-bold text-gray-800">Filter Devices</span>
                </div>
                <button onClick={() => setShowFilters(false)}
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

      {/* ── Active filter + search pills ── */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">
              {loadingData ? "Searching…" : `${totalUser} result${totalUser !== 1 ? "s" : ""}`}
            </span>
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <Search size={10} className="shrink-0" />"{debouncedSearch}"
                <button onClick={() => setSearch("")}><X size={10} /></button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <ShieldCheck size={10} />{statusFilter}
                <button onClick={() => setStatusFilter("")}><X size={10} /></button>
              </span>
            )}
            {subFilter && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <Tag size={10} />{subFilter}
                <button onClick={() => setSubFilter("")}><X size={10} /></button>
              </span>
            )}
            {(registeredFrom || registeredTo) && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <Calendar size={10} />
                Reg: {registeredFrom && registeredTo ? `${registeredFrom} → ${registeredTo}` : registeredFrom ? `From ${registeredFrom}` : `To ${registeredTo}`}
                <button onClick={() => { setRegisteredFrom(""); setRegisteredTo(""); }}><X size={10} /></button>
              </span>
            )}
            {(expiresFrom || expiresTo) && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <Calendar size={10} />
                Exp: {expiresFrom && expiresTo ? `${expiresFrom} → ${expiresTo}` : expiresFrom ? `From ${expiresFrom}` : `To ${expiresTo}`}
                <button onClick={() => { setExpiresFrom(""); setExpiresTo(""); }}><X size={10} /></button>
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

      {/* ══ STAT TILES ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
            {t("userManagement.total_users")}
          </p>
          <p className="text-2xl font-black text-gray-800">{totalUser}</p>
          <div className="mt-2 h-1 w-10 rounded-full bg-[#800000]" />
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
            {t("userManagement.active")}
          </p>
          <p className="text-2xl font-black text-gray-800">{activeUser}</p>
          <div className="mt-2 h-1 w-10 rounded-full bg-green-600" />
        </div>
      </div>

      {/* ══ DESKTOP TABLE (lg+) ══════════════════════════════════════════════
          Columns: MAC | Device ID | Status | Plan | Registered | Expires | Action
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: "20%" }} /> {/* MAC        */}
            <col style={{ width: "18%" }} /> {/* Device ID  */}
            <col style={{ width: "10%" }} /> {/* Status     */}
            <col style={{ width: "10%" }} /> {/* Plan       */}
            <col style={{ width: "14%" }} /> {/* Registered */}
            <col style={{ width: "14%" }} /> {/* Expires    */}
            <col style={{ width: "14%" }} /> {/* Action     */}
          </colgroup>
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              {[
                t("userManagement.mac_address") || "MAC Address",
                t("userManagement.device_id"),
                t("userManagement.status"),
                t("userManagement.plan") || "Plan",
                t("userManagement.registered"),
                t("userManagement.expires"),
                t("userManagement.action"),
              ].map((col) => (
                <th key={col} className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loadingData ? (
              [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            ) : devices.length > 0 ? (
              devices.map((item, idx) => (
                <tr key={item.deviceId}
                  className={`text-center transition-colors duration-150 hover:bg-red-50/30 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}>

                  {/* MAC */}
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-mono text-xs font-semibold text-gray-700 tracking-wide whitespace-nowrap" title={item.macAddress}>
                        {item.macAddress || "—"}
                      </span>
                      {item.macAddress && (
                        <span className="shrink-0">
                          <CopyButton value={item.macAddress} copiedId={copiedId} onCopy={copyToClipboard}
                            copyLabel={t("userManagement.copy")||"Copy"} copiedLabel={t("userManagement.copied")||"Copied!"} />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Device ID */}
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-center gap-1.5 min-w-0">
                      <span className="text-[#800000] font-semibold text-xs truncate min-w-0" title={item.deviceId}>
                        {truncateId(item.deviceId)}
                      </span>
                      <span className="shrink-0">
                        <CopyButton value={item.deviceId} copiedId={copiedId} onCopy={copyToClipboard}
                          copyLabel={t("userManagement.copy")||"Copy"} copiedLabel={t("userManagement.copied")||"Copied!"} />
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3.5">
                    <DevStatusBadge status={item.deviceStatus} />
                  </td>

                  {/* Plan (subscriptionType) */}
                  <td className="px-3 py-3.5 text-gray-600 text-xs font-semibold">
                    {item.subscriptionType || "—"}
                  </td>

                  {/* Registered */}
                  <td className="px-3 py-3.5 text-gray-500 text-xs">
                    {formatDate(item.registeredAt)}
                  </td>

                  {/* Expires */}
                  <td className="px-3 py-3.5 text-gray-500 text-xs">
                    {formatDate(item.expiresAt)}
                  </td>

                  {/* Action */}
                  <td className="px-3 py-3.5">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleToggle(item)}
                        className={`p-2 rounded-lg border transition active:scale-95 ${
                          item.deviceStatus === "INACTIVE"
                            ? "border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white"
                            : "bg-[#800000] text-white border-[#800000] hover:bg-[#6a0000]"
                        }`}
                        title={item.deviceStatus === "ACTIVE" ? t("userManagement.disable") : t("userManagement.activate")}
                      >
                        <Power size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-12">
                  <EmptyState hasFilters={hasFilters} noDataLabel={t("userManagement.no_user_found")} onClear={() => { setSearch(""); clearFilters(); }} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ══ TABLET CARDS (md–lg, 768–1023px) — 2-column grid ════════════════ */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-3">
        {loadingData ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : devices.length > 0 ? (
          devices.map((item) => (
            <DeviceCard key={item.deviceId} item={item} {...cardProps} />
          ))
        ) : (
          <div className="col-span-2">
            <EmptyState hasFilters={hasFilters} noDataLabel={t("userManagement.no_user_found")} onClear={() => { setSearch(""); clearFilters(); }} />
          </div>
        )}
      </div>

      {/* ══ MOBILE CARDS (< md) — single column ═════════════════════════════ */}
      <div className="md:hidden space-y-3">
        {loadingData ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : devices.length > 0 ? (
          devices.map((item) => (
            <DeviceCard key={item.deviceId} item={item} {...cardProps} />
          ))
        ) : (
          <EmptyState hasFilters={hasFilters} noDataLabel={t("userManagement.no_user_found")} onClear={() => { setSearch(""); clearFilters(); }} />
        )}
      </div>

      {/* ══ PAGINATION ═══════════════════════════════════════════════════════ */}
      {showPagination && (
        <div className="flex justify-center items-center gap-3 p-3 flex-wrap">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
            {t("userManagement.prev")}
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {t("userManagement.page")} {currentPage} {t("userManagement.of")} {totalPages}
          </span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
            {t("userManagement.next")}
          </button>
        </div>
      )}

      {/* ══ CREATE DEVICE MODAL ══════════════════════════════════════════════
          z-[9999] escapes the sidebar's stacking context entirely.
          inset-0 + flex items-center justify-center = true viewport center
          on all screen sizes including tablet with sidebar visible.
      ════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 md:pl-[240px] lg:pl-[260px]">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-[#800000] px-6 py-4 flex items-center justify-between">
                <h5 className="text-white font-bold text-base">{t("userManagement.new_device")}</h5>
                <button onClick={() => { setShowModal(false); setError(""); }}
                  className="text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>
                )}
                <input required className={inputCls}
                  value={newUser.deviceId}
                  onChange={(e) => setNewUser({ deviceId: e.target.value })}
                  placeholder={t("userManagement.mac_placeholder")} />
                <button disabled={loading} type="submit"
                  className="w-full py-3 bg-[#800000] text-white font-bold rounded-xl hover:bg-[#6a0000] transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? t("userManagement.processing") : t("userManagement.create")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ CONFIRM TOGGLE MODAL ═════════════════════════════════════════════ */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 md:pl-[240px] lg:pl-[260px]">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="bg-[#800000] px-6 py-4">
                <h5 className="text-white font-bold text-base">{t("userManagement.confirm_action")}</h5>
              </div>
              <div className="p-6 text-center space-y-4">
                <p className="text-gray-700 text-sm">
                  {t("userManagement.are_you_sure")}{" "}
                  <strong className="text-[#800000]">
                    {selectedDevice?.deviceStatus === "ACTIVE" ? t("userManagement.disable") : t("userManagement.activate")}
                  </strong>{" "}
                  {t("userManagement.this_user")}?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmModal(false)}
                    className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition active:scale-95">
                    {t("userManagement.cancel")}
                  </button>
                  <button onClick={handleDisable}
                    className="flex-1 py-2.5 bg-[#800000] text-white rounded-xl text-sm font-bold hover:bg-[#6a0000] transition active:scale-95">
                    {t("userManagement.yes_confirm")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserManagement;