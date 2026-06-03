import React, { useEffect, useState, useCallback, useRef } from "react";
import { TransitionHistoryData } from "../auth/transitionHistory";
import { useAuth } from "../context/AuthContext";
import { subResellerTransactionHistory } from "../auth/subReseller/transitionHistory";
import { useRefresh } from "../context/RefreshContext";
import { useTranslation } from "react-i18next";
import {
  Search, X, Receipt, Filter, ChevronDown,
  Calendar, Euro, Tag, SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Type options ──────────────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  { value: "",                  label: "All Types",    dot: "bg-gray-300"   },
  { value: "PURCHASE",          label: "Purchase",     dot: "bg-green-500"  },
  { value: "DEDUCTION",         label: "Deduction",    dot: "bg-orange-500" },
  { value: "REFUND",            label: "Refund",       dot: "bg-blue-500"   },
  { value: "TRANSFER_IN",       label: "Transfer In",  dot: "bg-teal-500"   },
  { value: "TRANSFER_OUT",      label: "Transfer Out", dot: "bg-purple-500" },
  { value: "MANUAL_ADJUSTMENT", label: "Manual Adj.",  dot: "bg-gray-400"   },
];

const TYPE_STYLE = {
  PURCHASE:          { pill: "bg-green-100  text-green-700",  dot: "bg-green-500"  },
  DEDUCTION:         { pill: "bg-orange-100 text-orange-600", dot: "bg-orange-500" },
  REFUND:            { pill: "bg-blue-100   text-blue-600",   dot: "bg-blue-500"   },
  TRANSFER_IN:       { pill: "bg-teal-100   text-teal-600",   dot: "bg-teal-500"   },
  TRANSFER_OUT:      { pill: "bg-purple-100 text-purple-600", dot: "bg-purple-500" },
  MANUAL_ADJUSTMENT: { pill: "bg-gray-100   text-gray-600",   dot: "bg-gray-400"   },
};
const typeStyle    = (k) => TYPE_STYLE[k] || { pill: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };
const amountClass  = (v) => (v >= 0 ? "text-green-700" : "text-[#800000]");
const formatAmount = (v) => { const a = Math.abs(v).toFixed(2); return v >= 0 ? `+€${a}` : `-€${a}`; };

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setD(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return d;
}

// ─── FilterSection label ──────────────────────────────────────────────────────
const FilterSection = ({ icon: Icon, label, children }) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-[#800000]" />
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
    {children}
  </div>
);

// ─── FilterPanelContent — MODULE LEVEL (never remounts, inputs keep focus) ────
const FilterPanelContent = ({
  typeFilter,  setTypeFilter,
  dateFrom,    setDateFrom,
  dateTo,      setDateTo,
  amountMin,   setAmountMin,
  amountMax,   setAmountMax,
  activeFilterCount,
  clearAll,
}) => (
  <div className="space-y-5">

    {/* ── TYPE ── */}
    <FilterSection icon={Tag} label="Transaction Type">
      <div className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((opt) => {
          const isActive = typeFilter === opt.value;
          return (
            <button
              key={opt.value || "all"}
              onClick={() => setTypeFilter(opt.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition active:scale-95
                ${isActive
                  ? "bg-[#800000] text-white border-[#800000]"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#800000] hover:text-[#800000]"
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-white" : opt.dot}`} />
              {opt.label}
            </button>
          );
        })}
      </div>
    </FilterSection>

    {/* ── DATE RANGE — fromDate / toDate as dedicated API params ── */}
    <FilterSection icon={Calendar} label="Date Range">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-full px-3 py-2.5 text-xs bg-[#f4f4f7] border border-gray-200 rounded-xl
                       focus:border-[#800000] focus:outline-none transition text-gray-700 font-semibold
                       cursor-pointer"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">To</label>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-full px-3 py-2.5 text-xs bg-[#f4f4f7] border border-gray-200 rounded-xl
                       focus:border-[#800000] focus:outline-none transition text-gray-700 font-semibold
                       cursor-pointer"
          />
        </div>
      </div>
      {(dateFrom || dateTo) && (
        <button
          onClick={() => { setDateFrom(""); setDateTo(""); }}
          className="text-[10px] text-gray-400 hover:text-[#800000] font-semibold transition flex items-center gap-1 mt-1"
        >
          <X size={10} /> Clear dates
        </button>
      )}
    </FilterSection>

    {/* ── AMOUNT RANGE — minAmount / maxAmount as dedicated API params ── */}
    <FilterSection icon={Euro} label="Amount Range (€)">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">Min</label>
          <input
            type="number"
            placeholder="0.00"
            value={amountMin}
            min="0"
            step="0.01"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onChange={(e) => setAmountMin(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-[#f4f4f7] border border-gray-200 rounded-xl
                       focus:border-[#800000] focus:outline-none transition text-gray-700 font-semibold
                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                       [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">Max</label>
          <input
            type="number"
            placeholder="∞"
            value={amountMax}
            min={amountMin || "0"}
            step="0.01"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onChange={(e) => setAmountMax(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-[#f4f4f7] border border-gray-200 rounded-xl
                       focus:border-[#800000] focus:outline-none transition text-gray-700 font-semibold
                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                       [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
      {(amountMin || amountMax) && (
        <button
          onClick={() => { setAmountMin(""); setAmountMax(""); }}
          className="text-[10px] text-gray-400 hover:text-[#800000] font-semibold transition flex items-center gap-1 mt-1"
        >
          <X size={10} /> Clear amount
        </button>
      )}
    </FilterSection>

    {/* ── Clear all ── */}
    {activeFilterCount > 0 && (
      <div className="pt-3 border-t border-gray-100">
        <button
          onClick={clearAll}
          className="w-full py-2 text-xs font-bold text-[#800000] hover:bg-red-50 rounded-xl transition"
        >
          Clear all filters
        </button>
      </div>
    )}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
function TransitionHistory() {
  const { t }                   = useTranslation();
  const { userRole }            = useAuth();
  const { refreshTransactions } = useRefresh();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [data,        setData]        = useState([]);
  const [totalPages,  setTotalPages]  = useState(0);
  const [page,        setPage]        = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // ── Free-text search (debounced) — maps to ?search= ──────────────────────
  const [search,      setSearch]      = useState("");
  const debouncedSearch               = useDebounce(search, 450);

  // ── Dedicated filter params ───────────────────────────────────────────────
  const [showFilter,  setShowFilter]  = useState(false);
  const [typeFilter,  setTypeFilter]  = useState("");   // ?type=
  const [dateFrom,    setDateFrom]    = useState("");   // ?fromDate=
  const [dateTo,      setDateTo]      = useState("");   // ?toDate=
  const [amountMin,   setAmountMin]   = useState("");   // ?minAmount=
  const [amountMax,   setAmountMax]   = useState("");   // ?maxAmount=

  // Debounce amount inputs so API isn't called on every keystroke
  const debouncedMin = useDebounce(amountMin, 500);
  const debouncedMax = useDebounce(amountMax, 500);

  // ── Copy ──────────────────────────────────────────────────────────────────
  const [copiedId, setCopiedId] = useState(null);
  const desktopFilterRef        = useRef(null);

  // ── Close desktop dropdown on outside click ───────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (desktopFilterRef.current && !desktopFilterRef.current.contains(e.target))
        setShowFilter(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch — all params sent as separate query params ──────────────────────
  const fetchData = useCallback(
    async (pageNo = 0) => {
      setLoading(true);
      setIsSearching(true);
      try {
        const res = userRole === "SUB_RESELLER"
          ? await subResellerTransactionHistory(
              pageNo, 20,
              debouncedSearch, typeFilter,
              dateFrom, dateTo,
              debouncedMin, debouncedMax,
            )
          : await TransitionHistoryData(
              pageNo, 20,
              debouncedSearch, typeFilter,
              dateFrom, dateTo,
              debouncedMin, debouncedMax,
            );

        if (!res?.success) return;
        setData(res.data?.content || []);
        setTotalPages(res.data?.totalPages || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [debouncedSearch, typeFilter, dateFrom, dateTo, debouncedMin, debouncedMax, userRole]
  );

  // Reset to page 0 when any filter changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, typeFilter, dateFrom, dateTo, debouncedMin, debouncedMax]);

  useEffect(() => { fetchData(page); }, [page, fetchData, refreshTransactions]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const copy = (id) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const clearAll = () => {
    setSearch(""); setTypeFilter("");
    setDateFrom(""); setDateTo("");
    setAmountMin(""); setAmountMax("");
    setShowFilter(false);
  };

  const activeFilterCount = [typeFilter, dateFrom, dateTo, amountMin, amountMax].filter(Boolean).length;
  const hasFilters        = !!(debouncedSearch || activeFilterCount);
  const showPagination    = totalPages > 1;
  const typeLabel         = TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label || "All Types";

  // Shared props passed into FilterPanelContent
  const filterProps = {
    typeFilter,  setTypeFilter,
    dateFrom,    setDateFrom,
    dateTo,      setDateTo,
    amountMin,   setAmountMin,
    amountMax,   setAmountMax,
    activeFilterCount,
    clearAll,
  };

  // ── CopyButton ────────────────────────────────────────────────────────────
  const CopyButton = ({ id }) => (
    <div className="relative inline-flex items-center shrink-0">
      <button
        onClick={() => copy(id)}
        className="text-[10px] border border-gray-300 px-2 py-0.5 rounded hover:bg-red-50 hover:border-[#800000] hover:text-[#800000] transition text-gray-500 whitespace-nowrap"
      >
        {copiedId === id ? t("admin_dashboard.copied") || "Copied!" : t("admin_dashboard.copy") || "Copy"}
      </button>
      {copiedId === id && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
          {t("admin_dashboard.copied") || "Copied!"}
        </span>
      )}
    </div>
  );

  // ── Skeletons ─────────────────────────────────────────────────────────────
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-4 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-4 bg-gray-200 rounded w-2/5" />
        <div className="h-4 bg-gray-200 rounded w-12" />
      </div>
      <div className="flex justify-between">
        <div className="h-6 bg-gray-200 rounded-full w-28" />
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
      <div className="pt-3 border-t border-gray-100 space-y-1.5">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );

  const SkeletonRow = () => (
    <tr className="border-t animate-pulse">
      {[35, 12, 20, 20, 13].map((w, i) => (
        <td key={i} className="px-3 py-4">
          <div className="h-3 bg-gray-200 rounded mx-auto" style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4f4f7] w-full p-4 sm:p-6 space-y-5">

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div className="shrink-0">
          <h2 className="text-lg font-bold text-[#800000]">
            {t("transaction.transaction_history") || "Transaction History"}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {t("transaction.subtitle") || "Search by Transaction ID · filter by type, date or amount"}
          </p>
        </div>

        {/* Search + Filter row */}
        <div className="flex gap-3 items-center">

          {/* Transaction ID search → ?search= (API matches on ID partial) */}
          <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm flex-1 min-w-0 lg:max-w-sm">
            <div className="relative flex-1 min-w-0">
              {isSearching ? (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#800000] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              )}
              <input
                type="text"
                placeholder={t("transaction.search_placeholder") || "Search by Transaction ID…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-2.5 text-sm text-gray-700 bg-white focus:outline-none placeholder-gray-400 font-mono"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter button */}
          <div className="relative shrink-0" ref={desktopFilterRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilter((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition whitespace-nowrap
                ${activeFilterCount > 0
                  ? "bg-[#800000] text-white border-[#800000] shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#800000] hover:text-[#800000] shadow-sm"
                }`}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">{t("transaction.filters") || "Filters"}</span>
              <AnimatePresence>
                {activeFilterCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="bg-white text-[#800000] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none shrink-0"
                  >
                    {activeFilterCount}
                  </motion.span>
                )}
              </AnimatePresence>
              <ChevronDown size={13} className={`transition-transform duration-200 ${showFilter ? "rotate-180" : ""}`} />
            </motion.button>

            {/* Desktop dropdown (md+) */}
            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="hidden md:block absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl w-80 p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Filter size={14} className="text-[#800000]" />
                      <span className="text-sm font-bold text-gray-800">Filter Transactions</span>
                    </div>
                    <button onClick={() => setShowFilter(false)} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100">
                      <X size={14} />
                    </button>
                  </div>
                  <FilterPanelContent {...filterProps} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ══ MOBILE BOTTOM DRAWER (< md) ══════════════════════════════════════ */}
      <AnimatePresence>
        {showFilter && (
          <>
            <motion.div
              key="mob-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilter(false)}
              className="md:hidden fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              key="mob-drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col"
            >
              <div className="pt-3 pb-1 flex justify-center shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <Filter size={15} className="text-[#800000]" />
                  <span className="text-base font-bold text-gray-800">Filter Transactions</span>
                </div>
                <button onClick={() => setShowFilter(false)} className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-xl hover:bg-gray-100">
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

      {/* ── Active filter pills ── */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-xs text-gray-500 font-medium">
              {loading ? "Searching…" : `${data.length} result${data.length !== 1 ? "s" : ""}`}
            </span>

            {/* transaction ID search pill */}
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full font-mono">
                <Search size={10} className="shrink-0 font-sans" />
                ID: {debouncedSearch}
                <button onClick={() => setSearch("")}><X size={10} /></button>
              </span>
            )}
            {/* type pill */}
            {typeFilter && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <Tag size={10} />{typeLabel}
                <button onClick={() => setTypeFilter("")}><X size={10} /></button>
              </span>
            )}
            {/* date range pill */}
            {(dateFrom || dateTo) && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <Calendar size={10} />
                {dateFrom && dateTo ? `${dateFrom} → ${dateTo}` : dateFrom ? `From ${dateFrom}` : `To ${dateTo}`}
                <button onClick={() => { setDateFrom(""); setDateTo(""); }}><X size={10} /></button>
              </span>
            )}
            {/* amount range pill */}
            {(amountMin || amountMax) && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
                <Euro size={10} />
                {amountMin && amountMax ? `€${amountMin} – €${amountMax}` : amountMin ? `Min €${amountMin}` : `Max €${amountMax}`}
                <button onClick={() => { setAmountMin(""); setAmountMax(""); }}><X size={10} /></button>
              </span>
            )}
            {/* clear all — show when 2+ active */}
            {(activeFilterCount + (debouncedSearch ? 1 : 0)) > 1 && (
              <button onClick={clearAll} className="text-xs text-gray-400 hover:text-[#800000] font-semibold transition">
                Clear all
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ MOBILE CARDS (< md) ══════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : data.length > 0 ? (
          data.map((item) => {
            const ts = typeStyle(item.type);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow border border-gray-200 p-4 overflow-hidden"
              >
                {/* ID + copy */}
                <div className="flex items-center gap-2 min-w-0 mb-2.5">
                  <span className="text-xs font-bold text-[#800000] truncate min-w-0" title={String(item.id)}>
                    #{item.id}
                  </span>
                  <CopyButton id={item.id} />
                </div>
                {/* Type + Amount */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${ts.pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${ts.dot}`} />
                    {item.type.replace(/_/g, " ")}
                  </span>
                  <p className={`text-xl font-black shrink-0 ${amountClass(item.amount)}`}>
                    {formatAmount(item.amount)}
                  </p>
                </div>
                {/* Notes + Date */}
                <div className="pt-3 border-t border-gray-100 space-y-1">
                  <p className="text-sm text-gray-700 font-semibold truncate w-full" title={item.notes}>
                    {item.notes || "—"}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2 py-14 text-gray-400">
            <Receipt size={32} className="opacity-30" />
            <p className="font-semibold text-sm text-center">
              {hasFilters ? "No transactions match your filters" : t("transaction.no_data_found") || "No transactions found"}
            </p>
            {hasFilters && (
              <button onClick={clearAll} className="text-xs text-[#800000] font-bold hover:underline">Clear filters</button>
            )}
          </motion.div>
        )}
      </div>

      {/* ══ TABLET + DESKTOP TABLE (md+) ═════════════════════════════════════ */}
      <div className="hidden md:block bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: "660px" }}>
          <colgroup>
            <col style={{ width: "30%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              {[
                t("transaction.id")     || "Transaction ID",
                t("transaction.amount") || "Amount",
                t("transaction.type")   || "Type",
                t("transaction.notes")  || "Notes",
                t("transaction.date")   || "Date",
              ].map((col) => (
                <th key={col} className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            ) : data.length > 0 ? (
              data.map((item, idx) => {
                const ts = typeStyle(item.type);
                return (
                  <tr
                    key={item.id}
                    className={`text-center transition-colors duration-150 hover:bg-red-50/30 ${idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"}`}
                  >
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-center gap-1.5 min-w-0">
                        <span className="font-semibold text-[#800000] text-xs truncate min-w-0" title={String(item.id)}>
                          {item.id}
                        </span>
                        <span className="shrink-0"><CopyButton id={item.id} /></span>
                      </div>
                    </td>
                    <td className={`px-3 py-3.5 font-black text-sm ${amountClass(item.amount)}`}>
                      {formatAmount(item.amount)}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 justify-center px-3 py-1 rounded-full text-xs font-bold ${ts.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ts.dot}`} />
                        {item.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-left max-w-0">
                      <span className="block text-xs font-semibold text-gray-700 truncate w-full" title={item.notes}>
                        {item.notes || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="block text-xs text-gray-500 truncate w-full">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Receipt size={28} className="opacity-30" />
                    <p className="font-semibold text-sm">
                      {hasFilters ? "No transactions match your filters" : t("transaction.no_data_found") || "No transactions found"}
                    </p>
                    {hasFilters && (
                      <button onClick={clearAll} className="text-xs text-[#800000] font-bold hover:underline">Clear filters</button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ══ PAGINATION ═══════════════════════════════════════════════════════ */}
      {showPagination && (
        <div className="flex justify-center items-center gap-3 pt-2 flex-wrap">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
            {t("transaction.prev") || "Prev"}
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {t("transaction.page") || "Page"} {page + 1} {t("transaction.of") || "of"} {totalPages}
          </span>
          <button disabled={page + 1 === totalPages} onClick={() => setPage((p) => p + 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
            {t("transaction.next") || "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

export default TransitionHistory;