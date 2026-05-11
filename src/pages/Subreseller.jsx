import React, { useEffect, useState } from "react";
import { UserPlus, Pencil } from "lucide-react";
import { motion } from "framer-motion";
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

  // EDIT STATE
  const [editModal, setEditModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
  });

  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const maroonMain = "#800000";

  // FETCH
  const [totalPages, setTotalPages] = useState(1);

const fetchdata = async (page = currentPage) => {
  try {
    const backendPage = page - 1;

    const res = await getAllResellerInfo(backendPage);

    const usersData = res?.data?.content ?? [];

    setUsers(Array.isArray(usersData) ? usersData : []);

    setTotalPages(res?.data?.totalPages || 1);

  } catch (err) {
    console.error(err);
    setUsers([]);
  }
};


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);

    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

useEffect(() => {
  fetchdata(currentPage);
}, [currentPage]);

  // CREATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createReseller(formData);

    if (res.success) {
      setOpenModel(false);
      setFormData({ username: "", password: "", fullName: "" });
      await fetchdata();
      await refetchDashboard();
    } else {
      setError(res.message);
    }
  };

  const truncateId = (id, start = 8, end = 5) => {
    if (!id) return "";
    if (id.length <= start + end) return id;
    return `${id.slice(0, start)}...${id.slice(-end)}`;
  };


  // EDIT OPEN
  const handleEditOpen = (user) => {
    setEditUserId(user.id);
    setEditData({
      fullName: user.fullName || "",
      email: user.email || "",
      password: "",
    });
    setEditModal(true);
  };

  // UPDATE
  const handleUpdate = async (e) => {
    e.preventDefault();

    const payload = {
      fullName: editData.fullName,
      email: editData.email,
    };

    if (editData.password) payload.password = editData.password;

    const res = await updateSubReseller(editUserId, payload);

    if (res.success) {
      setEditModal(false);
      await fetchdata();
    } else {
      setError(res.message);
    }
  };

  // TRANSFER
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
    <span
      className={`px-2 py-1 text-xs rounded-full font-semibold ${active
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-600"
        }`}
    >
      {active ? t("active") : t("inactive")}
    </span>
  );

  return (
    <div className="min-h-screen w-full bg-[#f4f4f7] p-4">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <h3 className="font-bold" style={{ color: maroonMain }}>
            {t("subreseller_management")}
          </h3>
          <p className="text-gray-500 text-sm">
            {t("manage_subreseller")}
          </p>
        </div>

        <button
          onClick={() => setOpenModel(true)}
          className="bg-[#800000] text-white px-4 py-2 rounded-[10px] flex items-center gap-2 hover:bg-[#660000] transition"
        >
          <UserPlus size={16} />
          {t("create_subreseller")}
        </button>

      </div>

      {/* TABLE */}
      <div className="hidden md:block bg-white rounded-xl shadow border p-2 overflow-x-auto">
        <table className="table table-hover text-center align-middle mb-0">

          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="text-start">{t("user_details")}</th>
              <th>{t("status")}</th>
              <th>{t("created")}</th>
              <th>{t("coin")}</th>
              <th>{t("action")}</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr className="border-t hover:bg-gray-50 transition" key={user.id}>
                <td className="px-4 py-3 text-left">
                  <div className="font-semibold">{user.fullName}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                    {t("username_label")}:
                    <span className="text-blue-600">{user.username}</span>

                    <div className="relative">
                      <button
                        onClick={() => copyToClipboard(user.username)}
                        className="text-[10px] border px-2 py-0.5 rounded text-black-500 hover:bg-blue-50 transition"
                      >
                        Copy
                      </button>

                      {copiedId === user.username && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                    {t("id_label")}:
                    <span
                      className="text-blue-600 cursor-pointer"
                      title={user.id}
                    >
                      {truncateId(user.id)}
                    </span>

                    <div className="relative">
                      <button
                        onClick={() => copyToClipboard(user.id)}
                        className="text-[10px] border px-2 py-0.5 rounded text-black-500 hover:bg-blue-50 transition"
                      >
                        Copy
                      </button>

                      {copiedId === user.id && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td>{getStatusBadge(user.active)}</td>
                <td>{formatDate(user.createdAt)}</td>

                <td className="font-semibold text-gray-800">
                  {user.credits ?? 0}
                </td>

                {/* ✅ FIXED ACTION COLUMN */}
                <td>
                  <div className="flex justify-center gap-2">

                    <button
                      onClick={() => handleOpenTransfer(user)}
                      className="px-3 py-1.5 rounded-md bg-[#800000] text-white hover:bg-[#660000] text-xs"
                    >
                      💰 {t("transfer")}
                    </button>

                    <button
                      onClick={() => handleEditOpen(user)}
                      className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 text-xs"
                    >
                      <Pencil size={12} />
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* mobile view */}

      <div className="block md:hidden space-y-4 p-2">
        {users.map((user) => (
          <div key={user.id} className="p-4 bg-white rounded-xl shadow space-y-3">

            {/* TOP ROW */}
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm break-words">
                {user.fullName}
              </span>

              {getStatusBadge(user.active)}
            </div>

            {/* DETAILS */}
            <div className="text-sm text-gray-600 space-y-1">

              <p className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">ID:</span>

                <span className="text-blue-800">
                  {truncateId(user.id)}
                </span>

                <div className="relative">
                  <button
                    onClick={() => copyToClipboard(user.id)}
                    className="text-[10px] border px-2 py-0.5 rounded text-black-500 hover:bg-blue-50 transition"
                  >
                    Copy
                  </button>

                  {copiedId === user.id && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </div>
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{t("username_label")}:</span>
                <span className="text-blue-800">{user.username}</span>

                <div className="relative">
                  <button
                    onClick={() => copyToClipboard(user.username)}
                    className="text-[10px] border px-2 py-0.5 rounded text-black-500 hover:bg-blue-50"
                  >
                    Copy
                  </button>

                  {copiedId === user.username && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </div>
              </div>

              <p>
                <span className="font-medium">{t("created")}:</span>{" "}
                {formatDate(user.createdAt)}
              </p>

              <p>
                <span className="font-medium">{t("coin")}:</span>{" "}
                {user.credits ?? 0}
              </p>

            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleOpenTransfer(user)}
                className="flex-1 py-2 rounded-md bg-[#800000] text-white text-sm"
              >
                {t("transfer")}
              </button>

              <button
                onClick={() => handleEditOpen(user)}
                className="flex-1 py-2 rounded-md border text-sm"
              >
                {t("edit")}
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {openModel && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/70 z-50">
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded-xl shadow"
            style={{ width: "400px" }}
          >
            <div className="flex justify-content-between mb-3">
              <h5>{t("create_subreseller")}</h5>
              <MdClose onClick={() => setOpenModel(false)} />
            </div>

            {error && <div className="text-danger">{error}</div>}

            <input
              className="form-control my-2"
              placeholder={t("username")}
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />

            <input
              className="form-control my-2"
              type="password"
              placeholder={t("password")}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <input
              className="form-control my-2"
              placeholder={t("full_name")}
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />

            <button className="btn btn-primary w-100 mt-2">
              {t("submit")}
            </button>
          </motion.form>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.7)", zIndex: 99999 }}>
          <motion.form
            onSubmit={handleUpdate}
            className="bg-white p-4 rounded-xl shadow"
            style={{ width: "400px" }}
          >
            <div className="flex justify-content-between mb-3">
              <h5>{t("update")}</h5>
              <MdClose onClick={() => setEditModal(false)} />
            </div>

            <input
              className="form-control my-2"
              value={editData.fullName}
              onChange={(e) =>
                setEditData({ ...editData, fullName: e.target.value })
              }
            />

            {/* <input
              className="form-control my-2"
              value={editData.email}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
            /> */}

            <input
              className="form-control my-2"
              type="password"
              placeholder={t("password")}
              value={editData.password}
              onChange={(e) =>
                setEditData({ ...editData, password: e.target.value })
              }
            />

            <button className="btn btn-primary w-100 mt-2">
              {t("update")}
            </button>
          </motion.form>
        </div>
      )}

      {/* ✅ CONSISTENT PAGINATION (UserManagement style) */}
     {totalPages > 1 && (
  <div className="flex justify-center items-center gap-3 p-4 flex-wrap">

    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      className={`px-4 py-1.5 rounded-md border transition
        ${
          currentPage === 1
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-gray-200 hover:border-gray-400"
        }
      `}
    >
      Prev
    </button>

    <span className="font-medium text-sm">
      Page {currentPage} of {totalPages}
    </span>

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      className={`px-4 py-1.5 rounded-md border transition
        ${
          currentPage === totalPages
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-gray-200 hover:border-gray-400"
        }
      `}
    >
      Next
    </button>

  </div>
)}

      {/* TRANSFER */}
      <TransferModal
        open={transferModal}
        onClose={() => setTransferModal(false)}
        selectedUser={selectedUser}
        availableCredits={selectedUser?.credits}
        refreshData={async () => {
          await fetchdata();
          await refetchDashboard();
        }}
      />
    </div>
  );
};

export default SubresellerDashboard;