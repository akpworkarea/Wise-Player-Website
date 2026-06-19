import React, { useEffect, useState, useCallback, useRef } from "react";
import { UserPlus, Pencil, Trash2, Search, X, Filter, ChevronDown,
  SlidersHorizontal, Calendar, Coins, ShieldCheck, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";
import toast from "react-hot-toast";
import { createReseller, getAllResellerInfo, updateSubReseller, deleteSubReseller } from "../auth/reSeller";
import { formatDate } from "../auth/utilfunction";
import TransferModal from "../component/TransferModal";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../context/dashboardContext";

// ─── Debounce ─────────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setD(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return d;
}

// ─── FilterSection — MODULE LEVEL ─────────────────────────────────────────────
const FilterSection = ({ icon: Icon, label, children }) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-[#800000]" />
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
    {children}
  </div>
);

// ─── FilterPanelContent — MODULE LEVEL (inputs keep focus, no remount) ─────────
const FilterPanelContent = ({
  statusFilter,   setStatusFilter,
  fromDate,       setFromDate,
  toDate,         setToDate,
  minCredits,     setMinCredits,
  maxCredits,     setMaxCredits,
  activeFilterCount,
  clearAll,
}) => {
  const STATUS_OPTS = [
    { value: "",      label: "All",      dot: "bg-gray-300"  },
    { value: "true",  label: "Active",   dot: "bg-green-500" },
    { value: "false", label: "Inactive", dot: "bg-red-500"   },
  ];
  return (
    <div className="space-y-5">

      {/* STATUS */}
      <FilterSection icon={ShieldCheck} label="Status">
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

      {/* DATE RANGE — fromDate / toDate */}
      <FilterSection icon={Calendar} label="Registered Date">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "From", value: fromDate, set: setFromDate, min: undefined },
            { label: "To",   value: toDate,   set: setToDate,   min: fromDate || undefined },
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
            <X size={10} /> Clear dates
          </button>
        )}
      </FilterSection>

      {/* CREDITS RANGE — minCredits / maxCredits */}
      <FilterSection icon={Coins} label="Credits Range">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Min", value: minCredits, set: setMinCredits, ph: "0" },
            { label: "Max", value: maxCredits, set: setMaxCredits, ph: "∞" },
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
};

// ─── CopyButton — MODULE LEVEL ─────────────────────────────────────────────────
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

// ─── StatusBadge — MODULE LEVEL ───────────────────────────────────────────────
const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
    ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-green-500" : "bg-red-500"}`} />
    {active ? "Active" : "Inactive"}
  </span>
);

// ─── SkeletonCard — MODULE LEVEL ──────────────────────────────────────────────
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

// ─── SkeletonRow — MODULE LEVEL ───────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-t animate-pulse">
    {[36, 12, 17, 10, 25].map((w, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-3 bg-gray-200 rounded mx-auto" style={{ width: `${w * 2}%` }} />
      </td>
    ))}
  </tr>
);

// ─── SubCard — MODULE LEVEL (no flicker on copy state change) ─────────────────
const SubCard = ({
  user, copiedId, onCopy, onTransfer, onEdit, onDelete,
  copyLabel, copiedLabel, truncateId,
  transferLabel, editLabel, deleteLabel, createdLabel, coinLabel,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.96 }}
    className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-3"
  >
    {/* Name + Status */}
    <div className="flex items-start justify-between gap-3">
      <span className="font-bold text-sm text-gray-800 truncate min-w-0 pr-1">{user.fullName}</span>
      <span className="shrink-0"><StatusBadge active={user.active} /></span>
    </div>

    {/* ID rows — 3-col grid for perfect copy button alignment */}
    <div className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-x-2 gap-y-2">
      <span className="text-[11px] font-semibold text-gray-500 leading-none">ID</span>
      <span className="text-[11px] font-semibold text-[#800000] truncate leading-none" title={user.id}>
        {truncateId(user.id, 8, 5)}
      </span>
      <span className="justify-self-end">
        <CopyButton value={user.id} copiedId={copiedId} onCopy={onCopy}
          copyLabel={copyLabel} copiedLabel={copiedLabel} />
      </span>

      <span className="text-[11px] font-semibold text-gray-500 leading-none">Username</span>
      <span className="text-[11px] font-semibold text-blue-600 truncate leading-none">
        {user.username}
      </span>
      <span className="justify-self-end">
        <CopyButton value={user.username} copiedId={copiedId} onCopy={onCopy}
          copyLabel={copyLabel} copiedLabel={copiedLabel} />
      </span>
    </div>

    {/* Details */}
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

    {/* Actions — Transfer | Edit | Delete */}
    <div className="flex gap-2 pt-1">
      <button onClick={() => onTransfer(user)}
        className="flex-1 py-2.5 rounded-xl bg-[#800000] text-white text-sm font-bold hover:bg-[#6a0000] transition active:scale-95">
        {transferLabel}
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

// ─── EmptyState — MODULE LEVEL ────────────────────────────────────────────────
const EmptyState = ({ hasFilters, noDataLabel, onClear }) => (
  <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
    <Search size={28} className="opacity-40" />
    <p className="font-semibold text-sm text-center">
      {hasFilters ? "No sub-resellers match your filters" : noDataLabel}
    </p>
    {hasFilters && (
      <button onClick={onClear} className="text-xs text-[#800000] font-bold hover:underline">
        Clear filters
      </button>
    )}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
const SubresellerDashboard = () => {
  const { t }                        = useTranslation();
  const { dashboard, refetchDashboard } = useDashboard();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [users,       setUsers]       = useState([]);
  const [totalPages,  setTotalPages]  = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingData, setLoadingData] = useState(true);

  // ── Search (debounced) ────────────────────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const debouncedSearch               = useDebounce(search, 450);

  // ── Filter panel ──────────────────────────────────────────────────────────
  const [showFilter,     setShowFilter]     = useState(false);
  const [statusFilter,   setStatusFilter]   = useState("");   // "true" | "false" | ""
  const [fromDate,       setFromDate]       = useState("");   // ?fromDate=
  const [toDate,         setToDate]         = useState("");   // ?toDate=
  const [minCredits,     setMinCredits]     = useState("");   // ?minCredits=
  const [maxCredits,     setMaxCredits]     = useState("");   // ?maxCredits=
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
  const [formData,      setFormData]      = useState({ username: "", password: "", fullName: "" });
  const [error,         setError]         = useState("");

  // ── Copy ──────────────────────────────────────────────────────────────────
  const [copiedId, setCopiedId] = useState(null);

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

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (page = 1) => {
    setLoadingData(true);
    try {
      const res = await getAllResellerInfo(
        page - 1, 20,
        debouncedSearch,
        statusFilter,
        fromDate, toDate,
        debouncedMin, debouncedMax,
      );
      if (res.success) {
        setUsers(res.data?.content ?? []);
        setTotalPages(res.data?.totalPages || 1);
      }
    } catch (err) {
      console.error(err); setUsers([]);
    } finally {
      setLoadingData(false);
    }
  }, [debouncedSearch, statusFilter, fromDate, toDate, debouncedMin, debouncedMax]);

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

  const clearFilters = () => {
    setStatusFilter(""); setFromDate(""); setToDate("");
    setMinCredits(""); setMaxCredits(""); setShowFilter(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createReseller(formData);
    if (res.success) {
      setOpenModel(false); setFormData({ username: "", password: "", fullName: "" }); setError("");
      setCurrentPage(1); fetchData(1); await refetchDashboard();
      toast.success("Sub-reseller created successfully");
    } else {
      setError(res.message);
      toast.error(res.message || "Failed to create sub-reseller");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const payload = { fullName: editData.fullName, email: editData.email };
    if (editData.password) payload.password = editData.password;
    const res = await updateSubReseller(editUserId, payload);
    if (res.success) {
      setEditModal(false); setError(""); fetchData(currentPage);
      toast.success("Sub-reseller updated successfully");
    } else {
      setError(res.message);
      toast.error(res.message || "Failed to update sub-reseller");
    }
  };

  const handleEditOpen = (user) => {
    setEditUserId(user.id);
    setEditData({ fullName: user.fullName || "", email: user.email || "", password: "" });
    setEditModal(true);
  };

  const handleOpenTransfer = (user) => {
    setSelectedUser({
      fullName: user.fullName,
      credits: dashboard?.stats?.creditCoin ?? 0,
      id: user.id,
      subResellerCredits: user.credits,
    });
    setTransferModal(true);
  };

  // ── Delete flow ───────────────────────────────────────────────────────────
  const handleDeleteOpen = (user) => {
    setUserToDelete(user);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    const res = await deleteSubReseller(userToDelete.id);
    setDeleting(false);

    if (res.success) {
      toast.success(`"${userToDelete.fullName}" was deleted successfully`);
      setDeleteModal(false);
      setUserToDelete(null);
      // Remove from local state immediately for snappy UX, then refetch to stay in sync
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      fetchData(currentPage);
      await refetchDashboard();
    } else {
      toast.error(res.message || "Failed to delete sub-reseller");
    }
  };

  const activeFilterCount = [statusFilter, fromDate, toDate, minCredits, maxCredits].filter(Boolean).length;
  const hasFilters        = !!(debouncedSearch || activeFilterCount);
  const showPagination    = totalPages > 1;

  const filterProps = {
    statusFilter, setStatusFilter,
    fromDate, setFromDate, toDate, setToDate,
    minCredits, setMinCredits, maxCredits, setMaxCredits,
    activeFilterCount, clearAll: clearFilters,
  };

  // Stable props for SubCard
  const cardProps = {
    copiedId, onCopy,
    onTransfer: handleOpenTransfer,
    onEdit: handleEditOpen,
    onDelete: handleDeleteOpen,
    copyLabel:     t("admin_dashboard.copy")    || "Copy",
    copiedLabel:   t("admin_dashboard.copied")  || "Copied!",
    transferLabel: t("transfer")                || "Transfer",
    editLabel:     t("edit")                    || "Edit",
    deleteLabel:   t("delete")                  || "Delete",
    createdLabel:  t("created")                 || "Created",
    coinLabel:     t("coin")                    || "Coins",
    truncateId,
  };

  const inputCls = "w-full px-4 py-3 bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-sm font-semibold text-gray-800";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-[#f4f4f7] p-4 space-y-5">

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="shrink-0">
          <h3 className="font-bold text-[#800000] text-lg">
            {t("subreseller_management")}
          </h3>
          <p className="text-gray-500 text-sm mt-0.5">
            {t("manage_subreseller") || "Search by name, username or ID"}
          </p>
        </div>

        {/* Search + Filter + Create — one row */}
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
                placeholder={t("search_placeholder") || "Search by name, username or ID…"}
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
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowFilter((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2.5 md:px-4 rounded-xl border text-sm font-semibold transition
                ${activeFilterCount > 0
                  ? "bg-[#800000] text-white border-[#800000] shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#800000] hover:text-[#800000] shadow-sm"}`}>
              <SlidersHorizontal size={14} />
              <span className="hidden md:inline">{t("filters") || "Filters"}</span>
              <AnimatePresence>
                {activeFilterCount > 0 && (
                  <motion.span key="fb" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="bg-white text-[#800000] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none shrink-0">
                    {activeFilterCount}
                  </motion.span>
                )}
              </AnimatePresence>
              <ChevronDown size={12} className={`hidden md:block transition-transform duration-200 ${showFilter ? "rotate-180" : ""}`} />
            </motion.button>

            {/* Desktop dropdown (md+) — anchored, never covers sidebar */}
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
                      <span className="text-sm font-bold text-gray-800">Filter Sub-Resellers</span>
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

          {/* Create button */}
          <button onClick={() => setOpenModel(true)}
            className="flex items-center justify-center gap-2 bg-[#800000] text-white px-3 py-2.5 md:px-5 rounded-xl text-sm font-semibold hover:bg-[#6a0000] transition active:scale-95 shrink-0 whitespace-nowrap">
            <UserPlus size={15} />
            <span className="hidden md:inline">{t("create_subreseller")}</span>
          </button>
        </div>
      </div>

      {/* ══ MOBILE BOTTOM DRAWER (< md only) ════════════════════════════════ */}
      <AnimatePresence>
        {showFilter && (
          <>
            <motion.div key="sr-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilter(false)}
              className="md:hidden fixed inset-0 bg-black/40 z-[55]" />
            <motion.div key="sr-drawer"
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
                  <span className="text-base font-bold text-gray-800">Filter Sub-Resellers</span>
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

      {/* ── Active filter + search pills ── */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">
              {loadingData ? "Searching…" : `${users.length} result${users.length !== 1 ? "s" : ""}`}
            </span>
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <Search size={10} className="shrink-0" />"{debouncedSearch}"
                <button onClick={() => setSearch("")}><X size={10} /></button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <ShieldCheck size={10} />{statusFilter === "true" ? "Active" : "Inactive"}
                <button onClick={() => setStatusFilter("")}><X size={10} /></button>
              </span>
            )}
            {(fromDate || toDate) && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <Calendar size={10} />
                {fromDate && toDate ? `${fromDate} → ${toDate}` : fromDate ? `From ${fromDate}` : `To ${toDate}`}
                <button onClick={() => { setFromDate(""); setToDate(""); }}><X size={10} /></button>
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

      {/* ══ DESKTOP TABLE (lg+) ══════════════════════════════════════════════ */}
      <div className="hidden lg:block bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: "33%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "9%"  }} />
            <col style={{ width: "32%" }} />
          </colgroup>
          <thead>
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

                  {/* User details */}
                  <td className="px-4 py-3.5 text-left">
                    <div className="font-bold text-gray-800 text-sm truncate mb-1">{user.fullName}</div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="text-[11px] text-gray-400 font-medium">Username:</span>
                      <span className="text-[11px] text-blue-600 font-semibold">{user.username}</span>
                      <CopyButton value={user.username} copiedId={copiedId} onCopy={onCopy}
                        copyLabel={t("admin_dashboard.copy")||"Copy"} copiedLabel={t("admin_dashboard.copied")||"Copied!"} />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-gray-400 font-medium">ID:</span>
                      <span className="text-[11px] text-[#800000] font-semibold cursor-default" title={user.id}>
                        {truncateId(user.id)}
                      </span>
                      <CopyButton value={user.id} copiedId={copiedId} onCopy={onCopy}
                        copyLabel={t("admin_dashboard.copy")||"Copy"} copiedLabel={t("admin_dashboard.copied")||"Copied!"} />
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-center"><StatusBadge active={user.active} /></td>
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
                  <EmptyState hasFilters={hasFilters} noDataLabel={t("no_data") || "No sub-resellers found"} onClear={() => { setSearch(""); clearFilters(); }} />
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
        ) : users.length > 0 ? (
          <AnimatePresence>
            {users.map((user) => <SubCard key={user.id} user={user} {...cardProps} />)}
          </AnimatePresence>
        ) : (
          <div className="col-span-2">
            <EmptyState hasFilters={hasFilters} noDataLabel={t("no_data") || "No sub-resellers found"} onClear={() => { setSearch(""); clearFilters(); }} />
          </div>
        )}
      </div>

      {/* ══ MOBILE CARDS (< md) — single column ═════════════════════════════ */}
      <div className="md:hidden space-y-3">
        {loadingData ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : users.length > 0 ? (
          <AnimatePresence>
            {users.map((user) => <SubCard key={user.id} user={user} {...cardProps} />)}
          </AnimatePresence>
        ) : (
          <EmptyState hasFilters={hasFilters} noDataLabel={t("no_data") || "No sub-resellers found"} onClear={() => { setSearch(""); clearFilters(); }} />
        )}
      </div>

      {/* ══ PAGINATION ═══════════════════════════════════════════════════════ */}
      {showPagination && (
        <div className="flex justify-center items-center gap-3 p-3 flex-wrap">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
            {t("transaction.prev") || "Prev"}
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {t("transaction.page") || "Page"} {currentPage} {t("transaction.of") || "of"} {totalPages}
          </span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
            {t("transaction.next") || "Next"}
          </button>
        </div>
      )}

      {/* ══ CREATE MODAL ═════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {openModel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 md:pl-[240px] lg:pl-[260px]">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-[#800000] px-6 py-4 flex items-center justify-between">
                <h5 className="text-white font-bold text-base">{t("create_subreseller")}</h5>
                <button onClick={() => { setOpenModel(false); setError(""); }}
                  className="text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <MdClose size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-3">
                {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}
                <input className={inputCls} placeholder={t("username")}
                  value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                <input className={inputCls} type="password" placeholder={t("password")}
                  value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                <input className={inputCls} placeholder={t("full_name")}
                  value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                <button type="submit"
                  className="w-full py-3 bg-[#800000] text-white font-bold rounded-xl hover:bg-[#6a0000] transition active:scale-95 mt-1">
                  {t("submit")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ EDIT MODAL ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 md:pl-[240px] lg:pl-[260px]">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-[#800000] px-6 py-4 flex items-center justify-between">
                <h5 className="text-white font-bold text-base">{t("update")}</h5>
                <button onClick={() => { setEditModal(false); setError(""); }}
                  className="text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <MdClose size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-3">
                {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}
                <input className={inputCls} placeholder={t("full_name")}
                  value={editData.fullName} onChange={(e) => setEditData({ ...editData, fullName: e.target.value })} />
                <input className={inputCls} type="password" placeholder={t("password")}
                  value={editData.password} onChange={(e) => setEditData({ ...editData, password: e.target.value })} />
                <button type="submit"
                  className="w-full py-3 bg-[#800000] text-white font-bold rounded-xl hover:bg-[#6a0000] transition active:scale-95 mt-1">
                  {t("update")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ DELETE CONFIRMATION MODAL ════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteModal && userToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 md:pl-[240px] lg:pl-[260px]">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

              {/* Maroon header with warning icon */}
              <div className="bg-[#800000] px-6 pt-6 pb-5 flex flex-col items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <AlertTriangle size={22} className="text-white" />
                </motion.div>
                <h5 className="text-base font-extrabold text-white text-center">
                  Delete Sub-Reseller
                </h5>
              </div>

              {/* Body */}
              <div className="px-6 pt-5 pb-6 flex flex-col items-center gap-5">
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-[#800000]">{userToDelete.fullName}</span>
                  ? This action cannot be undone and will permanently remove their account.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => { setDeleteModal(false); setUserToDelete(null); }}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition active:scale-95 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        Delete
                      </>
                    )}
                  </button>
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
    </div>
  );
};

export default SubresellerDashboard;