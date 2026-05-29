import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Power, X, Search, Filter, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import {
  subscibedUserinfo,
  DisableUserAccount,
  createUser,
} from "../auth/userManagement";
import { formatDate } from "../auth/utilfunction";
import { useAuth } from "../context/AuthContext";
import {
  createSubResellerUser,
  subResellerUserInfo,
  disableSubResellerUser,
} from "../auth/subReseller/userManagement";
import { useTranslation } from "react-i18next";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["", "ACTIVE", "INACTIVE"];
const SUBSCRIPTION_OPTIONS = ["", "TRIAL", "BASIC", "STANDARD", "PREMIUM"];
const DEBOUNCE_MS = 450;

// ─── Tiny debounce hook ───────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function UserManagement() {
  const { t } = useTranslation();
  const { userRole } = useAuth();

  // ── Data state ──
  const [devices, setDevices]       = useState([]);
  const [totalUser, setTotalUser]   = useState(0);
  const [activeUser, setActiveUser] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingData, setLoadingData] = useState(true);

  // ── Filter state ──
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subFilter, setSubFilter]       = useState("");
  const [showFilters, setShowFilters]   = useState(false);

  const debouncedSearch = useDebounce(search, DEBOUNCE_MS);

  // ── UI state ──
  const [showModal, setShowModal]       = useState(false);
  const [newUser, setNewUser]           = useState({ deviceId: "" });
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [copiedId, setCopiedId]         = useState(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const filterRef = useRef(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Core fetch (server-side search + filters + pagination) ───────────────
  const fetchPage = useCallback(
    async (page = 1) => {
      setLoadingData(true);
      if (debouncedSearch || statusFilter || subFilter) setIsSearchLoading(true);
      try {
        const backendPage = page - 1;
        const res =
          userRole === "SUB_RESELLER"
            ? await subResellerUserInfo(backendPage, 20, debouncedSearch, statusFilter, subFilter)
            : await subscibedUserinfo(backendPage, 20, debouncedSearch, statusFilter, subFilter);

        if (res.success) {
          const data = res.data?.content || [];
          const sorted = [...data].sort(
            (a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)
          );
          setDevices(sorted);
          setTotalUser(res.data.totalElements ?? sorted.length);
          setTotalPages(res.data.totalPages ?? 1);
          setActiveUser(sorted.filter((u) => u.deviceStatus === "ACTIVE").length);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
        setIsSearchLoading(false);
      }
    },
    [debouncedSearch, statusFilter, subFilter, userRole]
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, subFilter]);

  // Fetch when page or filters change
  useEffect(() => {
    fetchPage(currentPage);
  }, [currentPage, fetchPage]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const truncateId = (id, start = 8, end = 5) => {
    if (!id) return "";
    if (id.length <= start + end) return id;
    return `${id.slice(0, start)}...${id.slice(-end)}`;
  };

  const activeFiltersCount = [statusFilter, subFilter].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("");
    setSubFilter("");
    setShowFilters(false);
  };

  // ─── Toggle disable ───────────────────────────────────────────────────────
  const handleDisable = async () => {
    if (!selectedDevice) return;
    const deviceId = selectedDevice.deviceId;

    const response =
      userRole === "SUB_RESELLER"
        ? await disableSubResellerUser(deviceId)
        : await DisableUserAccount(deviceId);

    if (response?.success) {
      const toggle = (list) =>
        list.map((item) =>
          item.deviceId === deviceId
            ? {
                ...item,
                deviceStatus:
                  item.deviceStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
              }
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

  // ─── Add user ─────────────────────────────────────────────────────────────
  const handleAddUser = async (e) => {
    e.preventDefault();
    const macRegex =
      /^([0-9A-Fa-f]{2}([:-]?)){5}[0-9A-Fa-f]{2}$|^([0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}$/;

    if (!macRegex.test(newUser.deviceId)) {
      toast.error(t("userManagement.invalid_mac"));
      return;
    }

    setLoading(true);
    const payload = {
      deviceId: newUser.deviceId,
      deviceModel: "Generic Smart Device",
      osVersion: "1.0.0",
      platform: "UNKNOWN",
    };

    const response =
      userRole === "SUB_RESELLER"
        ? await createSubResellerUser(payload)
        : await createUser(newUser.deviceId);

    if (response?.success) {
      setShowModal(false);
      setNewUser({ deviceId: "" });
      setError("");
      fetchPage(currentPage);
    } else {
      setError(response?.message);
    }
    setLoading(false);
  };

  // ─── Sub-components ───────────────────────────────────────────────────────
  const CopyButton = ({ value }) => (
    <div className="relative inline-flex">
      <button
        onClick={() => copyToClipboard(value)}
        className="text-[10px] border border-gray-300 px-2 py-0.5 rounded hover:bg-red-50 hover:border-[#800000] hover:text-[#800000] transition text-gray-500"
      >
        {copiedId === value ? t("userManagement.copied") : t("userManagement.copy")}
      </button>
      {copiedId === value && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
          {t("userManagement.copied")}
        </span>
      )}
    </div>
  );

  const SkeletonRow = () => (
    <tr className="border-t animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-3 bg-gray-200 rounded mx-auto"
            style={{ width: i <= 1 ? "80%" : "60%" }}
          />
        </td>
      ))}
    </tr>
  );

  // ── Filter pill label helpers ──
  const statusLabel = (s) => s || t("userManagement.all_status") || "All Status";
  const subLabel    = (s) => s || t("userManagement.all_plans")  || "All Plans";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-[#f4f4f7] p-4 space-y-5">

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        {/* Title */}
        <div className="shrink-0">
          <h3 className="font-bold text-[#800000] text-lg">
            {t("userManagement.device_management")}
          </h3>
          <p className="text-gray-500 text-sm mt-0.5">
            {t("userManagement.manage_members")}
          </p>
        </div>

        {/* Search row + Filter + Create */}
        <div className="flex flex-col sm:flex-row gap-3 lg:items-center">

          {/* Search bar */}
          <div className="flex flex-1 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm min-w-0">
            <div className="relative flex-1 min-w-0">
              {isSearchLoading ? (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#800000] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              )}
              <input
                type="text"
                placeholder={t("userManagement.search_device") || "Search by Device ID or MAC…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-2.5 text-sm text-gray-700 bg-white focus:outline-none placeholder-gray-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter dropdown trigger */}
          <div className="relative shrink-0" ref={filterRef}>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition active:scale-95 whitespace-nowrap
                ${activeFiltersCount > 0
                  ? "bg-[#800000] text-white border-[#800000]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#800000] hover:text-[#800000]"
                }`}
            >
              <Filter size={14} />
              {t("userManagement.filters") || "Filters"}
              {activeFiltersCount > 0 && (
                <span className="bg-white text-[#800000] text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 z-40 bg-white border border-gray-200 rounded-2xl shadow-xl w-64 p-4 space-y-4"
                >
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {t("userManagement.filter_by") || "Filter by"}
                  </p>

                  {/* Status filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">
                      {t("userManagement.status") || "Status"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s || "all-status"}
                          onClick={() => setStatusFilter(s)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition
                            ${statusFilter === s
                              ? "bg-[#800000] text-white border-[#800000]"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#800000] hover:text-[#800000]"
                            }`}
                        >
                          {s || "All"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subscription filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">
                      {t("userManagement.subscription") || "Subscription"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUBSCRIPTION_OPTIONS.map((s) => (
                        <button
                          key={s || "all-sub"}
                          onClick={() => setSubFilter(s)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition
                            ${subFilter === s
                              ? "bg-[#800000] text-white border-[#800000]"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#800000] hover:text-[#800000]"
                            }`}
                        >
                          {s || "All"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="w-full text-xs font-bold text-[#800000] hover:underline pt-1"
                    >
                      {t("userManagement.clear_filters") || "Clear all filters"}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Create button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-[#800000] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0000] transition active:scale-95 shrink-0 whitespace-nowrap"
          >
            <UserPlus size={16} />
            {t("userManagement.create_new_device")}
          </button>
        </div>
      </div>

      {/* ── Active filter pills ── */}
      {(search || statusFilter || subFilter) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">
            {loadingData ? "Searching…" : `${totalUser} result${totalUser !== 1 ? "s" : ""}`}
          </span>

          {search && (
            <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
              "{search}"
              <button onClick={() => setSearch("")}><X size={11} /></button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
              {statusFilter}
              <button onClick={() => setStatusFilter("")}><X size={11} /></button>
            </span>
          )}
          {subFilter && (
            <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
              {subFilter}
              <button onClick={() => setSubFilter("")}><X size={11} /></button>
            </span>
          )}
          {(statusFilter || subFilter || search) && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-400 hover:text-[#800000] font-semibold transition"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* ══ STAT TILES ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* ══ DESKTOP TABLE (md+) ═══════════════════════════════════════════════ */}
      <div className="hidden md:block bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: "720px" }}>
          <colgroup>
            <col style={{ width: "17%" }} /> {/* MAC Address */}
            <col style={{ width: "20%" }} /> {/* Device ID   */}
            <col style={{ width: "11%" }} /> {/* Status      */}
            <col style={{ width: "12%" }} /> {/* Subscription*/}
            <col style={{ width: "13%" }} /> {/* Expires     */}
            <col style={{ width: "16%" }} /> {/* Registered  */}
            <col style={{ width: "11%" }} /> {/* Action      */}
          </colgroup>
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              {[
                t("userManagement.mac_address") || "MAC Address",
                t("userManagement.device_id"),
                t("userManagement.status"),
                t("userManagement.subscription"),
                t("userManagement.expires"),
                t("userManagement.registered"),
                t("userManagement.action"),
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
            {loadingData ? (
              [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            ) : devices.length > 0 ? (
              devices.map((item, idx) => (
                <tr
                  key={item.deviceId}
                  className={`text-center transition-colors duration-150 hover:bg-red-50/30 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                  }`}
                >
                  {/* MAC Address */}
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-center gap-1.5 min-w-0">
                      <span
                        className="font-mono text-xs font-semibold text-gray-700 tracking-wide truncate"
                        title={item.macAddress}
                      >
                        {item.macAddress || "—"}
                      </span>
                      {item.macAddress && (
                        <span className="shrink-0">
                          <CopyButton value={item.macAddress} />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Device ID */}
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-center gap-1.5 min-w-0">
                      <span
                        className="text-[#800000] font-semibold text-xs truncate"
                        title={item.deviceId}
                      >
                        {truncateId(item.deviceId)}
                      </span>
                      <span className="shrink-0">
                        <CopyButton value={item.deviceId} />
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                        item.deviceStatus === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.deviceStatus}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-gray-600 text-xs">
                    {item.subscriptionType}
                  </td>

                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {formatDate(item.expiresAt)}
                  </td>

                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {formatDate(item.registeredAt)}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setSelectedDevice(item);
                          setConfirmModal(true);
                        }}
                        className={`p-2 rounded-lg border transition active:scale-95 ${
                          item.deviceStatus === "INACTIVE"
                            ? "border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white"
                            : "bg-[#800000] text-white border-[#800000] hover:bg-[#6a0000]"
                        }`}
                        title={
                          item.deviceStatus === "ACTIVE"
                            ? t("userManagement.disable")
                            : t("userManagement.activate")
                        }
                      >
                        <Power size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Search size={28} className="opacity-40" />
                    <p className="font-semibold text-sm">
                      {search || statusFilter || subFilter
                        ? "No results match your filters"
                        : t("userManagement.no_user_found")}
                    </p>
                    {(search || statusFilter || subFilter) && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-[#800000] font-bold hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ══ MOBILE CARDS (< md) ══════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3">
        {loadingData ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-4 bg-white rounded-xl shadow border border-gray-200 animate-pulse space-y-2"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))
        ) : devices.length > 0 ? (
          devices.map((item) => (
            <div
              key={item.deviceId}
              className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-3"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  {/* MAC Address — primary identifier */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="font-mono text-sm font-bold text-gray-800 tracking-wide truncate"
                      title={item.macAddress}
                    >
                      {item.macAddress || "—"}
                    </span>
                    {item.macAddress && (
                      <span className="shrink-0">
                        <CopyButton value={item.macAddress} />
                      </span>
                    )}
                  </div>
                  {/* Device ID — secondary */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-xs font-semibold text-[#800000] truncate"
                      title={item.deviceId}
                    >
                      {truncateId(item.deviceId, 8, 6)}
                    </span>
                    <span className="shrink-0">
                      <CopyButton value={item.deviceId} />
                    </span>
                  </div>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-1 text-xs rounded-full font-bold ${
                    item.deviceStatus === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {item.deviceStatus}
                </span>
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <p>
                  <span className="font-medium text-gray-600">
                    {t("userManagement.plan")}:
                  </span>{" "}
                  {item.subscriptionType}
                </p>
                <p>
                  <span className="font-medium text-gray-600">
                    {t("userManagement.expires")}:
                  </span>{" "}
                  {formatDate(item.expiresAt)}
                </p>
                <p>
                  <span className="font-medium text-gray-600">
                    {t("userManagement.registered")}:
                  </span>{" "}
                  {formatDate(item.registeredAt)}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedDevice(item);
                  setConfirmModal(true);
                }}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition active:scale-95 ${
                  item.deviceStatus === "INACTIVE"
                    ? "border border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white"
                    : "bg-[#800000] text-white hover:bg-[#6a0000]"
                }`}
              >
                {t("userManagement.toggle_status")}
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
            <Search size={28} className="opacity-40" />
            <p className="font-semibold text-sm">
              {search || statusFilter || subFilter
                ? "No results match your filters"
                : t("userManagement.no_users")}
            </p>
            {(search || statusFilter || subFilter) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#800000] font-bold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ══ PAGINATION ═══════════════════════════════════════════════════════ */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 p-3 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t("userManagement.prev")}
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {t("userManagement.page")} {currentPage} {t("userManagement.of")} {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t("userManagement.next")}
          </button>
        </div>
      )}

      {/* ══ CREATE DEVICE MODAL ══════════════════════════════════════════════ */}
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
              <div className="bg-[#800000] px-6 py-4 flex items-center justify-between">
                <h5 className="text-white font-bold text-base">
                  {t("userManagement.new_device")}
                </h5>
                <button
                  onClick={() => { setShowModal(false); setError(""); }}
                  className="text-white hover:bg-white/20 p-1.5 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
                    {error}
                  </div>
                )}
                <input
                  required
                  className="w-full px-4 py-3 bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-sm font-semibold text-gray-800"
                  value={newUser.deviceId}
                  onChange={(e) => setNewUser({ deviceId: e.target.value })}
                  placeholder={t("userManagement.mac_placeholder")}
                />
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-3 bg-[#800000] text-white font-bold rounded-xl hover:bg-[#6a0000] transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-[#800000] px-6 py-4">
                <h5 className="text-white font-bold text-base">
                  {t("userManagement.confirm_action")}
                </h5>
              </div>

              <div className="p-6 text-center space-y-4">
                <p className="text-gray-700 text-sm">
                  {t("userManagement.are_you_sure")}{" "}
                  <strong className="text-[#800000]">
                    {selectedDevice?.deviceStatus === "ACTIVE"
                      ? t("userManagement.disable")
                      : t("userManagement.activate")}
                  </strong>{" "}
                  {t("userManagement.this_user")}?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmModal(false)}
                    className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition active:scale-95"
                  >
                    {t("userManagement.cancel")}
                  </button>
                  <button
                    onClick={handleDisable}
                    className="flex-1 py-2.5 bg-[#800000] text-white rounded-xl text-sm font-bold hover:bg-[#6a0000] transition active:scale-95"
                  >
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






// /*import React, { useState, useEffect, useRef, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { UserPlus, Power, X, Search, Filter, ChevronDown } from "lucide-react";
// import toast from "react-hot-toast";
// import {
//   subscibedUserinfo,
//   DisableUserAccount,
//   createUser,
// } from "../auth/userManagement";
// import { formatDate } from "../auth/utilfunction";
// import { useAuth } from "../context/AuthContext";
// import {
//   createSubResellerUser,
//   subResellerUserInfo,
//   disableSubResellerUser,
// } from "../auth/subReseller/userManagement";
// import { useTranslation } from "react-i18next";

// // ─── Constants ────────────────────────────────────────────────────────────────
// const STATUS_OPTIONS = ["", "ACTIVE", "INACTIVE"];
// const SUBSCRIPTION_OPTIONS = ["", "TRIAL", "BASIC", "STANDARD", "PREMIUM"];
// const DEBOUNCE_MS = 450;

// // ─── Tiny debounce hook ───────────────────────────────────────────────────────
// function useDebounce(value, delay) {
//   const [debounced, setDebounced] = useState(value);
//   useEffect(() => {
//     const id = setTimeout(() => setDebounced(value), delay);
//     return () => clearTimeout(id);
//   }, [value, delay]);
//   return debounced;
// }

// function UserManagement() {
//   const { t } = useTranslation();
//   const { userRole } = useAuth();

//   // ── Data state ──
//   const [devices, setDevices]       = useState([]);
//   const [totalUser, setTotalUser]   = useState(0);
//   const [activeUser, setActiveUser] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loadingData, setLoadingData] = useState(true);

//   // ── Filter state ──
//   const [search, setSearch]             = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [subFilter, setSubFilter]       = useState("");
//   const [showFilters, setShowFilters]   = useState(false);

//   const debouncedSearch = useDebounce(search, DEBOUNCE_MS);

//   // ── UI state ──
//   const [showModal, setShowModal]       = useState(false);
//   const [newUser, setNewUser]           = useState({ deviceId: "" });
//   const [error, setError]               = useState("");
//   const [loading, setLoading]           = useState(false);
//   const [confirmModal, setConfirmModal] = useState(false);
//   const [selectedDevice, setSelectedDevice] = useState(null);
//   const [copiedId, setCopiedId]         = useState(null);
//   const [isSearchLoading, setIsSearchLoading] = useState(false);

//   const filterRef = useRef(null);

//   // Close filter dropdown on outside click
//   useEffect(() => {
//     const handler = (e) => {
//       if (filterRef.current && !filterRef.current.contains(e.target)) {
//         setShowFilters(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   // ─── Core fetch (server-side search + filters + pagination) ───────────────
//   const fetchPage = useCallback(
//     async (page = 1) => {
//       setLoadingData(true);
//       if (debouncedSearch || statusFilter || subFilter) setIsSearchLoading(true);
//       try {
//         const backendPage = page - 1;
//         const res =
//           userRole === "SUB_RESELLER"
//             ? await subResellerUserInfo(backendPage, 20, debouncedSearch, statusFilter, subFilter)
//             : await subscibedUserinfo(backendPage, 20, debouncedSearch, statusFilter, subFilter);

//         if (res.success) {
//           const data = res.data?.content || [];
//           const sorted = [...data].sort(
//             (a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)
//           );
//           setDevices(sorted);
//           setTotalUser(res.data.totalElements ?? sorted.length);
//           setTotalPages(res.data.totalPages ?? 1);
//           setActiveUser(sorted.filter((u) => u.deviceStatus === "ACTIVE").length);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoadingData(false);
//         setIsSearchLoading(false);
//       }
//     },
//     [debouncedSearch, statusFilter, subFilter, userRole]
//   );

//   // Reset to page 1 when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [debouncedSearch, statusFilter, subFilter]);

//   // Fetch when page or filters change
//   useEffect(() => {
//     fetchPage(currentPage);
//   }, [currentPage, fetchPage]);

//   // ─── Helpers ─────────────────────────────────────────────────────────────
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopiedId(text);
//     setTimeout(() => setCopiedId(null), 1500);
//   };

//   const truncateId = (id, start = 8, end = 5) => {
//     if (!id) return "";
//     if (id.length <= start + end) return id;
//     return `${id.slice(0, start)}...${id.slice(-end)}`;
//   };

//   const activeFiltersCount = [statusFilter, subFilter].filter(Boolean).length;

//   const clearAllFilters = () => {
//     setSearch("");
//     setStatusFilter("");
//     setSubFilter("");
//     setShowFilters(false);
//   };

//   // ─── Toggle disable ───────────────────────────────────────────────────────
//   const handleDisable = async () => {
//     if (!selectedDevice) return;
//     const deviceId = selectedDevice.deviceId;

//     const response =
//       userRole === "SUB_RESELLER"
//         ? await disableSubResellerUser(deviceId)
//         : await DisableUserAccount(deviceId);

//     if (response?.success) {
//       const toggle = (list) =>
//         list.map((item) =>
//           item.deviceId === deviceId
//             ? {
//                 ...item,
//                 deviceStatus:
//                   item.deviceStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
//               }
//             : item
//         );
//       setDevices((prev) => {
//         const updated = toggle(prev);
//         setActiveUser(updated.filter((u) => u.deviceStatus === "ACTIVE").length);
//         return updated;
//       });
//     }

//     setConfirmModal(false);
//     setSelectedDevice(null);
//   };

//   // ─── Add user ─────────────────────────────────────────────────────────────
//   const handleAddUser = async (e) => {
//     e.preventDefault();
//     const macRegex =
//       /^([0-9A-Fa-f]{2}([:-]?)){5}[0-9A-Fa-f]{2}$|^([0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}$/;

//     if (!macRegex.test(newUser.deviceId)) {
//       toast.error(t("userManagement.invalid_mac"));
//       return;
//     }

//     setLoading(true);
//     const payload = {
//       deviceId: newUser.deviceId,
//       deviceModel: "Generic Smart Device",
//       osVersion: "1.0.0",
//       platform: "UNKNOWN",
//     };

//     const response =
//       userRole === "SUB_RESELLER"
//         ? await createSubResellerUser(payload)
//         : await createUser(newUser.deviceId);

//     if (response?.success) {
//       setShowModal(false);
//       setNewUser({ deviceId: "" });
//       setError("");
//       fetchPage(currentPage);
//     } else {
//       setError(response?.message);
//     }
//     setLoading(false);
//   };

//   // ─── Sub-components ───────────────────────────────────────────────────────
//   const CopyButton = ({ value }) => (
//     <div className="relative inline-flex">
//       <button
//         onClick={() => copyToClipboard(value)}
//         className="text-[10px] border border-gray-300 px-2 py-0.5 rounded hover:bg-red-50 hover:border-[#800000] hover:text-[#800000] transition text-gray-500"
//       >
//         {copiedId === value ? t("userManagement.copied") : t("userManagement.copy")}
//       </button>
//       {copiedId === value && (
//         <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
//           {t("userManagement.copied")}
//         </span>
//       )}
//     </div>
//   );

//   const SkeletonRow = () => (
//     <tr className="border-t animate-pulse">
//       {[...Array(7)].map((_, i) => (
//         <td key={i} className="px-4 py-3">
//           <div
//             className="h-3 bg-gray-200 rounded mx-auto"
//             style={{ width: i <= 1 ? "80%" : "60%" }}
//           />
//         </td>
//       ))}
//     </tr>
//   );

//   // ── Filter pill label helpers ──
//   const statusLabel = (s) => s || t("userManagement.all_status") || "All Status";
//   const subLabel    = (s) => s || t("userManagement.all_plans")  || "All Plans";

//   // ─── Render ───────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen w-full bg-[#f4f4f7] p-4 space-y-5">

//       {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

//         {/* Title */}
//         <div className="shrink-0">
//           <h3 className="font-bold text-[#800000] text-lg">
//             {t("userManagement.device_management")}
//           </h3>
//           <p className="text-gray-500 text-sm mt-0.5">
//             {t("userManagement.manage_members")}
//           </p>
//         </div>

//         {/* Search row + Filter + Create */}
//         <div className="flex flex-col sm:flex-row gap-3 lg:items-center">

//           {/* Search bar */}
//           <div className="flex flex-1 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm min-w-0">
//             <div className="relative flex-1 min-w-0">
//               {isSearchLoading ? (
//                 <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#800000] border-t-transparent rounded-full animate-spin" />
//               ) : (
//                 <Search
//                   size={13}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//                 />
//               )} */