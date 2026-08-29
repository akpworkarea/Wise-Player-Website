import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Power, X, Search, Filter, ChevronDown,
  SlidersHorizontal, Calendar, Tag, ShieldCheck, Zap,
  CheckCircle2, XCircle, Info,
} from "lucide-react";
import { getUserDevices, createDevice, disableDevice, getPlans, activateDevicePlan } from "../auth/api/userManagement";
import { formatDate } from "../auth/utilfunction";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../context/dashboardContext";
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

// ─── Brand Toast ──────────────────────────────────────────────────────────────
const BrandToast = ({ toasts }) => (
  <div className="fixed top-5 inset-x-0 z-[99999] flex flex-col items-center gap-2 pointer-events-none px-4">
    <AnimatePresence>
      {toasts.map((t) => {
        const isSuccess = t.type === "success";
        const isError   = t.type === "error";
        const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : Info;
        return (
          <motion.div key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,   scale: 1     }}
            exit={{   opacity: 0, y: -12,  scale: 0.96  }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl
              text-sm font-bold text-white max-w-sm w-full
              ${isSuccess ? "bg-[#800000]" : isError ? "bg-red-600" : "bg-gray-800"}`}>
            <Icon size={17} className="shrink-0" />
            <span className="flex-1 leading-snug">{t.msg}</span>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

// ─── Device status styles ─────────────────────────────────────────────────────
const DEV_STATUS_STYLE = {
  ACTIVE:   { pill: "bg-green-100 text-green-700", dot: "bg-green-500" },
  INACTIVE: { pill: "bg-red-100 text-red-600",     dot: "bg-red-500"   },
};
const devStatusStyle = (s) =>
  DEV_STATUS_STYLE[s] || { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };

const FilterSection = ({ icon: Icon, label, children }) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-[#800000]" />
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
    {children}
  </div>
);

const CopyButton = ({ value, copiedId, onCopy, copyLabel, copiedLabel }) => {
  const isThis = copiedId === value;
  return (
    <div className="relative inline-flex shrink-0">
      <button onClick={() => onCopy(value)}
        className="text-[10px] border border-gray-300 px-2 py-0.5 rounded hover:bg-red-50 hover:border-[#800000] hover:text-[#800000] transition text-gray-500 whitespace-nowrap">
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

const DevStatusBadge = ({ status }) => {
  const ts = devStatusStyle(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${ts.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ts.dot}`} />
      {status}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="border-t animate-pulse">
    {[16, 18, 10, 11, 15, 12, 10, 8].map((w, i) => (
      <td key={i} className="px-3 py-3.5">
        <div className="h-3 bg-gray-200 rounded mx-auto" style={{ width: `${w * 4}%` }} />
      </td>
    ))}
  </tr>
);

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

const DeviceCard = ({
  item, copiedId, onCopy, onToggle, onActivate,
  copyLabel, copiedLabel, truncateId,
  planLabel, expiresLabel, registeredLabel, toggleLabel, activateLabel,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-3"
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Device</span>
      <DevStatusBadge status={item.deviceStatus} />
    </div>
    <div className="grid grid-cols-[5rem_1fr_auto] items-center gap-x-2 gap-y-2.5">
      <span className="text-[11px] font-semibold text-gray-500 leading-none">MAC</span>
      <span className="font-mono text-[11px] font-bold text-gray-800 truncate leading-none">{item.macAddress || "—"}</span>
      <span className="justify-self-end">
        {item.macAddress
          ? <CopyButton value={item.macAddress} copiedId={copiedId} onCopy={onCopy} copyLabel={copyLabel} copiedLabel={copiedLabel} />
          : <span className="w-[38px] inline-block" />}
      </span>
      <span className="text-[11px] font-semibold text-gray-500 leading-none">Device ID</span>
      <span className="text-[11px] font-semibold text-[#800000] truncate leading-none">{truncateId(item.deviceId, 10, 6)}</span>
      <span className="justify-self-end">
        <CopyButton value={item.deviceId} copiedId={copiedId} onCopy={onCopy} copyLabel={copyLabel} copiedLabel={copiedLabel} />
      </span>
    </div>
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
    <div className="flex gap-2">
      <button onClick={() => onActivate(item)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition active:scale-95
                   bg-[#800000] text-white hover:bg-[#6a0000]">
        <Zap size={14} /> {activateLabel}
      </button>
      <button onClick={() => onToggle(item)}
        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition active:scale-95 border ${
          item.deviceStatus === "INACTIVE"
            ? "border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
            : "border-gray-300 text-gray-600 hover:bg-gray-100"
        }`}>
        {toggleLabel}
      </button>
    </div>
  </motion.div>
);

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

const FilterPanelContent = ({
  statusFilter, setStatusFilter,
  subFilter, setSubFilter,
  registeredFrom, setRegisteredFrom,
  registeredTo, setRegisteredTo,
  expiresFrom, setExpiresFrom,
  expiresTo, setExpiresTo,
  planOptions, activeFilterCount, clearAll,
}) => {
  const STATUS_OPTS = ["", "ACTIVE", "INACTIVE"];
  return (
    <div className="space-y-5">
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
      <FilterSection icon={Calendar} label="Registered">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "From", value: registeredFrom, set: setRegisteredFrom, min: undefined },
            { label: "To",   value: registeredTo,   set: setRegisteredTo,   min: registeredFrom || undefined },
          ].map(({ label, value, set, min }) => (
            <div key={label} className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">{label}</label>
              <input type="date" value={value} min={min} onChange={(e) => set(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}
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
      <FilterSection icon={Calendar} label="Expires">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "From", value: expiresFrom, set: setExpiresFrom, min: undefined },
            { label: "To",   value: expiresTo,   set: setExpiresTo,   min: expiresFrom || undefined },
          ].map(({ label, value, set, min }) => (
            <div key={label} className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">{label}</label>
              <input type="date" value={value} min={min} onChange={(e) => set(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}
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
  const { refetchDashboard } = useDashboard();

  const [devices,     setDevices]     = useState([]);
  const [planOptions, setPlanOptions] = useState([]);
  const [totalUser,   setTotalUser]   = useState(0);
  const [activeUser,  setActiveUser]  = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingData, setLoadingData] = useState(true);

  const [search,         setSearch]         = useState("");
  const debouncedSearch                     = useDebounce(search, 450);
  const [showFilters,    setShowFilters]    = useState(false);
  const [statusFilter,   setStatusFilter]   = useState("");
  const [subFilter,      setSubFilter]      = useState("");
  const [registeredFrom, setRegisteredFrom] = useState("");
  const [registeredTo,   setRegisteredTo]   = useState("");
  const [expiresFrom,    setExpiresFrom]    = useState("");
  const [expiresTo,      setExpiresTo]      = useState("");

  const [showModal,      setShowModal]      = useState(false);
  const [newUser,        setNewUser]        = useState({ deviceId: "" });
  const [error,          setError]          = useState("");
  const [loading,        setLoading]        = useState(false);
  const [confirmModal,   setConfirmModal]   = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [copiedId,       setCopiedId]       = useState(null);

  // ── Activate Plan modal (replaces old RequestManagement "New Request" flow) ──
  // Device is pre-selected from the row/card that was clicked — no more
  // copy/paste of the device ID into a separate page. Submitting deducts
  // credits and activates the device immediately; there is no pending state.
  const [activateModal,   setActivateModal]   = useState(false);
  const [activateDevice,  setActivateDevice]  = useState(null);
  const [activatePlan,    setActivatePlan]    = useState("");
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateError,   setActivateError]   = useState("");

  // Brand toasts
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3500);
  }, []);

  const desktopFilterRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (desktopFilterRef.current && !desktopFilterRef.current.contains(e.target))
        setShowFilters(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    getPlans(userRole)
      .then((res) => { if (res.success) setPlanOptions((res.data || []).map((p) => p.name)); })
      .catch(() => {});
  }, [userRole]);

  const fetchPage = useCallback(async (page = 1) => {
    setLoadingData(true);
    try {
      const res = await getUserDevices(userRole, page - 1, 20, debouncedSearch, statusFilter, subFilter, registeredFrom, registeredTo, expiresFrom, expiresTo);
      if (res.success) {
        const data = [...(res.data?.content || [])].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
        setDevices(data);
        setTotalUser(res.data.totalElements ?? data.length);
        setTotalPages(res.data.totalPages ?? 1);
        setActiveUser(data.filter((u) => u.deviceStatus === "ACTIVE").length);
      }
    } catch (err) { console.error(err); }
    finally { setLoadingData(false); }
  }, [debouncedSearch, statusFilter, subFilter, registeredFrom, registeredTo, expiresFrom, expiresTo, userRole]);

  useEffect(() => { setCurrentPage(1); },
    [debouncedSearch, statusFilter, subFilter, registeredFrom, registeredTo, expiresFrom, expiresTo]);
  useEffect(() => { fetchPage(currentPage); }, [currentPage, fetchPage]);

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
    const response = await disableDevice(userRole, deviceId);
    if (response?.success) {
      setDevices((prev) => {
        const updated = prev.map((item) =>
          item.deviceId === deviceId
            ? { ...item, deviceStatus: item.deviceStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
            : item
        );
        setActiveUser(updated.filter((u) => u.deviceStatus === "ACTIVE").length);
        return updated;
      });
      showToast("Device status updated", "success");
    } else {
      showToast("Failed to update status", "error");
    }
    setConfirmModal(false);
    setSelectedDevice(null);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const macRegex = /^([0-9A-Fa-f]{2}([:-]?)){5}[0-9A-Fa-f]{2}$|^([0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}$/;
    if (!macRegex.test(newUser.deviceId)) { showToast(t("userManagement.invalid_mac"), "error"); return; }
    setLoading(true);
    const payload = { deviceId: newUser.deviceId, deviceModel: "Generic Smart Device", osVersion: "1.0.0", platform: "UNKNOWN" };
    const response = await createDevice(userRole, payload);
    if (response?.success) {
      setShowModal(false); setNewUser({ deviceId: "" }); setError("");
      showToast("Device created successfully", "success");
      fetchPage(currentPage);
    } else {
      setError(response?.message);
      showToast(response?.message || "Failed to create device", "error");
    }
    setLoading(false);
  };

  // ── Activate Plan — device is already known (row/card clicked), only the
  //    plan needs to be picked. Deducts credits and activates instantly. ──
  const openActivate = (item) => {
    setActivateDevice(item);
    setActivatePlan("");
    setActivateError("");
    setActivateModal(true);
  };

  const handleActivateSubmit = async (e) => {
    e.preventDefault();
    if (!activatePlan) { setActivateError("Please select a plan"); return; }
    setActivateError("");
    setActivateLoading(true);
    const payload = { deviceId: activateDevice.deviceId, planName: activatePlan, amount: 5, currency: "CREDITS" };
    const res = await activateDevicePlan(userRole, payload);
    if (res?.success) {
      setActivateModal(false);
      setActivateDevice(null);
      setActivatePlan("");
      showToast("Plan activated — credits deducted", "success");
      fetchPage(currentPage);
      refetchDashboard();
    } else {
      setActivateError(res?.message || "Failed to activate plan — check your credit balance");
      showToast(res?.message || "Failed to activate plan", "error");
    }
    setActivateLoading(false);
  };

  const activeFilterCount = [statusFilter, subFilter, registeredFrom, registeredTo, expiresFrom, expiresTo].filter(Boolean).length;
  const hasFilters        = !!(debouncedSearch || activeFilterCount);
  const showPagination    = totalPages > 1;

  const filterProps = {
    statusFilter, setStatusFilter, subFilter, setSubFilter,
    registeredFrom, setRegisteredFrom, registeredTo, setRegisteredTo,
    expiresFrom, setExpiresFrom, expiresTo, setExpiresTo,
    planOptions, activeFilterCount, clearAll: clearFilters,
  };

  const cardProps = {
    copiedId, onCopy: copyToClipboard, onToggle: handleToggle, onActivate: openActivate,
    copyLabel:       t("userManagement.copy")          || "Copy",
    copiedLabel:     t("userManagement.copied")        || "Copied!",
    truncateId,
    planLabel:       t("userManagement.plan")          || "Plan",
    expiresLabel:    t("userManagement.expires")       || "Expires",
    registeredLabel: t("userManagement.registered")    || "Registered",
    toggleLabel:     t("userManagement.toggle_status") || "Toggle Status",
    activateLabel:   t("userManagement.activate_plan") || "Activate Plan",
  };

  const inputCls = "w-full px-4 py-3 bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-sm font-semibold text-gray-800";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-[#f4f4f7] overflow-hidden">

      {/* ══ STICKY HEADER — title + search + filters + stats tiles ══════════ */}
      <div className="shrink-0 bg-[#f4f4f7] px-4 pt-4 pb-3 space-y-3 z-30">

        {/* Title row + controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

          {/* Title + subtitle */}
          <div className="shrink-0">
            <h3 className="font-bold text-[#800000] text-lg">
              {t("userManagement.device_management")}
            </h3>
            <p className="text-gray-500 text-sm mt-0.5">
              {t("userManagement.manage_members") || "Search by MAC address or Device ID"}
            </p>
          </div>

          {/* Controls: Search · Filter · Create */}
          <div className="flex items-center gap-2 w-full lg:w-auto">

            {/* Search */}
            <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm flex-1 min-w-0 lg:w-[240px] lg:flex-none min-[1400px]:w-[280px]">
              <div className="relative w-full">
                {loadingData && debouncedSearch ? (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#800000] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                )}
                <input
                  type="text"
                  placeholder={t("userManagement.search_device") || "Search MAC or Device ID…"}
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
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowFilters((v) => !v)}
                title="Filters"
                className={`flex items-center justify-center gap-1.5 w-10 min-[1400px]:w-auto min-[1400px]:px-4 h-10 rounded-xl border text-sm font-semibold transition
                  ${activeFilterCount > 0
                    ? "bg-[#800000] text-white border-[#800000] shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#800000] hover:text-[#800000] shadow-sm"}`}>
                <SlidersHorizontal size={15} />
                <span className="hidden min-[1400px]:inline">{t("userManagement.filters") || "Filters"}</span>
                <AnimatePresence>
                  {activeFilterCount > 0 && (
                    <motion.span key="fb" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="hidden min-[1400px]:flex bg-white text-[#800000] text-[10px] font-black w-4 h-4 rounded-full items-center justify-center leading-none shrink-0">
                      {activeFilterCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              {activeFilterCount > 0 && (
                <span className="min-[1400px]:hidden absolute -top-1 -right-1 w-4 h-4 bg-[#800000] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#f4f4f7]">
                  {activeFilterCount}
                </span>
              )}

              {/* Desktop filter dropdown */}
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

            {/* Create Device */}
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              title={t("userManagement.create_new_device")}
              className="flex items-center justify-center gap-1.5 w-10 min-[1400px]:w-auto min-[1400px]:px-4 h-10 bg-[#800000] text-white rounded-xl text-sm font-semibold hover:bg-[#6a0000] transition shadow-sm shrink-0">
              <UserPlus size={15} />
              <span className="hidden min-[1400px]:inline">{t("userManagement.create_new_device")}</span>
            </motion.button>
          </div>
        </div>

        {/* Active filter pills */}
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

        {/* Stat tiles — fixed, always visible */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                {t("userManagement.total_users") || "Total Devices"}
              </p>
              <p className="text-2xl font-black text-gray-800 mt-0.5">{totalUser}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#800000]/[0.08] flex items-center justify-center shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#800000]" />
            </div>
          </div>
          <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                {t("userManagement.active") || "Active"}
              </p>
              <p className="text-2xl font-black text-gray-800 mt-0.5">{activeUser}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ══ MOBILE FILTER DRAWER ════════════════════════════════════════════ */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div key="um-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="md:hidden fixed inset-0 bg-black/40 z-[9990]" />
            <motion.div key="um-drawer"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[9991] bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col">
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

      {/* ══ SCROLLABLE CONTENT — table + cards + pagination ═════════════════ */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-3
                      [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* ── Desktop table (lg+) ── */}
        <div className="hidden lg:block bg-white rounded-xl shadow border border-gray-200">
          <div className="overflow-x-auto rounded-xl [scrollbar-width:thin]">
            <table className="w-full text-sm min-w-[840px]">
              <colgroup>
                <col style={{ width: "18%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "9%"  }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "21%" }} />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  {[
                    t("userManagement.mac_address") || "MAC Address",
                    t("userManagement.device_id"),
                    t("userManagement.status"),
                    t("userManagement.plan") || "Plan",
                    t("userManagement.registered"),
                    t("userManagement.expires"),
                    t("userManagement.action"),
                  ].map((col) => (
                    <th key={col} className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
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
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-gray-700 tracking-wide whitespace-nowrap">
                            {item.macAddress || "—"}
                          </span>
                          {item.macAddress && (
                            <CopyButton value={item.macAddress} copiedId={copiedId} onCopy={copyToClipboard}
                              copyLabel={t("userManagement.copy")||"Copy"} copiedLabel={t("userManagement.copied")||"Copied!"} />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-center gap-1.5 min-w-0">
                          <span className="text-[#800000] font-semibold text-xs truncate min-w-0" title={item.deviceId}>
                            {truncateId(item.deviceId)}
                          </span>
                          <CopyButton value={item.deviceId} copiedId={copiedId} onCopy={copyToClipboard}
                            copyLabel={t("userManagement.copy")||"Copy"} copiedLabel={t("userManagement.copied")||"Copied!"} />
                        </div>
                      </td>
                      <td className="px-3 py-3.5"><DevStatusBadge status={item.deviceStatus} /></td>
                      <td className="px-3 py-3.5 text-gray-600 text-xs font-semibold">{item.subscriptionType || "—"}</td>
                      <td className="px-3 py-3.5 text-gray-500 text-xs">{formatDate(item.registeredAt)}</td>
                      <td className="px-3 py-3.5 text-gray-500 text-xs">{formatDate(item.expiresAt)}</td>
                      <td className="px-3 py-3.5">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openActivate(item)}
                            title={t("userManagement.activate_plan") || "Activate Plan"}
                            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold transition active:scale-95
                                       bg-[#800000] text-white hover:bg-[#6a0000]">
                            <Zap size={13} />
                          </button>
                          <button onClick={() => handleToggle(item)}
                            className={`p-2 rounded-lg border transition active:scale-95 ${
                              item.deviceStatus === "INACTIVE"
                                ? "border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                                : "border-gray-300 text-gray-500 hover:bg-gray-100"
                            }`}
                            title={item.deviceStatus === "ACTIVE" ? t("userManagement.disable") : t("userManagement.activate")}>
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
        </div>

        {/* ── Tablet cards (md–lg) ── */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-3">
          {loadingData
            ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            : devices.length > 0
              ? devices.map((item) => <DeviceCard key={item.deviceId} item={item} {...cardProps} />)
              : <div className="col-span-2"><EmptyState hasFilters={hasFilters} noDataLabel={t("userManagement.no_user_found")} onClear={() => { setSearch(""); clearFilters(); }} /></div>
          }
        </div>

        {/* ── Mobile cards (<md) ── */}
        <div className="md:hidden space-y-3">
          {loadingData
            ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            : devices.length > 0
              ? devices.map((item) => <DeviceCard key={item.deviceId} item={item} {...cardProps} />)
              : <EmptyState hasFilters={hasFilters} noDataLabel={t("userManagement.no_user_found")} onClear={() => { setSearch(""); clearFilters(); }} />
          }
        </div>

        {/* ── Pagination ── */}
        {showPagination && (
          <div className="flex items-center justify-center gap-3 py-3 flex-wrap">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50
                         disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-gray-600">
              ← {t("userManagement.prev") || "Prev"}
            </button>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-lg">
              <span className="text-xs font-bold text-[#800000]">{currentPage}</span>
              <span className="text-xs text-gray-400">/</span>
              <span className="text-xs font-semibold text-gray-600">{totalPages}</span>
              <span className="text-[10px] text-gray-400 ml-1">
                · {totalUser} {totalUser === 1 ? "device" : "devices"}
              </span>
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50
                         disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-gray-600">
              {t("userManagement.next") || "Next"} →
            </button>
          </div>
        )}
      </div>

      {/* ══ CREATE DEVICE MODAL ═════════════════════════════════════════════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-[#800000] px-6 pt-6 pb-5 relative">
                <button onClick={() => { setShowModal(false); setError(""); }}
                  className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <UserPlus size={20} className="text-white" />
                  </div>
                  <div>
                    <h5 className="text-white font-extrabold text-base leading-tight">
                      {t("userManagement.new_device") || "New Device"}
                    </h5>
                    <p className="text-white/60 text-xs mt-0.5">Enter the MAC address below</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-semibold">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    MAC Address
                  </label>
                  <input required className={inputCls}
                    value={newUser.deviceId}
                    onChange={(e) => setNewUser({ deviceId: e.target.value })}
                    placeholder={t("userManagement.mac_placeholder") || "e.g. AA:BB:CC:DD:EE:FF"} />
                </div>
                <motion.button
                  disabled={loading} type="submit"
                  whileHover={!loading ? { scale: 1.01 } : {}}
                  whileTap={!loading  ? { scale: 0.98 } : {}}
                  className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200
                    ${loading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm"}`}>
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : <><UserPlus size={15} />{t("userManagement.create") || "Create Device"}</>}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ ACTIVATE PLAN MODAL ═════════════════════════════════════════════
          Replaces the old separate "New Request" page. Device is already
          known (the row/card the user clicked), so only the plan is picked.
          Submitting deducts credits and activates the device immediately —
          no pending state, no admin approval step.
      ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-[#800000] px-6 pt-6 pb-5 relative">
                <button onClick={() => { setActivateModal(false); setActivateError(""); }}
                  className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Zap size={20} className="text-white" />
                  </div>
                  <div>
                    <h5 className="text-white font-extrabold text-base leading-tight">
                      {t("userManagement.activate_plan") || "Activate Plan"}
                    </h5>
                    <p className="text-white/60 text-xs mt-0.5">Credits will be deducted on activation</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleActivateSubmit} className="p-6 space-y-4">
                {activateError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-semibold">
                    {activateError}
                  </div>
                )}

                {/* Read-only device summary — no copy/paste needed anymore */}
                <div className="bg-[#f4f4f7] rounded-xl px-4 py-3 space-y-1.5 border border-gray-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-semibold">MAC Address</span>
                    <span className="font-mono font-bold text-gray-700">{activateDevice?.macAddress || "—"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-semibold">Device ID</span>
                    <span className="font-semibold text-[#800000] truncate max-w-[60%]" title={activateDevice?.deviceId}>
                      {truncateId(activateDevice?.deviceId, 10, 6)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Plan
                  </label>
                  <div className="relative">
                    <select required value={activatePlan}
                      onChange={(e) => setActivatePlan(e.target.value)}
                      className={`${inputCls} appearance-none pr-10 cursor-pointer`}>
                      <option value="">Select a plan</option>
                      {planOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#800000]">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                <motion.button
                  disabled={activateLoading} type="submit"
                  whileHover={!activateLoading ? { scale: 1.01 } : {}}
                  whileTap={!activateLoading  ? { scale: 0.98 } : {}}
                  className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200
                    ${activateLoading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm"}`}>
                  {activateLoading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : <><Zap size={15} />Activate Device</>}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ CONFIRM TOGGLE MODAL ════════════════════════════════════════════ */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="bg-[#800000] px-6 pt-6 pb-5 flex flex-col items-center gap-3">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Power size={20} className="text-white" />
                </motion.div>
                <h5 className="text-base font-extrabold text-white text-center">
                  {t("userManagement.confirm_action") || "Confirm Action"}
                </h5>
              </div>
              <div className="px-6 pt-5 pb-6 flex flex-col items-center gap-5">
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  {t("userManagement.are_you_sure") || "Are you sure you want to"}{" "}
                  <span className="font-bold text-[#800000]">
                    {selectedDevice?.deviceStatus === "ACTIVE"
                      ? t("userManagement.disable") || "disable"
                      : t("userManagement.activate") || "activate"}
                  </span>{" "}
                  {t("userManagement.this_user") || "this device"}?
                </p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setConfirmModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-200
                               hover:bg-gray-50 transition active:scale-95">
                    {t("userManagement.cancel") || "Cancel"}
                  </button>
                  <button onClick={handleDisable}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#800000]
                               hover:bg-[#6a0000] transition active:scale-95">
                    {t("userManagement.yes_confirm") || "Confirm"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ BRAND TOAST ════════════════════════════════════════════════════ */}
      <BrandToast toasts={toasts} />
    </div>
  );
}

export default UserManagement;