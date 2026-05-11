import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoCopyOutline } from "react-icons/io5";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../auth/utilfunction";
import { useDashboard } from "../context/dashboardContext";

import {
  getActivationRequests,
  createActivationRequest,
  getPlans,
} from "../auth/api/activationRequest";
import { useTranslation } from "react-i18next";

function RequestManagement() {
  const { userRole } = useAuth();
  const { t } = useTranslation()

  const [requests, setRequests] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [copied, setCopied] = useState({ id: null, field: null });
  const [showModal, setShowModal] = useState(false);
  const [apiError, setApiError] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const { refetchDashboard } = useDashboard();
  const [currentPage, setCurrentPage] = useState(1);


  const [newRequest, setNewRequest] = useState({
    deviceId: "",
    planName: "",
  });

  // FETCH REQUESTS
const fetchRequests = async (
  page = currentPage,
  currentFilter = filter
) => {
  const backendPage = page - 1;

  const status =
    currentFilter === "ALL"
      ? ""
      : currentFilter;

  const res = await getActivationRequests(
    userRole,
    status,
    backendPage
  );

  if (!res.success) return;

  const data = res.data?.content || [];

  setRequests(
    data.map((item) => ({
      id: item.id,
      status: item.status,
      createdAt: formatDate(item.createdAt),
      resellerId: item.resellerId,
      deviceId: item.deviceId,
      planName: item.planName,
      creditsUsed: item.creditsUsed,
    }))
  );

  setTotalPages(res.data.totalPages || 1);
};
  // FETCH PLANS
  const fetchPlans = async () => {
    const res = await getPlans();
    if (!res.success) return;

    setTiers(res.data.map((p) => p.name));
  };

useEffect(() => {
  fetchRequests(currentPage, filter);
  fetchPlans();
}, [userRole, currentPage, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // COPY
  const copyToClipboard = (text, id, field) => {
    navigator.clipboard.writeText(text);

    setCopied({ id, field });

    setTimeout(() => {
      setCopied({ id: null, field: null });
    }, 1500);
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const payload = {
      deviceId: newRequest.deviceId,
      planName: newRequest.planName,
      amount: 5,
      currency: "CREDITS",
    };

    const res = await createActivationRequest(userRole, payload);

    if (!res.success) {
      setApiError(res.message);
      return;
    }

    setShowModal(false);
    setNewRequest({ deviceId: "", planName: "" });

    await fetchRequests();

    // 🔥 THIS IS THE FIX
    await refetchDashboard();
  };
 



  const maroonMain = "#800000";

  return (
    <div className="p-4 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#800000]">
          {t("requests.request_management")}
        </h2>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
        >
          <Plus size={16} /> {t("requests.new_request")}
        </button>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setFilter(tab);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-md text-sm transition ${filter === tab
              ? "bg-black text-white"
              : "bg-gray-200 hover:bg-gray-300"
              }`}
          >
            {t(`requests.${tab.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-xl shadow border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-center">{t("requests.device_id")}</th>
              <th className="px-4 py-3 text-center">{t("requests.reseller_id")}</th>
              <th className="px-4 py-3 text-center">{t("requests.plan")}</th>
              <th className="px-4 py-3 text-center">{t("requests.credits")}</th>
              <th className="px-4 py-3 text-center">{t("requests.created")}</th>
              <th className="px-4 py-3 text-center">{t("requests.status")}</th>
            </tr>
          </thead>

          <tbody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <tr key={req.id} className="border-t text-center">

                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2 items-center">
                      <span
                        className="text-blue-600 cursor-pointer"
                        title={req.deviceId}
                      >
                        {req.deviceId.slice(0, 8)}...
                      </span>

                      <button
                        onClick={() =>
                          copyToClipboard(req.deviceId, req.id, "device")
                        }
                        className="text-xs border px-2 py-1 rounded hover:bg-blue-50"
                      >
                        {t("requests.copy")}
                      </button>

                      {copied.id === req.id &&
                        copied.field === "device" && (
                          <span className="absolute mt-[-30px] bg-black text-white text-[10px] px-2 py-1 rounded">
                            {t("requests.copied")}
                          </span>
                        )}
                    </div>
                  </td>

                  <td>
                    <div className="flex justify-center gap-2 items-center">
                      <span title={req.resellerId}>
                        {req.resellerId?.slice(0, 8)}...
                      </span>

                      <button
                        onClick={() =>
                          copyToClipboard(req.resellerId, req.id, "reseller")
                        }
                        className="text-xs border px-2 py-1 rounded hover:bg-blue-50"
                      >
                        {t("requests.copy")}
                      </button>
                    </div>
                  </td>

                  <td>{req.planName}</td>
                  <td>{req.creditsUsed ?? "-"}</td>
                  <td>{req.createdAt}</td>

                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${req.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-600"
                        : req.status === "APPROVED"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                        }`}
                    >
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-6 text-center">
                  {t("requests.no_data_found")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-blue-600">
                  {req.deviceId.slice(0, 6)}...
                </span>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${req.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-600"
                    : req.status === "APPROVED"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                    }`}
                >
                  {req.status}
                </span>
              </div>

              <div className="text-sm text-gray-500 mt-2 space-y-1">
                <p>{t("requests.reseller")}: {req.resellerId}</p>
                <p>{t("requests.plan")}: {req.planName}</p>
                <p>{t("requests.credits")}: {req.creditsUsed ?? "-"}</p>
                <p>{t("requests.created")}: {req.createdAt}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">{t("requests.no_requests")}</p>
        )}
      </div>

      {/* PAGINATION */}
     {/* PAGINATION */}
{totalPages > 1 && (
  <div className="flex justify-center items-center gap-4">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      className="border px-3 py-1 rounded disabled:opacity-50"
    >
      {t("requests.prev")}
    </button>

    <span className="text-sm">
      {t("requests.page")} {currentPage}{" "}
      {t("requests.of")} {totalPages}
    </span>

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      className="border px-3 py-1 rounded disabled:opacity-50"
    >
      {t("requests.next")}
    </button>
  </div>
)}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-[#800000] mb-4">
                {t("requests.submit_request")}
              </h3>

              {apiError && (
                <p className="text-red-500 text-sm mb-3">{apiError}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  type="text"
                  placeholder={t("requests.device_id")}
                  value={newRequest.deviceId}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      deviceId: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]"
                />

                <select
                  value={newRequest.planName}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      planName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]"
                >
                  <option value="">{t("requests.select_plan")}</option>
                  {tiers.map((t, i) => (
                    <option key={i} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#800000] text-white py-2 rounded-lg text-sm hover:opacity-90"
                  >
                    {t("requests.submit")}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 py-2 rounded-lg text-sm hover:bg-gray-300"
                  >
                    {t("requests.cancel")}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default RequestManagement;