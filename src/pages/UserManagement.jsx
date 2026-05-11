import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Power, X } from "lucide-react";
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
  const maroonMain = "#800000";
  const { t } = useTranslation();

  const [totalPages, setTotalPages] = useState(1);
  const [devices, setDevices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ deviceId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalUser, setTotalUser] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const { userRole } = useAuth();
  const [copiedId, setCopiedId] = useState(null);

  const [search, setSearch] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

 const fetchDashboard = async (page = currentPage) => {
  setLoadingData(true);

  let res;

  const backendPage = page - 1;

  if (userRole === "SUB_RESELLER") {
    res = await subResellerUserInfo(backendPage);
  } else {
    res = await subscibedUserinfo(backendPage);
  }

  if (res.success) {
    const data = res.data?.content || [];

    const sortedData = [...data].sort(
      (a, b) =>
        new Date(b.registeredAt) -
        new Date(a.registeredAt)
    );

    setDevices(sortedData);

    setTotalUser(res.data.totalElements);

    setTotalPages(res.data.totalPages);

    setActiveUser(
      data.filter((u) => u.deviceStatus === "ACTIVE")
        .length
    );
  }

  setLoadingData(false);
};

useEffect(() => {
  fetchDashboard();
}, []);

useEffect(() => {
  fetchDashboard(currentPage);
}, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleDisable = async () => {
    if (!selectedDevice) return;

    const deviceId = selectedDevice.deviceId;

    let response;

    if (userRole === "SUB_RESELLER") {
      response = await disableSubResellerUser(deviceId);
    } else {
      response = await DisableUserAccount(deviceId);
    }

    if (response?.success) {
      setDevices((prev) => {
        const updated = prev.map((item) =>
          item.deviceId === deviceId
            ? {
                ...item,
                deviceStatus:
                  item.deviceStatus === "ACTIVE"
                    ? "INACTIVE"
                    : "ACTIVE",
              }
            : item
        );

        setActiveUser(
          updated.filter((u) => u.deviceStatus === "ACTIVE").length
        );

        return updated;
      });
    }

    setConfirmModal(false);
    setSelectedDevice(null);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    const macRegex =
      /^([0-9A-Fa-f]{2}([:-]?)){5}[0-9A-Fa-f]{2}$|^([0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}$/;

    if (!macRegex.test(newUser.deviceId)) {
      toast.error(
        t("userManagement.invalid_mac")
      );
      return;
    }

    setLoading(true);

    const payload = {
      deviceId: newUser.deviceId,
      deviceModel: "Generic Smart Device",
      osVersion: "1.0.0",
      platform: "UNKNOWN",
    };

    let response;

    if (userRole === "SUB_RESELLER") {
      response = await createSubResellerUser(payload);
    } else {
      response = await createUser(newUser.deviceId);
    }

    if (response?.success) {
      setShowModal(false);
      fetchDashboard();
      setNewUser({ deviceId: "" });
      setError("");
    } else {
      setError(response?.message);
    }

    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);

    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const filteredDevices = devices.filter((item) =>
    item.deviceId.toLowerCase().includes(search.toLowerCase())
  );

  const truncateId = (id, start = 8, end = 5) => {
    if (!id) return "";
    if (id.length <= start + end) return id;
    return `${id.slice(0, start)}...${id.slice(-end)}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f4f7]">
      <div className="w-full p-4">

        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <h3 className="font-bold m-0" style={{ color: maroonMain }}>
              {t("userManagement.device_management")}
            </h3>
            <p className="text-gray-500">
              {t("userManagement.manage_members")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto flex-shrink-0">

            <input
              type="text"
              placeholder={t("userManagement.search_device")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded-md w-full sm:w-[250px] focus:ring-2 focus:ring-[#800000]"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="bg-[#800000] text-white px-4 py-2 rounded-[10px] flex items-center justify-center gap-2 hover:bg-[#660000] transition"
            >
              <UserPlus size={18} />
              <span>
                {t("userManagement.create_new_device")}
              </span>
            </motion.button>

          </div>
        </header>

        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex-1 min-w-[140px] bg-white p-4 rounded-xl font-bold shadow border-l-4 border-[#800000]">
            {t("userManagement.total_users")}: {totalUser}
          </div>

          <div className="flex-1 min-w-[140px] bg-white p-4 rounded-xl font-bold shadow border-l-4 border-blue-900">
            {t("userManagement.active")}: {activeUser}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border">
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-center">
                    {t("userManagement.device_id")}
                  </th>
                  <th className="px-4 py-3 text-center">
                    {t("userManagement.status")}
                  </th>
                  <th className="px-4 py-3 text-center">
                    {t("userManagement.subscription")}
                  </th>
                  <th className="px-4 py-3 text-center">
                    {t("userManagement.expires")}
                  </th>
                  <th className="px-4 py-3 text-center">
                    {t("userManagement.registered")}
                  </th>
                  <th className="px-4 py-3 text-center">
                    {t("userManagement.action")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {loadingData ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-t animate-pulse">
                      <td className="p-3"><div className="h-3 bg-gray-200 rounded"></div></td>
                      <td className="p-3"><div className="h-3 bg-gray-200 rounded"></div></td>
                      <td className="p-3"><div className="h-3 bg-gray-200 rounded"></div></td>
                      <td className="p-3"><div className="h-3 bg-gray-200 rounded"></div></td>
                      <td className="p-3"><div className="h-3 bg-gray-200 rounded"></div></td>
                      <td className="p-3"><div className="h-6 bg-gray-200 rounded"></div></td>
                    </tr>
                  ))
                ) : filteredDevices.length > 0 ? (
                  filteredDevices.map((item) => (
                    <tr key={item.deviceId} className="border-t text-center">

                      <td className="px-3 py-3 text-gray-600">
                        <div className="flex items-center justify-center gap-2 flex-wrap">

                          <span
                            className="text-blue-600 cursor-pointer"
                            title={item.deviceId}
                          >
                            {truncateId(item.deviceId)}
                          </span>

                          <div className="relative">
                            <button
                              onClick={() =>
                                copyToClipboard(item.deviceId)
                              }
                              className="text-xs border px-2 py-1 rounded hover:bg-blue-50 transition"
                            >
                              {t("userManagement.copy")}
                            </button>

                            {copiedId === item.deviceId && (
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                                {t("userManagement.copied")}
                              </span>
                            )}
                          </div>

                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-semibold ${
                            item.deviceStatus === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.deviceStatus}
                        </span>
                      </td>

                      <td className="px-2 py-3">
                        {item.subscriptionType}
                      </td>

                      <td className="px-2 py-3">
                        {formatDate(item.expiresAt)}
                      </td>

                      <td className="px-2 py-3">
                        {formatDate(item.registeredAt)}
                      </td>

                      <td className="px-2 py-3">
                        <button
                          onClick={() => {
                            setSelectedDevice(item);
                            setConfirmModal(true);
                          }}
                          className={`px-3 py-1.5 rounded-md border transition ${
                            item.deviceStatus === "INACTIVE"
                              ? "border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white"
                              : "bg-[#800000] text-white border-[#800000] hover:bg-[#660000]"
                          }`}
                        >
                          <Power size={14} />
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-6">
                      {t("userManagement.no_user_found")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="block md:hidden space-y-4">
            {loadingData ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-xl shadow animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))
            ) : filteredDevices.length > 0 ? (
              filteredDevices.map((item) => (
                <div key={item.deviceId} className="p-4 bg-white rounded-xl shadow space-y-2">

                  <div className="flex justify-between items-center">

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-semibold text-sm text-blue-600"
                        title={item.deviceId}
                      >
                        {truncateId(item.deviceId, 6, 4)}
                      </span>

                      <div className="relative">
                        <button
                          onClick={() =>
                            copyToClipboard(item.deviceId)
                          }
                          className="text-[10px] border px-2 py-0.5 rounded hover:bg-blue-50 transition"
                        >
                          {t("userManagement.copy")}
                        </button>

                        {copiedId === item.deviceId && (
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                            {t("userManagement.copied")}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        item.deviceStatus === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.deviceStatus}
                    </span>

                  </div>

                  <div className="text-sm text-gray-600">
                    <p>
                      {t("userManagement.plan")}:{" "}
                      {item.subscriptionType}
                    </p>
                    <p>
                      {t("userManagement.expires")}:{" "}
                      {formatDate(item.expiresAt)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDevice(item);
                      setConfirmModal(true);
                    }}
                    className="w-full mt-2 py-2 rounded-md bg-[#800000] text-white"
                  >
                    {t("userManagement.toggle_status")}
                  </button>

                </div>
              ))
            ) : (
              <p className="text-center">
                {t("userManagement.no_users")}
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 p-4 flex-wrap">

              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((p) => p - 1)
                }
                className={`px-4 py-1.5 rounded-md border transition ${
                  currentPage === 1
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                {t("userManagement.prev")}
              </button>

              <span className="font-medium text-sm">
                {t("userManagement.page")} {currentPage}{" "}
                {t("userManagement.of")} {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => p + 1)
                }
                className={`px-4 py-1.5 rounded-md border transition ${
                  currentPage === totalPages
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                {t("userManagement.next")}
              </button>

            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white p-5 rounded-2xl w-[90%] max-w-md shadow-lg"
            >
              <div className="flex justify-between items-center mb-3">
                <h5>{t("userManagement.new_device")}</h5>
                <X onClick={() => setShowModal(false)} />
              </div>

              {error && (
                <p style={{ color: "red" }}>{error}</p>
              )}

              <form onSubmit={handleAddUser}>
                <input
                  required
                  className="w-full p-2.5 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#800000]"
                  value={newUser.deviceId}
                  onChange={(e) =>
                    setNewUser({
                      deviceId: e.target.value,
                    })
                  }
                  placeholder={t("userManagement.mac_placeholder")}
                />

                <button
                  disabled={loading}
                  className="w-full py-3 rounded-md bg-[#800000] text-white hover:bg-[#660000] transition"
                >
                  {loading
                    ? t("userManagement.processing")
                    : t("userManagement.create")}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {confirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-5 rounded-2xl w-[90%] max-w-md shadow-lg"
            >
              <div className="text-center">

                <h5 className="mb-2">
                  {t("userManagement.confirm_action")}
                </h5>

                <p className="mb-5">
                  {t("userManagement.are_you_sure")}{" "}
                  <strong>
                    {selectedDevice?.deviceStatus ===
                    "ACTIVE"
                      ? t("userManagement.disable")
                      : t("userManagement.activate")}
                  </strong>{" "}
                  {t("userManagement.this_user")}
                </p>

                <div className="flex gap-3">
                  <button
                    className="flex-1 py-2 border rounded-md bg-gray-100 hover:bg-gray-200 transition"
                    onClick={() =>
                      setConfirmModal(false)
                    }
                  >
                    {t("userManagement.cancel")}
                  </button>

                  <button
                    className="flex-1 py-2 rounded-md bg-[#800000] text-white hover:bg-[#660000] transition"
                    onClick={handleDisable}
                  >
                    {t("userManagement.yes_confirm")}
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserManagement;