import React, { useEffect, useState } from "react";
import { UserPlus, Pencil, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";
import {
  createReseller,
  getAllResellerInfo,
  updateSubReseller,
} from "../auth/reSeller";
import { formatDate } from "../auth/utilfunction";
import TransferModal from "../component/TransferModal";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../context/dashboardContext";

const SubresellerDashboard = () => {
  const { t } = useTranslation();
  const { dashboard, refetchDashboard } = useDashboard();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openModel, setOpenModel] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editData, setEditData] = useState({ fullName: "", email: "", password: "" });
  const [formData, setFormData] = useState({ username: "", password: "", fullName: "" });
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");

  // ── Fetch — clean replace per page (no merge needed, backend is stable) ──
  const fetchdata = async (page = currentPage) => {
    try {
      const res = await getAllResellerInfo(page - 1);
      const incoming = res?.data?.content ?? [];
      setTotalPages(res?.data?.totalPages || 1);
      // Simple replace — each page is its own dataset
      setUsers(Array.isArray(incoming) ? incoming : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  // Fetch when page changes
  useEffect(() => {
    fetchdata(currentPage);
  }, [currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchField]);
  // ── Client-side search ──
  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (searchField === "name") return user.fullName?.toLowerCase().includes(q);
    if (searchField === "username") return user.username?.toLowerCase().includes(q);
    if (searchField === "id") return user.id?.toLowerCase().includes(q);
    if (searchField === "status") return (user.active ? "active" : "inactive").includes(q);
    return (
      user.fullName?.toLowerCase().includes(q) ||
      user.username?.toLowerCase().includes(q) ||
      user.id?.toLowerCase().includes(q)
    );
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createReseller(formData);
    if (res.success) {
      setOpenModel(false);
      setFormData({ username: "", password: "", fullName: "" });
      setError("");
      setCurrentPage(1);          // go back to page 1
      fetchdata(1);               // fetch page 1 fresh
      await refetchDashboard();
    } else {
      setError(res.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const payload = { fullName: editData.fullName, email: editData.email };
    if (editData.password) payload.password = editData.password;
    const res = await updateSubReseller(editUserId, payload);
    if (res.success) {
      setEditModal(false);
      setError("");
      fetchdata(currentPage);     // refresh current page in-place
    } else {
      setError(res.message);
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

  const getStatusBadge = (active) => (
    <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
      }`}>
      {active ? t("active") : t("inactive")}
    </span>
  );

  const CopyButton = ({ value }) => (
    <div className="relative inline-flex">
      <button
        onClick={() => copyToClipboard(value)}
        className="text-[10px] border border-gray-300 px-2 py-0.5 rounded hover:bg-red-50 hover:border-[#800000] hover:text-[#800000] transition text-gray-500"
      >
        {copiedId === value ? t("admin_dashboard.copied") : t("admin_dashboard.copy")}
      </button>
      {copiedId === value && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
          {t("admin_dashboard.copied")}
        </span>
      )}
    </div>
  );

  const inputCls = "w-full px-4 py-3 bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-sm font-semibold text-gray-800";

  const searchFields = [
    { value: "all", label: t("all") || "All" },
    { value: "name", label: t("name") || "Name" },
    { value: "username", label: t("username") || "Username" },
    { value: "id", label: t("id_label") || "ID" },
    { value: "status", label: t("status") || "Status" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f4f4f7] p-4 space-y-5">

      {/* ══════════════════════════════════════════════
          HEADER: title LEFT  |  search + button RIGHT
      ══════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        {/* Title — left */}
        <div className="shrink-0">
          <h3 className="font-bold text-[#800000] text-lg">
            {t("subreseller_management")}
          </h3>
          <p className="text-gray-500 text-sm mt-0.5">
            {t("manage_subreseller")}
          </p>
        </div>

        {/* Search + Create — right */}
        <div className="flex flex-col sm:flex-row gap-3 lg:items-center">

          {/* Search bar — select + input as one pill */}
          <div className="flex flex-1 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm min-w-0">

            {/* Custom styled select with maroon chevron */}
            <div className="relative shrink-0 border-r border-gray-200">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="appearance-none bg-gray-50 text-xs font-bold text-gray-600 pl-3 pr-7 py-2.5 focus:outline-none cursor-pointer h-full"
              >
                {searchFields.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              {/* Maroon chevron replaces default browser arrow */}
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#800000]">
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

            {/* Text input */}
            <div className="relative flex-1 min-w-0">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search by ${searchFields.find(f => f.value === searchField)?.label?.toLowerCase()}...`}
                className="w-full pl-8 pr-7 py-2.5 text-sm text-gray-700 bg-white focus:outline-none placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition"
                >
                  <X size={13} />
                </button>
              )}
            </div>

          </div>

          {/* Create button */}
          <button
            onClick={() => setOpenModel(true)}
            className="flex items-center justify-center gap-2 bg-[#800000] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0000] transition active:scale-95 shrink-0 whitespace-nowrap"
          >
            <UserPlus size={16} />
            {t("create_subreseller")}
          </button>

        </div>
      </div>

      {/* Active filter pill */}
      {searchQuery && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""} for
          </span>
          <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[#800000] text-xs font-bold px-3 py-1 rounded-full">
            {searchFields.find(f => f.value === searchField)?.label}: "{searchQuery}"
            <button onClick={() => setSearchQuery("")}>
              <X size={11} />
            </button>
          </span>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          DESKTOP + TABLET TABLE  (md+)
          table-fixed + colgroup = zero horizontal scroll
      ══════════════════════════════════════════════ */}
      <div className="hidden md:block bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: "36%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>

          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                {t("user_details")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                {t("status")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                {t("created")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                {t("coin")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                {t("action")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <tr
                  key={user.id}
                  className={`group transition-colors duration-150 hover:bg-red-50/30 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                    }`}
                >
                  {/* User details */}
                  <td className="px-4 py-3.5 text-left">
                    <div className="font-bold text-gray-800 text-sm truncate mb-1">
                      {user.fullName}
                    </div>

                    {/* Username */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="text-[11px] text-gray-400 font-medium">
                        {t("username_label")}:
                      </span>
                      <span className="text-[11px] text-blue-600 font-semibold">
                        {user.username}
                      </span>
                      <CopyButton value={user.username} />
                    </div>

                    {/* ID — maroon matching dashboard device ID brand color */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-gray-400 font-medium">
                        {t("id_label")}:
                      </span>
                      <span
                        className="text-[11px] text-[#800000] font-semibold cursor-default"
                        title={user.id}
                      >
                        {truncateId(user.id)}
                      </span>
                      <CopyButton value={user.id} />
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 text-center">
                    {getStatusBadge(user.active)}
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3.5 text-center text-xs text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Coins */}
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-black text-[#800000] text-sm">
                      {user.credits ?? 0}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenTransfer(user)}
                        className="px-3 py-1.5 rounded-lg bg-[#800000] text-white hover:bg-[#6a0000] text-xs font-bold transition active:scale-95 shadow-sm"
                      >
                        {t("transfer")}
                      </button>
                      <button
                        onClick={() => handleEditOpen(user)}
                        className="p-1.5 rounded-lg border border-gray-200 hover:border-[#800000] hover:text-[#800000] hover:bg-red-50 text-gray-500 transition active:scale-95"
                        title={t("edit")}
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Search size={28} className="opacity-40" />
                    <p className="font-semibold text-sm">
                      {searchQuery ? `No results for "${searchQuery}"` : t("no_data")}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
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

      {/* ══════════════════════════════════════════════
          MOBILE CARDS  (< md)
      ══════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-3"
            >
              {/* Top: name + status */}
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-gray-800 truncate pr-2">
                  {user.fullName}
                </span>
                {getStatusBadge(user.active)}
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-gray-500">ID:</span>
                  <span
                    className="text-xs text-[#800000] font-semibold"
                    title={user.id}
                  >
                    {truncateId(user.id)}
                  </span>
                  <CopyButton value={user.id} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-gray-500">
                    {t("username_label")}:
                  </span>
                  <span className="text-xs text-blue-600 font-semibold">
                    {user.username}
                  </span>
                  <CopyButton value={user.username} />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-600">{t("created")}:</span>{" "}
                    {formatDate(user.createdAt)}
                  </p>
                  <p className="text-xs">
                    <span className="font-medium text-gray-600">{t("coin")}:</span>{" "}
                    <span className="font-black text-[#800000]">{user.credits ?? 0}</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleOpenTransfer(user)}
                  className="flex-1 py-2 rounded-xl bg-[#800000] text-white text-sm font-bold hover:bg-[#6a0000] transition active:scale-95"
                >
                  {t("transfer")}
                </button>
                <button
                  onClick={() => handleEditOpen(user)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold hover:border-[#800000] hover:text-[#800000] hover:bg-red-50 transition active:scale-95"
                >
                  {t("edit")}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
            <Search size={28} className="opacity-40" />
            <p className="font-semibold text-sm">
              {searchQuery ? `No results for "${searchQuery}"` : t("no_data")}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-[#800000] font-bold hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && !searchQuery && (
        <div className="flex justify-center items-center gap-3 p-3 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t("transaction.prev")}
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {t("transaction.page")} {currentPage} {t("transaction.of")} {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t("transaction.next")}
          </button>
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      <AnimatePresence>
        {openModel && (
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
                  {t("create_subreseller")}
                </h5>
                <button
                  onClick={() => { setOpenModel(false); setError(""); }}
                  className="text-white hover:bg-white/20 p-1.5 rounded-full transition"
                >
                  <MdClose size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-3">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
                    {error}
                  </div>
                )}
                <input
                  className={inputCls}
                  placeholder={t("username")}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
                <input
                  className={inputCls}
                  type="password"
                  placeholder={t("password")}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <input
                  className={inputCls}
                  placeholder={t("full_name")}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#800000] text-white font-bold rounded-xl hover:bg-[#6a0000] transition active:scale-95 mt-1"
                >
                  {t("submit")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EDIT MODAL ── */}
      <AnimatePresence>
        {editModal && (
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
                  {t("update")}
                </h5>
                <button
                  onClick={() => { setEditModal(false); setError(""); }}
                  className="text-white hover:bg-white/20 p-1.5 rounded-full transition"
                >
                  <MdClose size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-3">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
                    {error}
                  </div>
                )}
                <input
                  className={inputCls}
                  placeholder={t("full_name")}
                  value={editData.fullName}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                />
                <input
                  className={inputCls}
                  type="password"
                  placeholder={t("password")}
                  value={editData.password}
                  onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#800000] text-white font-bold rounded-xl hover:bg-[#6a0000] transition active:scale-95 mt-1"
                >
                  {t("update")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TRANSFER MODAL ── */}
      <TransferModal
        open={transferModal}
        onClose={() => setTransferModal(false)}
        selectedUser={selectedUser}
        availableCredits={selectedUser?.credits}
        refreshData={async () => {
          await fetchdata(currentPage);   // already correct, just needs clean fetch
          await refetchDashboard();
        }}
      />

    </div>
  );
};

export default SubresellerDashboard;