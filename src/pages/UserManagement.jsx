import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Power, X, Search } from "lucide-react";
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

function UserManagement() {
  const { t } = useTranslation();
  const { userRole } = useAuth();

  const [totalPages, setTotalPages] = useState(1);
  const [devices, setDevices] = useState([]);
  const [allDevices, setAllDevices] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ deviceId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalUser, setTotalUser] = useState(0);
  const [activeUser, setActiveUser] = useState(0);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Paginated fetch ──
  const fetchDashboard = async (page = currentPage) => {
    setLoadingData(true);
    try {
      const backendPage = page - 1;
      const res = userRole === "SUB_RESELLER"
        ? await subResellerUserInfo(backendPage)
        : await subscibedUserinfo(backendPage);

      if (res.success) {
        const data = res.data?.content || [];
        // Stable sort by registeredAt so order never changes on refetch
        const sorted = [...data].sort(
          (a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)
        );
        setDevices(sorted);
        setTotalUser(res.data.totalElements);
        setTotalPages(res.data.totalPages);
        setActiveUser(sorted.filter((u) => u.deviceStatus === "ACTIVE").length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  // ── Fetch ALL for search ──
  const fetchAllForSearch = async () => {
    setIsSearchLoading(true);
    try {
      const res = userRole === "SUB_RESELLER"
        ? await subResellerUserInfo(0, 1000)
        : await subscibedUserinfo(0, 1000);

      if (res.success) {
        const data = res.data?.content || [];
        const sorted = [...data].sort(
          (a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)
        );
        setAllDevices(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchLoading(false);
    }
  };

  // On mount
  useEffect(() => {
    fetchDashboard(1);
    fetchAllForSearch();
  }, []);

  // Page change
  useEffect(() => {
    fetchDashboard(currentPage);
  }, [currentPage]);

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Search uses allDevices; normal view uses paginated devices
  const filteredDevices = search.trim()
    ? allDevices.filter((item) =>
        item.deviceId.toLowerCase().includes(search.toLowerCase())
      )
    : devices;

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

  // ── Toggle disable — update in-place, no re-sort ──
  const handleDisable = async () => {
    if (!selectedDevice) return;
    const deviceId = selectedDevice.deviceId;

    const response = userRole === "SUB_RESELLER"
      ? await disableSubResellerUser(deviceId)
      : await DisableUserAccount(deviceId);

    if (response?.success) {
      // Update devices in-place — row stays in same position
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
      setAllDevices((prev) => toggle(prev));
    }

    setConfirmModal(false);
    setSelectedDevice(null);
  };

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

    const response = userRole === "SUB_RESELLER"
      ? await createSubResellerUser(payload)
      : await createUser(newUser.deviceId);

    if (response?.success) {
      setShowModal(false);
      setNewUser({ deviceId: "" });
      setError("");
      fetchDashboard(currentPage);
      fetchAllForSearch();
    } else {
      setError(response?.message);
    }
    setLoading(false);
  };

  // ── Reusable copy button — same pattern across all components ──
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

  // Skeleton row
  const SkeletonRow = () => (
    <tr className="border-t animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-gray-200 rounded mx-auto" style={{ width: i === 0 ? "80%" : "60%" }} />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="min-h-screen w-full bg-[#f4f4f7] p-4 space-y-5">

      {/* ── HEADER ── */}
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

        {/* Search + Create */}
        <div className="flex flex-col sm:flex-row gap-3 lg:items-center">

          {/* Search bar */}
          <div className="flex flex-1 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm min-w-0">
            <div className="relative flex-1 min-w-0">
              {isSearchLoading
                ? <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#800000] border-t-transparent rounded-full animate-spin" />
                : <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              }
              <input
                type="text"
                placeholder={t("userManagement.search_device")}
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

      {/* Active filter pill */}
      {search && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {filteredDevices.length} result{filteredDevices.length !== 1 ? "s" : ""} for
          </span>
          <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
            "{search}"
            <button onClick={() => setSearch("")}><X size={11} /></button>
          </span>
        </div>
      )}

      {/* ── STAT TILES — match dashboard stat card style ── */}
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

      {/* ════════════════════════════════════════════
          DESKTOP + TABLET TABLE  (md+)
          table-fixed + colgroup = zero horizontal scroll
          from 768px to 1920px
      ════════════════════════════════════════════ */}
      <div className="hidden md:block bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: "28%" }} /> {/* Device ID */}
            <col style={{ width: "12%" }} /> {/* Status */}
            <col style={{ width: "15%" }} /> {/* Subscription */}
            <col style={{ width: "15%" }} /> {/* Expires */}
            <col style={{ width: "18%" }} /> {/* Registered */}
            <col style={{ width: "12%" }} /> {/* Action */}
          </colgroup>

          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              {[
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
            ) : filteredDevices.length > 0 ? (
              filteredDevices.map((item, idx) => (
                <tr
                  key={item.deviceId}
                  className={`text-center transition-colors duration-150 hover:bg-red-50/30 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                  }`}
                >
                  {/* Device ID + copy */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span
                        className="text-[#800000] font-semibold cursor-default"
                        title={item.deviceId}
                      >
                        {truncateId(item.deviceId)}
                      </span>
                      <CopyButton value={item.deviceId} />
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                      item.deviceStatus === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}>
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

                  {/* Toggle action */}
                  <td className="px-4 py-3.5">
                    <div className="flex justify-center">
                      <button
                        onClick={() => { setSelectedDevice(item); setConfirmModal(true); }}
                        className={`p-2 rounded-lg border transition active:scale-95 ${
                          item.deviceStatus === "INACTIVE"
                            ? "border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white"
                            : "bg-[#800000] text-white border-[#800000] hover:bg-[#6a0000]"
                        }`}
                        title={item.deviceStatus === "ACTIVE"
                          ? t("userManagement.disable")
                          : t("userManagement.activate")}
                      >
                        <Power size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Search size={28} className="opacity-40" />
                    <p className="font-semibold text-sm">
                      {search ? `No results for "${search}"` : t("userManagement.no_user_found")}
                    </p>
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="text-xs text-[#800000] font-bold hover:underline"
                      >
                        Clear search
                      </button>
                    )}
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
        {loadingData ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-white rounded-xl shadow border border-gray-200 animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))
        ) : filteredDevices.length > 0 ? (
          filteredDevices.map((item) => (
            <div
              key={item.deviceId}
              className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-3"
            >
              {/* Top: ID + copy + status */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-sm font-semibold text-[#800000]"
                    title={item.deviceId}
                  >
                    {truncateId(item.deviceId, 6, 4)}
                  </span>
                  <CopyButton value={item.deviceId} />
                </div>
                <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                  item.deviceStatus === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}>
                  {item.deviceStatus}
                </span>
              </div>

              {/* Details */}
              <div className="text-sm text-gray-500 space-y-1">
                <p>
                  <span className="font-medium text-gray-600">{t("userManagement.plan")}:</span>{" "}
                  {item.subscriptionType}
                </p>
                <p>
                  <span className="font-medium text-gray-600">{t("userManagement.expires")}:</span>{" "}
                  {formatDate(item.expiresAt)}
                </p>
                <p>
                  <span className="font-medium text-gray-600">{t("userManagement.registered")}:</span>{" "}
                  {formatDate(item.registeredAt)}
                </p>
              </div>

              {/* Toggle button */}
              <button
                onClick={() => { setSelectedDevice(item); setConfirmModal(true); }}
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
              {search ? `No results for "${search}"` : t("userManagement.no_users")}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-[#800000] font-bold hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── PAGINATION — hidden during search ── */}
      {totalPages > 1 && !search && (
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

      {/* ── CREATE DEVICE MODAL ── */}
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

      {/* ── CONFIRM TOGGLE MODAL ── */}
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