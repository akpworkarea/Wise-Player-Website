import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTranslation } from "react-i18next";
import UserManagement from "./UserManagement";
import RequestManagement from "./RequestManagement";
import SubReseller from "./Subreseller";
import { Users, CheckCircle, Clock } from "lucide-react";
import { BsCoin } from "react-icons/bs";
import { formatDate } from "../auth/utilfunction";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "../context/dashboardContext";


const Dashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const { dashboard, refetchDashboard } = useDashboard();
  const [copiedId, setCopiedId] = useState(null);

  const truncateId = (id, start = 8, end = 4) => {
    if (!id) return "";
    if (id.length <= start + end) return id;
    return `${id.slice(0, start)}...${id.slice(-end)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);

    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const maroonMain = "#800000";
  const maroonLight = "#fdf2f2";

  const stats = [
    {
      title: t("total_users"),
      count: `${dashboard?.stats?.totalUsers}`,
      icon: <Users size={22} />,
      trend: "+12%",
    },
    {
      title: t("active_subs"),
      count: `${dashboard?.stats?.activeSub}`,
      icon: <CheckCircle size={22} />,
      trend: "+5%",
    },
    {
      title: t("pending_req"),
      count: `${dashboard?.stats?.pending}`,
      icon: <Clock size={22} />,
      trend: "-2%",
    },
    {
      title: t("total_coins"),
      count: `${dashboard?.stats?.creditCoin || 0}`,
      icon: <BsCoin size={22} />,
      trend: "+18%",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  useEffect(() => {
    refetchDashboard();
  }, []);

  return (
   <div className="min-h-screen bg-[#f4f4f7] w-full">

  {/* HEADER */}
  <div className="bg-white border-b px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sticky top-0 z-10">
    <h5 className="text-xs sm:text-sm font-semibold uppercase tracking-wider">
      {t("admin_dashboard.panel")} /{" "}
      <span className="text-[#800000]">
        {t(`admin_dashboard.${activeTab}`)}
      </span>
    </h5>

    <div className="flex items-center gap-3">
      <div className="hidden sm:block text-right">
        <p className="text-sm font-semibold">
          {t("admin_dashboard.admin_user")}
        </p>

        <p className="text-xs text-green-600">
          ● {t("admin_dashboard.online")}
        </p>
      </div>

      <div className="w-9 h-9 rounded-full bg-[#800000]" />
    </div>
  </div>

  {/* MAIN */}
  <div className="p-4 space-y-6">

    {/* STATS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((item, i) => (
        <div key={i} className="bg-white p-4 rounded-xl shadow border">
          <div className="flex justify-between">
            <div className="p-2 bg-red-50 text-[#800000] rounded-md">
              {item.icon}
            </div>

            <span className="text-xs font-bold text-green-600">
              {item.trend}
            </span>
          </div>

          <h2 className="text-xl font-bold mt-3">{item.count}</h2>
          <p className="text-sm text-gray-500">{item.title}</p>
        </div>
      ))}
    </div>

    {/* TABLE (DESKTOP) */}
    <div className="hidden md:block bg-white rounded-xl shadow border overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
          <tr>
            <th className="px-4 py-3 text-center">
              {t("admin_dashboard.device_id")}
            </th>

            <th className="px-4 py-3 text-center">
              {t("admin_dashboard.status")}
            </th>

            <th className="px-4 py-3 text-center">
              {t("admin_dashboard.subscription")}
            </th>

            <th className="px-4 py-3 text-center">
              {t("admin_dashboard.registered")}
            </th>
          </tr>
        </thead>

        <tbody>
          {dashboard?.devices?.length > 0 ? (
            dashboard.devices.slice(0, 8).map((item) => (
              <tr key={item.deviceId} className="border-t text-center">
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2 flex-wrap">

                    <span
                      className="text-blue-600 cursor-pointer"
                      title={item.deviceId}
                    >
                      {truncateId(item.deviceId)}
                    </span>

                    <div className="relative">
                      <button
                        onClick={() => copyToClipboard(item.deviceId)}
                        className="text-xs border px-2 py-1 rounded hover:bg-blue-50 transition"
                      >
                        {t("admin_dashboard.copy")}
                      </button>

                      {copiedId === item.deviceId && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                          {t("admin_dashboard.copied")}
                        </span>
                      )}
                    </div>

                  </div>
                </td>

                <td>{item.deviceStatus}</td>
                <td>{item.subscriptionType}</td>
                <td>{formatDate(item.registeredAt)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="py-6 text-center">
                {t("admin_dashboard.no_devices_found")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* MOBILE */}
    <div className="md:hidden space-y-4">
      {dashboard?.devices?.length > 0 ? (
        dashboard.devices.slice(0, 8).map((item) => (
          <div key={item.deviceId} className="bg-white p-4 rounded-xl shadow">
            <div className="flex justify-between">
              <div className="flex items-center gap-2 flex-wrap">

                <span
                  className="text-blue-600 font-semibold text-sm"
                  title={item.deviceId}
                >
                  {truncateId(item.deviceId, 6, 4)}
                </span>

                <div className="relative">
                  <button
                    onClick={() => copyToClipboard(item.deviceId)}
                    className="text-[10px] border px-2 py-0.5 rounded hover:bg-blue-50 transition"
                  >
                    {t("admin_dashboard.copy")}
                  </button>

                  {copiedId === item.deviceId && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                      {t("admin_dashboard.copied")}
                    </span>
                  )}
                </div>

              </div>

              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                {item.deviceStatus}
              </span>
            </div>

            <div className="text-sm text-gray-500 mt-2">
              <p>
                {t("admin_dashboard.plan")}: {item.subscriptionType}
              </p>

              <p>
                {t("admin_dashboard.registered")}:{" "}
                {formatDate(item.registeredAt)}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center">
          {t("admin_dashboard.no_devices")}
        </p>
      )}
    </div>

    {/* TABS */}
    {activeTab === "users" && <UserManagement />}
    {activeTab === "requests" && <RequestManagement />}
    {activeTab === "subreseller" && <SubReseller />}

  </div>
</div>
  );
};

export default Dashboard;