import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  UserPlus, Pencil, Trash2, Search, X, Filter, ChevronDown,
  SlidersHorizontal, Calendar, Coins, ShieldCheck, AlertTriangle,
  ShieldAlert, Eye, EyeOff, User, Lock, AtSign, Layers, Mail,
  CheckCircle2, XCircle, Info, KeyRound, RefreshCw, History, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";
import {
  createReseller, getAllResellerInfo, updateSubReseller,
  deleteSubReseller, updateBulkPermissions,
  updateIndividualPermission,
} from "../auth/reSeller";
import { formatDate } from "../auth/utilfunction";
import TransferModal from "../component/TransferModal";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../context/dashboardContext";

// ─── Brand Toast ──────────────────────────────────────────────────────────────
const BrandToast = ({ toasts }) => (
  <div className="fixed top-5 inset-x-0 z-[99999] flex flex-col items-center gap-2 pointer-events-none px-4">
    <AnimatePresence>
      {toasts.map((t) => {
        const isSuccess = t.type === "success";
        const isError = t.type === "error";
        const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : Info;
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl
              text-sm font-bold text-white max-w-sm w-full
              ${isSuccess ? "bg-[#800000]" : isError ? "bg-red-600" : "bg-gray-800"}`}
          >
            <Icon size={17} className="shrink-0" />
            <span className="flex-1 leading-snug">{t.msg}</span>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

// ─── Debounce ─────────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setD(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return d;
}

// ─── FilterSection ────────────────────────────────────────────────────────────
const FilterSection = ({ icon: Icon, label, children }) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-[#800000]" />
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
    {children}
  </div>
);

// ─── FilterPanelContent ───────────────────────────────────────────────────────
const FilterPanelContent = ({
  statusFilter, setStatusFilter,
  fromDate, setFromDate, toDate, setToDate,
  minCredits, setMinCredits, maxCredits, setMaxCredits,
  activeFilterCount, clearAll, t,
}) => {
  const STATUS_OPTS = [
    { value: "", label: t("sr_all"), dot: "bg-gray-300" },
    { value: "true", label: t("sr_active"), dot: "bg-green-500" },
    { value: "false", label: t("sr_inactive"), dot: "bg-red-500" },
  ];
  return (
    <div className="space-y-5">
      <FilterSection icon={ShieldCheck} label={t("sr_status")}>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTS.map((s) => {
            const isActive = statusFilter === s.value;
            return (
              <button key={s.value || "all-s"} onClick={() => setStatusFilter(s.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition active:scale-95
                  ${isActive ? "bg-[#800000] text-white border-[#800000]" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#800000] hover:text-[#800000]"}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-white" : s.dot}`} />
                {s.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection icon={Calendar} label={t("sr_registered_date")}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t("sr_from"), value: fromDate, set: setFromDate, min: undefined },
            { label: t("sr_to"), value: toDate, set: setToDate, min: fromDate || undefined },
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
        {(fromDate || toDate) && (
          <button onClick={() => { setFromDate(""); setToDate(""); }}
            className="text-[10px] text-gray-400 hover:text-[#800000] font-semibold flex items-center gap-1 mt-1 transition">
            <X size={10} /> {t("sr_clear_dates")}
          </button>
        )}
      </FilterSection>

      <FilterSection icon={Coins} label={t("sr_credits_range")}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t("sr_min"), value: minCredits, set: setMinCredits, ph: "0" },
            { label: t("sr_max"), value: maxCredits, set: setMaxCredits, ph: "∞" },
          ].map(({ label, value, set, ph }) => (
            <div key={label} className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">{label}</label>
              <input type="number" placeholder={ph} value={value} min="0" step="1"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onChange={(e) => set(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-gray-700 font-semibold
                           [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
          ))}
        </div>
        {(minCredits || maxCredits) && (
          <button onClick={() => { setMinCredits(""); setMaxCredits(""); }}
            className="text-[10px] text-gray-400 hover:text-[#800000] font-semibold flex items-center gap-1 mt-1 transition">
            <X size={10} /> {t("sr_clear_credits")}
          </button>
        )}
      </FilterSection>

      {activeFilterCount > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <button onClick={clearAll}
            className="w-full py-2 text-xs font-bold text-[#800000] hover:bg-red-50 rounded-xl transition">
            {t("sr_clear_all_filters")}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── CopyButton ───────────────────────────────────────────────────────────────
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

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ active, activeLabel, inactiveLabel }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
    ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-green-500" : "bg-red-500"}`} />
    {active ? activeLabel : inactiveLabel}
  </span>
);

// ─── SkeletonCard ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow border border-gray-200 p-4 animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-6 bg-gray-200 rounded-full w-16" />
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
    <div className="pt-2 border-t border-gray-100 space-y-1.5">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
    </div>
    <div className="flex gap-2 pt-1">
      <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
      <div className="w-9 h-9 bg-gray-200 rounded-xl" />
      <div className="w-9 h-9 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

// ─── SkeletonRow ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-t animate-pulse">
    {[36, 12, 17, 10, 25].map((w, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-3 bg-gray-200 rounded mx-auto" style={{ width: `${w * 2}%` }} />
      </td>
    ))}
  </tr>
);

// ─── SubCard ──────────────────────────────────────────────────────────────────
const SubCard = ({
  user, copiedId, onCopy, onTransfer, onEdit, onDelete, onPermissions, hasOverride,
  copyLabel, copiedLabel, truncateId,
  transferLabel, editLabel, deleteLabel, permissionsLabel, createdLabel, coinLabel,
  activeLabel, inactiveLabel, idLabel, usernameLabel,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.96 }}
    className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-3"
  >
    <div className="flex items-start justify-between gap-3">
      <span className="font-bold text-sm text-gray-800 truncate min-w-0 pr-1">{user.fullName}</span>
      <span className="shrink-0"><StatusBadge active={user.active} activeLabel={activeLabel} inactiveLabel={inactiveLabel} /></span>
    </div>
    <div className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-x-2 gap-y-2">
      <span className="text-[11px] font-semibold text-gray-500 leading-none">{idLabel}</span>
      <span className="text-[11px] font-semibold text-[#800000] truncate leading-none" title={user.id}>
        {truncateId(user.id, 8, 5)}
      </span>
      <span className="justify-self-end">
        <CopyButton value={user.id} copiedId={copiedId} onCopy={onCopy}
          copyLabel={copyLabel} copiedLabel={copiedLabel} />
      </span>
      <span className="text-[11px] font-semibold text-gray-500 leading-none">{usernameLabel}</span>
      <span className="text-[11px] font-semibold text-blue-600 truncate leading-none">{user.username}</span>
      <span className="justify-self-end">
        <CopyButton value={user.username} copiedId={copiedId} onCopy={onCopy}
          copyLabel={copyLabel} copiedLabel={copiedLabel} />
      </span>
    </div>
    <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
      <div className="flex justify-between gap-2">
        <span className="font-medium text-gray-600 shrink-0">{createdLabel}:</span>
        <span className="text-right">{formatDate(user.createdAt)}</span>
      </div>
      <div className="flex justify-between gap-2">
        <span className="font-medium text-gray-600 shrink-0">{coinLabel}:</span>
        <span className="font-black text-[#800000]">{user.credits ?? 0}</span>
      </div>
    </div>
    <div className="flex gap-2 pt-1">
      <button onClick={() => onTransfer(user)}
        className="flex-1 py-2.5 rounded-xl bg-[#800000] text-white text-sm font-bold hover:bg-[#6a0000] transition active:scale-95">
        {transferLabel}
      </button>
      <button onClick={() => onPermissions(user)} title={permissionsLabel}
        className="relative w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-[#800000] hover:text-[#800000] hover:bg-red-50 transition active:scale-95">
        <KeyRound size={15} />
        {hasOverride(user.id) && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white" />
        )}
      </button>
      <button onClick={() => onEdit(user)} title={editLabel}
        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-[#800000] hover:text-[#800000] hover:bg-red-50 transition active:scale-95">
        <Pencil size={15} />
      </button>
      <button onClick={() => onDelete(user)} title={deleteLabel}
        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white transition active:scale-95">
        <Trash2 size={15} />
      </button>
    </div>
  </motion.div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = ({ hasFilters, noDataLabel, onClear, noMatchLabel, clearLabel }) => (
  <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
    <Search size={28} className="opacity-40" />
    <p className="font-semibold text-sm text-center">
      {hasFilters ? noMatchLabel : noDataLabel}
    </p>
    {hasFilters && (
      <button onClick={onClear} className="text-xs text-[#800000] font-bold hover:underline">
        {clearLabel}
      </button>
    )}
  </div>
);

// ─── PermissionToggle — single labeled switch row ──────────────────────────
const PermissionToggle = ({ label, description, icon: Icon, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition
      ${checked ? "bg-red-50 border-[#800000]/30" : "bg-[#f4f4f7] border-transparent hover:border-gray-200"}`}
  >
    <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center
      ${checked ? "bg-[#800000] text-white" : "bg-white text-gray-400 border border-gray-200"}`}>
      <Icon size={14} />
    </div>
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-bold ${checked ? "text-[#800000]" : "text-gray-700"}`}>{label}</div>
      {description && <div className="text-[11px] text-gray-500 mt-0.5">{description}</div>}
    </div>
    <span
      role="switch"
      aria-checked={checked}
      className={`relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200
        ${checked ? "bg-[#800000]" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
          ${checked ? "translate-x-4" : "translate-x-0"}`}
      />
    </span>
  </button>
);

// ─── PermissionsPanel — shared toggle grid w/ skeleton state ───────────────
const PermissionsPanel = ({ permissions, onChange, loading, config }) => {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {config.map((c) => (
          <div key={c.key} className="h-[62px] rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2.5">
      {config.map(({ key, label, description, icon }) => (
        <PermissionToggle key={key} label={label} description={description} icon={icon}
          checked={permissions[key]}
          onChange={(val) => onChange(key, val)} />
      ))}
    </div>
  );
};

// ─── FormField ────────────────────────────────────────────────────────────────
const FormField = ({ label, icon: Icon, required, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
      <Icon size={11} className="text-[#800000]" />
      {label}
      {required && <span className="text-[#800000] text-sm leading-none">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-3 bg-[#f4f4f7] border-2 border-transparent rounded-xl focus:border-[#800000] focus:bg-white focus:outline-none transition-all duration-200 text-sm font-semibold text-gray-800 placeholder:font-normal placeholder:text-gray-400";

// ═════════════════════════════════════════════════════════════════════════════
const SubresellerDashboard = () => {
  const { t } = useTranslation();
  const { dashboard, refetchDashboard } = useDashboard();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [users,       setUsers]       = useState([]);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalUsers,  setTotalUsers]  = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingData, setLoadingData] = useState(true);

  // ── Search ────────────────────────────────────────────────────────────────
  const [search,        setSearch]        = useState("");
  const debouncedSearch                   = useDebounce(search, 450);

  // ── Filter panel ──────────────────────────────────────────────────────────
  const [showFilter,   setShowFilter]   = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate,     setFromDate]     = useState("");
  const [toDate,       setToDate]       = useState("");
  const [minCredits,   setMinCredits]   = useState("");
  const [maxCredits,   setMaxCredits]   = useState("");
  const debouncedMin = useDebounce(minCredits, 500);
  const debouncedMax = useDebounce(maxCredits, 500);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [openModel,     setOpenModel]     = useState(false);
  const [editModal,     setEditModal]     = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [deleteModal,   setDeleteModal]   = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [userToDelete,  setUserToDelete]  = useState(null);
  const [editUserId,    setEditUserId]    = useState(null);
  const [editData,      setEditData]      = useState({ fullName: "", email: "", password: "" });
  const [showEditPwd,   setShowEditPwd]   = useState(false);

  // ── Create form ───────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({ username: "", password: "", fullName: "", email: "" });
  const [showPwd,  setShowPwd]  = useState(false);
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState("");

  // ── Permission sync (bulk + individual) ──────────────────────────────────
  // NOTE: role-level defaults now arrive embedded in the sub-resellers list
  // response (`bulkPermissions`), and each user row already carries its own
  // canCreate/canRead/canUpdate/canDelete — so there's no separate
  // /api/admin/crud-permissions call anymore. Everything below is hydrated
  // straight out of fetchData().
  const [permModal,       setPermModal]       = useState(false);
  const [permInitialized, setPermInitialized] = useState(false); // true once bulkPermissions has arrived at least once
  const [permSaving,      setPermSaving]      = useState(false);
  const [permissions,     setPermissions]     = useState({
    canCreate: false, canRead: false, canUpdate: false, canDelete: false,
  });
  const [permUpdatedAt,   setPermUpdatedAt]   = useState(null);

  const [indivModal,        setIndivModal]        = useState(false);
  const [indivUser,         setIndivUser]         = useState(null);
  const [indivPermissions,  setIndivPermissions]  = useState({
    canCreate: false, canRead: false, canUpdate: false, canDelete: false,
  });
  const [indivUpdatedAt,    setIndivUpdatedAt]    = useState(null);
  const [indivRecent,       setIndivRecent]       = useState(false);
  const [indivSaving,       setIndivSaving]       = useState(false);

  // ── Brand toasts ──────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const desktopFilterRef = useRef(null);
  const fetchAbortRef = useRef(null);
  const fetchSeqRef   = useRef(0);

  useEffect(() => {
    const h = (e) => {
      if (desktopFilterRef.current && !desktopFilterRef.current.contains(e.target))
        setShowFilter(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Copy ──────────────────────────────────────────────────────────────────
  const [copiedId, setCopiedId] = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (page = 1) => {
  // cancel whatever is still in flight
  if (fetchAbortRef.current) fetchAbortRef.current.abort();
  const controller = new AbortController();
  fetchAbortRef.current = controller;
  const seq = ++fetchSeqRef.current;

  setLoadingData(true);
  try {
    const res = await getAllResellerInfo(
      page - 1, 20,
      debouncedSearch, statusFilter,
      fromDate, toDate,
      debouncedMin, debouncedMax,
      controller.signal,           // NEW
    );

    // a newer fetchData call has since started — ignore this stale result
    if (seq !== fetchSeqRef.current || res.cancelled) return;

    if (res.success) {
      setUsers(res.data?.content ?? []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalUsers(res.data?.totalElements ?? res.data?.content?.length ?? 0);

      const bp = res.data?.bulkPermissions;
      if (bp) {
        setPermissions({
          canCreate: !!bp.canCreate,
          canRead:   !!bp.canRead,
          canUpdate: !!bp.canUpdate,
          canDelete: !!bp.canDelete,
        });
        setPermUpdatedAt(bp.updatedAt ?? null);
        setPermInitialized(true);
      }
    } else {
      showToast(res.message || t("sr_toast_load_failed"), "error");
    }
  } catch (err) {
    if (seq === fetchSeqRef.current) { console.error(err); setUsers([]); }
  } finally {
    if (seq === fetchSeqRef.current) setLoadingData(false);
  }
}, [debouncedSearch, statusFilter, fromDate, toDate, debouncedMin, debouncedMax, showToast, t]);

useEffect(() => () => fetchAbortRef.current?.abort(), []);

  useEffect(() => { setCurrentPage(1); },
    [debouncedSearch, statusFilter, fromDate, toDate, debouncedMin, debouncedMax]);

  useEffect(() => { fetchData(currentPage); }, [currentPage, fetchData]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const onCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const truncateId = (id, start = 8, end = 5) => {
    if (!id) return "—";
    if (id.length <= start + end) return id;
    return `${id.slice(0, start)}…${id.slice(-end)}`;
  };

  const timeAgo = (iso) => {
    if (!iso) return null;
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return t("sr_just_now");
    if (mins < 60) return `${mins}${t("sr_m_ago")}`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}${t("sr_h_ago")}`;
    return `${Math.floor(hrs / 24)}${t("sr_d_ago")}`;
  };

  const isRecentlyChanged = (iso, windowMs = 5 * 60 * 1000) => {
    if (!iso) return false;
    return (Date.now() - new Date(iso).getTime()) < windowMs;
  };

  const clearFilters = () => {
    setStatusFilter(""); setFromDate(""); setToDate("");
    setMinCredits(""); setMaxCredits(""); setShowFilter(false);
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true); setError("");
    const res = await createReseller(formData);
    setCreating(false);
    if (res.success) {
      setOpenModel(false);
      setFormData({ username: "", password: "", fullName: "", email: "" });
      setCurrentPage(1); fetchData(1); await refetchDashboard();
      showToast(t("sr_toast_created"), "success");
    } else {
      setError(res.message);
      showToast(res.message || t("sr_toast_create_failed"), "error");
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    const payload = { fullName: editData.fullName, email: editData.email };
    if (editData.password) payload.password = editData.password;
    const res = await updateSubReseller(editUserId, payload);
    if (res.success) {
      setEditModal(false); setError(""); fetchData(currentPage);
      showToast(t("sr_toast_updated"), "success");
    } else {
      setError(res.message);
      showToast(res.message || t("sr_toast_update_failed"), "error");
    }
  };

  const handleEditOpen = (user) => {
    setEditUserId(user.id);
    setEditData({ fullName: user.fullName || "", email: user.email || "", password: "" });
    setShowEditPwd(false);
    setEditModal(true);
  };

  // ── Transfer ──────────────────────────────────────────────────────────────
  const handleOpenTransfer = (user) => {
    setSelectedUser({
      fullName: user.fullName,
      credits: dashboard?.stats?.creditCoin ?? 0,
      id: user.id,
      subResellerCredits: user.credits,
    });
    setTransferModal(true);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteOpen = (user) => { setUserToDelete(user); setDeleteModal(true); };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    const res = await deleteSubReseller(userToDelete.id);
    setDeleting(false);
    if (res.success) {
      showToast(`"${userToDelete.fullName}" ${t("sr_toast_deleted")}`, "success");
      setDeleteModal(false); setUserToDelete(null);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      fetchData(currentPage); await refetchDashboard();
    } else {
      showToast(res.message || t("sr_toast_delete_failed"), "error");
    }
  };

  // ── Bulk permissions ──────────────────────────────────────────────────────
  const handlePermSave = async () => {
    setPermSaving(true);
    const res = await updateBulkPermissions(permissions);
    setPermSaving(false);
    if (res.success) {
      showToast(t("sr_toast_perms_applied"), "success");
      setPermModal(false);
      fetchData(currentPage); // resync bulkPermissions + per-user CRUD flags
    } else {
      showToast(res.message || t("sr_toast_perms_failed"), "error");
    }
  };

  // A row is "overridden" when its own CRUD flags differ from the role defaults.
  const hasOverride = (userId) => {
    const u = users.find((x) => x.id === userId);
    if (!u) return false;
    return (
      u.canCreate !== permissions.canCreate ||
      u.canRead   !== permissions.canRead   ||
      u.canUpdate !== permissions.canUpdate ||
      u.canDelete !== permissions.canDelete
    );
  };

  const openIndivPerm = (user) => {
    setIndivUser(user);
    setIndivPermissions({
      canCreate: user.canCreate ?? permissions.canCreate,
      canRead:   user.canRead   ?? permissions.canRead,
      canUpdate: user.canUpdate ?? permissions.canUpdate,
      canDelete: user.canDelete ?? permissions.canDelete,
    });
    setIndivUpdatedAt(user.updatedAt ?? null);
    setIndivRecent(isRecentlyChanged(user.updatedAt));
    setIndivModal(true);
  };

  const handleIndivPermSave = async () => {
    if (!indivUser) return;
    setIndivSaving(true);
    const res = await updateIndividualPermission(indivUser.id, indivPermissions);
    setIndivSaving(false);
    if (res.success) {
      showToast(`${t("sr_toast_indiv_perms_updated")} "${indivUser.fullName}"`, "success");
      setIndivModal(false);
      fetchData(currentPage); // resync this user's CRUD flags + updatedAt
    } else {
      showToast(res.message || t("sr_toast_perms_failed"), "error");
    }
  };

  const PERM_CONFIG = [
    { key: "canRead",   label: t("sr_perm_view"),   description: t("sr_perm_view_desc"),   icon: Eye      },
    { key: "canCreate", label: t("sr_perm_create"), description: t("sr_perm_create_desc"), icon: UserPlus },
    { key: "canUpdate", label: t("sr_perm_edit"),   description: t("sr_perm_edit_desc"),   icon: Pencil   },
    { key: "canDelete", label: t("sr_perm_delete"), description: t("sr_perm_delete_desc"), icon: Trash2   },
  ];

  const activeFilterCount = [statusFilter, fromDate, toDate, minCredits, maxCredits].filter(Boolean).length;
  const hasFilters        = !!(debouncedSearch || activeFilterCount);

  const filterProps = {
    statusFilter, setStatusFilter,
    fromDate, setFromDate, toDate, setToDate,
    minCredits, setMinCredits, maxCredits, setMaxCredits,
    activeFilterCount, clearAll: clearFilters, t,
  };

  const cardProps = {
    copiedId, onCopy,
    onTransfer: handleOpenTransfer,
    onEdit: handleEditOpen,
    onDelete: handleDeleteOpen,
    onPermissions: openIndivPerm,
    hasOverride,
    copyLabel:        t("admin_dashboard.copy")   || "Copy",
    copiedLabel:      t("admin_dashboard.copied") || "Copied!",
    transferLabel:    t("transfer")                || "Transfer",
    editLabel:        t("edit")                    || "Edit",
    deleteLabel:       t("delete")                  || "Delete",
    permissionsLabel: t("permissions")             || "Permissions",
    createdLabel:     t("created")                 || "Created",
    coinLabel:        t("coin")                    || "Coins",
    activeLabel:      t("sr_active"),
    inactiveLabel:    t("sr_inactive"),
    idLabel:          t("id_label") || "ID",
    usernameLabel:    t("sr_username_label"),
    truncateId,
  };

  const emptyStateProps = {
    hasFilters,
    noDataLabel: t("no_data") || "No sub-resellers found",
    noMatchLabel: t("sr_no_match_filters"),
    clearLabel: t("sr_clear_filters"),
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-[#f4f4f7] overflow-hidden">

      {/* ══ STICKY HEADER — title + search + filter + create — never scrolls ══ */}
      <div className="shrink-0 sticky top-0 bg-[#f4f4f7] px-4 pt-4 pb-3 space-y-3 z-30">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

          {/* Title + subtitle */}
          <div className="shrink-0">
            <h3 className="font-bold text-[#800000] text-lg leading-tight">
              {t("subreseller_management")}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {t("manage_subreseller") || "Manage and search your sub-resellers"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 w-full lg:w-auto min-w-0">

            {/* Search */}
            <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm
                            flex-1 min-w-0 lg:flex-none lg:w-[220px] min-[1400px]:w-[280px]">
              <div className="relative w-full">
                {loadingData && debouncedSearch ? (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#800000] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                )}
                <input
                  type="text"
placeholder={t("sr_search_placeholder") || "Search by name, username or ID…"}                  value={search}
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

            {/* Filter */}
            <div className="relative shrink-0" ref={desktopFilterRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilter((v) => !v)}
                title={t("filters") || "Filters"}
                className={`flex items-center justify-center gap-1.5 w-10 min-[1400px]:w-auto min-[1400px]:px-4 h-10 rounded-xl border text-sm font-semibold transition
                  ${activeFilterCount > 0
                    ? "bg-[#800000] text-white border-[#800000] shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#800000] hover:text-[#800000] shadow-sm"}`}
              >
                <SlidersHorizontal size={15} />
                <span className="hidden min-[1400px]:inline">{t("filters") || "Filters"}</span>
                <AnimatePresence>
                  {activeFilterCount > 0 && (
                    <motion.span key="fb" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="hidden min-[1400px]:flex bg-white text-[#800000] text-[10px] font-black w-4 h-4 rounded-full items-center justify-center leading-none shrink-0">
                      {activeFilterCount}
                    </motion.span>
                  )}
                </AnimatePresence>
                <ChevronDown size={12} className={`hidden min-[1400px]:block transition-transform duration-200 ${showFilter ? "rotate-180" : ""}`} />
              </motion.button>
              {activeFilterCount > 0 && (
                <span className="min-[1400px]:hidden absolute -top-1 -right-1 w-4 h-4 bg-[#800000] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#f4f4f7]">
                  {activeFilterCount}
                </span>
              )}

              <AnimatePresence>
                {showFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="hidden md:block absolute right-0 top-full mt-2 z-[60] bg-white border border-gray-200 rounded-2xl shadow-2xl w-72 lg:w-80 p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Filter size={14} className="text-[#800000]" />
                        <span className="text-sm font-bold text-gray-800">{t("sr_filter_title")}</span>
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

            {/* Permissions */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setPermModal(true)}
              title={t("permissions") || "Permissions"}
              className="flex items-center justify-center gap-1.5 w-10 min-[1400px]:w-auto min-[1400px]:px-4 h-10 rounded-xl
                         border border-gray-200 bg-white text-gray-700 text-sm font-semibold
                         hover:border-[#800000] hover:text-[#800000] transition shadow-sm shrink-0"
            >
              <ShieldAlert size={15} />
              <span className="hidden min-[1400px]:inline">{t("permissions") || "Permissions"}</span>
            </motion.button>

            {/* Create */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setOpenModel(true); setError(""); }}
              title={t("create_subreseller") || "New Sub-Reseller"}
              className="flex items-center justify-center gap-1.5 w-10 min-[1400px]:w-auto min-[1400px]:px-4 h-10
                         bg-[#800000] text-white rounded-xl text-sm font-semibold
                         hover:bg-[#6a0000] transition shadow-sm shrink-0"
            >
              <UserPlus size={15} />
              <span className="hidden min-[1400px]:inline">{t("create_subreseller") || "New Sub-Reseller"}</span>
            </motion.button>
          </div>
        </div>

        {/* Active filter pills */}
        <AnimatePresence>
          {hasFilters && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                {loadingData ? t("sr_searching") : `${users.length} ${users.length !== 1 ? t("sr_results") : t("sr_result")}`}
              </span>
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                  <Search size={10} className="shrink-0" />"{debouncedSearch}"
                  <button onClick={() => setSearch("")}><X size={10} /></button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                  <ShieldCheck size={10} />{statusFilter === "true" ? t("sr_active") : t("sr_inactive")}
                  <button onClick={() => setStatusFilter("")}><X size={10} /></button>
                </span>
              )}
              {(fromDate || toDate) && (
                <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                  <Calendar size={10} />
                  {fromDate && toDate ? `${fromDate} → ${toDate}` : fromDate ? `${t("sr_from")} ${fromDate}` : `${t("sr_to")} ${toDate}`}
                  <button onClick={() => { setFromDate(""); setToDate(""); }}><X size={10} /></button>
                </span>
              )}
              {(minCredits || maxCredits) && (
                <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                  <Coins size={10} />
                  {minCredits && maxCredits ? `${minCredits}–${maxCredits} cr` : minCredits ? `${t("sr_min")} ${minCredits}` : `${t("sr_max")} ${maxCredits}`}
                  <button onClick={() => { setMinCredits(""); setMaxCredits(""); }}><X size={10} /></button>
                </span>
              )}
              {(activeFilterCount + (debouncedSearch ? 1 : 0)) > 1 && (
                <button onClick={() => { setSearch(""); clearFilters(); }}
                  className="text-xs text-gray-400 hover:text-[#800000] font-semibold transition">
                  {t("sr_clear_all")}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══ MOBILE FILTER DRAWER ════════════════════════════════════════════ */}
      <AnimatePresence>
        {showFilter && (
          <>
            <motion.div key="sr-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilter(false)}
              className="md:hidden fixed inset-0 bg-black/40 z-[9990]" />
            <motion.div key="sr-drawer"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[9991] bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col"
            >
              <div className="pt-3 pb-1 flex justify-center shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <Filter size={15} className="text-[#800000]" />
                  <span className="text-base font-bold text-gray-800">{t("sr_filter_title")}</span>
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

      <div className="flex-1 min-h-0 flex flex-col px-4 pb-3 gap-3">

        {/* ══ DESKTOP TABLE (lg+) — scrolls vertically when rows exceed space ══ */}
        <div className="hidden lg:flex flex-col flex-1 min-h-0 bg-white rounded-xl shadow border border-gray-200">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto rounded-xl
                          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-sm min-w-[680px]">
              <colgroup>
                <col style={{ width: "33%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "9%"  }} />
                <col style={{ width: "32%" }} />
              </colgroup>
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-100 border-b border-gray-200">
                  {[
                    t("user_details")  || "User Details",
                    t("status")        || "Status",
                    t("created")       || "Created",
                    t("coin")          || "Coins",
                    t("action")        || "Actions",
                  ].map((col) => (
                    <th key={col} className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 first:text-left">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingData ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : users.length > 0 ? (
                  users.map((user, idx) => (
                    <tr key={user.id}
                      className={`group transition-colors duration-150 hover:bg-red-50/30 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}>
                      <td className="px-4 py-3.5 text-left">
                        <div className="font-bold text-gray-800 text-sm truncate mb-1">{user.fullName}</div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="text-[11px] text-gray-400 font-medium">{t("sr_username_label")}</span>
                          <span className="text-[11px] text-blue-600 font-semibold">{user.username}</span>
                          <CopyButton value={user.username} copiedId={copiedId} onCopy={onCopy}
                            copyLabel={t("admin_dashboard.copy")||"Copy"} copiedLabel={t("admin_dashboard.copied")||"Copied!"} />
                        </div>
                       
                      </td>
                      <td className="px-4 py-3.5 text-center"><StatusBadge active={user.active} activeLabel={t("sr_active")} inactiveLabel={t("sr_inactive")} /></td>
                      <td className="px-4 py-3.5 text-center text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-black text-[#800000] text-sm">{user.credits ?? 0}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleOpenTransfer(user)}
                            className="px-3 py-1.5 rounded-lg bg-[#800000] text-white hover:bg-[#6a0000] text-xs font-bold transition active:scale-95 shadow-sm">
                            {t("transfer") || "Transfer"}
                          </button>
                          <button onClick={() => openIndivPerm(user)}
                            className="relative p-1.5 rounded-lg border border-gray-200 hover:border-[#800000] hover:text-[#800000] hover:bg-red-50 text-gray-500 transition active:scale-95"
                            title={t("permissions") || "Permissions"}>
                            <KeyRound size={13} />
                            {hasOverride(user.id) && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 border border-white" />
                            )}
                          </button>
                          <button onClick={() => handleEditOpen(user)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:border-[#800000] hover:text-[#800000] hover:bg-red-50 text-gray-500 transition active:scale-95"
                            title={t("edit") || "Edit"}>
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDeleteOpen(user)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white transition active:scale-95"
                            title={t("delete") || "Delete"}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12">
                      <EmptyState {...emptyStateProps} onClear={() => { setSearch(""); clearFilters(); }} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══ TABLET CARDS (md–lg) — scrollable block ═════════════════════ */}
        <div className="hidden md:block lg:hidden flex-1 min-h-0 overflow-y-auto
                        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="grid grid-cols-2 gap-3 pb-2">
            {loadingData ? (
              [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            ) : users.length > 0 ? (
              <AnimatePresence>
                {users.map((user) => <SubCard key={user.id} user={user} {...cardProps} />)}
              </AnimatePresence>
            ) : (
              <div className="col-span-2">
                <EmptyState {...emptyStateProps} onClear={() => { setSearch(""); clearFilters(); }} />
              </div>
            )}
          </div>
        </div>

        {/* ══ MOBILE CARDS (< md) — scrollable block ══════════════════════ */}
        <div className="md:hidden flex-1 min-h-0 overflow-y-auto
                        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-3 pb-2">
            {loadingData ? (
              [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            ) : users.length > 0 ? (
              <AnimatePresence>
                {users.map((user) => <SubCard key={user.id} user={user} {...cardProps} />)}
              </AnimatePresence>
            ) : (
              <EmptyState {...emptyStateProps} onClear={() => { setSearch(""); clearFilters(); }} />
            )}
          </div>
        </div>

        {/* ══ PAGINATION — always visible, shows total count even on 1 page ══ */}
        <div className="shrink-0 flex flex-col items-center gap-1.5 py-2 bg-[#f4f4f7]">
          <div className="flex items-center gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50
                         disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-gray-600">
              ← {t("transaction.prev") || "Prev"}
            </button>
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-200 rounded-lg">
              <span className="text-xs font-bold text-[#800000]">{currentPage}</span>
              <span className="text-xs text-gray-400">/</span>
              <span className="text-xs font-semibold text-gray-600">{totalPages}</span>
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50
                         disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-gray-600">
              {t("transaction.next") || "Next"} →
            </button>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            {totalUsers} {totalUsers === 1 ? t("sr_sub_reseller_singular") : t("sr_sub_reseller_plural")}
          </span>
        </div>

      </div>{/* end outer flex column */}

      {/* ══ CREATE MODAL ═════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {openModel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-[#800000] px-6 pt-6 pb-5 relative">
                <button onClick={() => { setOpenModel(false); setError(""); setFormData({ username: "", password: "", fullName: "", email: "" }); }}
                  className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <MdClose size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <UserPlus size={20} className="text-white" />
                  </div>
                  <div>
                    <h5 className="text-white font-extrabold text-base leading-tight">
                      {t("create_subreseller") || "New Sub-Reseller"}
                    </h5>
                    <p className="text-white/60 text-xs mt-0.5">{t("sr_fill_details")}</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span className="font-semibold">{error}</span>
                  </motion.div>
                )}
                <FormField label={t("full_name")} icon={User} required>
                  <input className={inputCls} placeholder={t("sr_full_name_ph")}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
                </FormField>
                <FormField label={t("username_label")} icon={AtSign} required>
                  <input className={inputCls} placeholder={t("sr_username_ph")}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                </FormField>
                <FormField label={t("sr_email")} icon={Mail} required>
                  <input type="email" className={inputCls} placeholder={t("sr_email_ph")}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </FormField>
                <FormField label={t("sr_password")} icon={Lock} required>
                  <div className="relative">
                    <input type={showPwd ? "text" : "password"} className={`${inputCls} pr-11`}
                      placeholder={t("sr_password_ph")}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    <button type="button" tabIndex={-1} onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormField>
                <motion.button type="submit" disabled={creating}
                  whileHover={!creating ? { scale: 1.01 } : {}} whileTap={!creating ? { scale: 0.98 } : {}}
                  className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200
                    ${creating ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm"}`}>
                  {creating ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : <><UserPlus size={15} />{t("create_subreseller") || "Create Sub-Reseller"}</>}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ EDIT MODAL ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-[#800000] px-6 pt-6 pb-5 relative">
                <button onClick={() => { setEditModal(false); setError(""); }}
                  className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <MdClose size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Pencil size={18} className="text-white" />
                  </div>
                  <div>
                    <h5 className="text-white font-extrabold text-base leading-tight">{t("update") || "Edit Sub-Reseller"}</h5>
                    <p className="text-white/60 text-xs mt-0.5">{t("sr_update_account_details")}</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                {error && (
                  <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span className="font-semibold">{error}</span>
                  </div>
                )}
                <FormField label={t("full_name")} icon={User}>
                  <input className={inputCls} placeholder={t("full_name")}
                    value={editData.fullName} onChange={(e) => setEditData({ ...editData, fullName: e.target.value })} />
                </FormField>
                <FormField label={t("sr_new_password")} icon={Lock}>
                  <div className="relative">
                    <input type={showEditPwd ? "text" : "password"} className={`${inputCls} pr-11`}
                      placeholder={t("sr_new_password_ph")}
                      value={editData.password} onChange={(e) => setEditData({ ...editData, password: e.target.value })} />
                    <button type="button" tabIndex={-1} onClick={() => setShowEditPwd((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
                      {showEditPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormField>
                <button type="submit"
                  className="w-full h-12 bg-[#800000] text-white font-bold rounded-xl hover:bg-[#6a0000] transition active:scale-95 flex items-center justify-center gap-2">
                  <Pencil size={14} />{t("sr_save_changes")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ DELETE MODAL ═════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteModal && userToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="bg-[#800000] px-6 pt-6 pb-5 flex flex-col items-center gap-3">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <AlertTriangle size={22} className="text-white" />
                </motion.div>
                <h5 className="text-base font-extrabold text-white text-center">{t("sr_delete_title")}</h5>
              </div>
              <div className="px-6 pt-5 pb-6 flex flex-col items-center gap-5">
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  {t("sr_delete_confirm")}{" "}
                  <span className="font-bold text-[#800000]">{userToDelete.fullName}</span>?
                  {" "}{t("sr_delete_warning")}
                </p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => { setDeleteModal(false); setUserToDelete(null); }} disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition active:scale-95 disabled:opacity-50">
                    {t("sr_cancel")}
                  </button>
                  <button onClick={handleDeleteConfirm} disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                    {deleting ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : <><Trash2 size={14} />{t("delete") || "Delete"}</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ BULK PERMISSIONS MODAL ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {permModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-[#800000] px-6 pt-6 pb-5 relative">
                <button onClick={() => setPermModal(false)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <MdClose size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Layers size={20} className="text-white" />
                  </div>
                  <div>
                    <h5 className="text-white font-extrabold text-base leading-tight">{t("sr_bulk_permissions")}</h5>
                    <p className="text-white/60 text-xs mt-0.5">{t("sr_bulk_permissions_desc")}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl">
                  <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 font-medium leading-relaxed">
                    {t("sr_bulk_warning")}
                  </p>
                </div>

                <div className="pt-1">
                  <PermissionsPanel
                    permissions={permissions}
                    loading={!permInitialized}
                    config={PERM_CONFIG}
                    onChange={(key, val) => setPermissions((prev) => ({ ...prev, [key]: val }))}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="button" disabled={!permInitialized}
                    onClick={() => setPermissions({ canCreate: true, canRead: true, canUpdate: true, canDelete: true })}
                    className="flex-1 py-2 text-xs font-bold text-[#800000] border border-[#800000]/30 rounded-xl hover:bg-[#800000]/5 transition disabled:opacity-50">
                    {t("sr_enable_all")}
                  </button>
                  <button type="button" disabled={!permInitialized}
                    onClick={() => setPermissions({ canCreate: false, canRead: false, canUpdate: false, canDelete: false })}
                    className="flex-1 py-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50">
                    {t("sr_disable_all")}
                  </button>
                </div>

                <motion.button onClick={handlePermSave} disabled={permSaving || !permInitialized}
                  whileHover={!permSaving ? { scale: 1.01 } : {}} whileTap={!permSaving ? { scale: 0.98 } : {}}
                  className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 mt-1
                    ${permSaving || !permInitialized ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm"}`}>
                  {permSaving ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : <><ShieldAlert size={15} />{t("sr_apply_permissions")}</>}
                </motion.button>

                {/* Sync footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                    <History size={11} />
                    {!permInitialized ? t("sr_syncing") : permUpdatedAt ? `${t("sr_updated")} ${timeAgo(permUpdatedAt)}` : t("sr_not_synced")}
                  </span>
                  <button onClick={() => fetchData(currentPage)} disabled={loadingData}
                    className="text-[10px] font-bold text-[#800000] flex items-center gap-1 hover:underline disabled:opacity-50">
                    <motion.span animate={loadingData ? { rotate: 360 } : { rotate: 0 }}
                      transition={loadingData ? { repeat: Infinity, duration: 0.8, ease: "linear" } : {}}
                      className="inline-flex">
                      <RefreshCw size={11} />
                    </motion.span>
                    {t("sr_refresh")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ INDIVIDUAL PERMISSIONS MODAL ═════════════════════════════════════ */}
      <AnimatePresence>
        {indivModal && indivUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-[#800000] px-6 pt-6 pb-5 relative">
                <button onClick={() => setIndivModal(false)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <MdClose size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 font-black text-white text-sm">
                    {indivUser.fullName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-white font-extrabold text-base leading-tight truncate">{indivUser.fullName}</h5>
                    <p className="text-white/60 text-xs mt-0.5 truncate">
                      @{indivUser.username} · {indivUser.email || t("sr_no_email")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {indivRecent && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                    <motion.span
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                      className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                      <Sparkles size={11} /> {t("sr_recently_changed")}
                    </span>
                  </div>
                )}

                <PermissionsPanel
                  permissions={indivPermissions}
                  loading={false}
                  config={PERM_CONFIG}
                  onChange={(key, val) => setIndivPermissions((prev) => ({ ...prev, [key]: val }))}
                />

                <motion.button onClick={handleIndivPermSave} disabled={indivSaving}
                  whileHover={!indivSaving ? { scale: 1.01 } : {}} whileTap={!indivSaving ? { scale: 0.98 } : {}}
                  className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 mt-1
                    ${indivSaving ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm"}`}>
                  {indivSaving ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : <><KeyRound size={15} />{t("sr_save_permissions")}</>}
                </motion.button>

                <div className="flex items-center justify-center pt-1">
                  <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                    <History size={11} />
                    {indivUpdatedAt ? `${t("sr_updated")} ${timeAgo(indivUpdatedAt)}` : t("sr_using_bulk_defaults")}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ TRANSFER MODAL ═══════════════════════════════════════════════════ */}
      <TransferModal
        open={transferModal}
        onClose={() => setTransferModal(false)}
        selectedUser={selectedUser}
        availableCredits={selectedUser?.credits}
        refreshData={async () => { await fetchData(currentPage); await refetchDashboard(); }}
      />

      {/* ══ BRAND TOAST ══════════════════════════════════════════════════════ */}
      <BrandToast toasts={toasts} />
    </div>
  );
};

export default SubresellerDashboard;