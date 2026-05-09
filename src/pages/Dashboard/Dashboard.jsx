import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTranslation } from 'react-i18next';
import Sidebar from "../../component/Sidebar";
import UserManagement from "../../pages/UserManagement";
import RequestManagement from "../../pages/RequestManagement";
import SubReseller from "../../pages/Subreseller";
import { DashbaordOverview } from "../../auth/dashboard";
import { Users, UserPlus, CheckCircle, Clock } from "lucide-react";
import { BsCoin } from "react-icons/bs";
import { formatDate } from "../../auth/utilfunction";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "../../context/dashboardContext";
const Dashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview"); // टैब स्टेट
  const { dashboard, loading, refetchDashboard } = useDashboard();
  console.log("dashbapord : ", dashboard);

  const maroonMain = "#800000";
  const maroonLight = "#fdf2f2";

  const growthData = [
    { name: "Jan", users: 400 },
    { name: "Feb", users: 800 },
    { name: "Mar", users: 600 },
    { name: "Apr", users: 1200 },
    { name: "May", users: 1100 },
    { name: "Jun", users: 1600 },
  ];

  const subStatusData = [
    { name: "Active", value: 840, color: "#800000" },
    { name: "Pending", value: 120, color: "#ffc107" },
    { name: "Expired", value: 290, color: "#dc3545" },
  ];

  const stats = [
    {
      title: t('total_users'), // Changed
      count: `${dashboard?.stats?.totalUsers}`,
      icon: <Users size={22} />,
      trend: "+12%",
    },
    {
      title: t('active_subs'), // Changed
      count: `${dashboard?.stats?.activeSub}`,
      icon: <CheckCircle size={22} />,
      trend: "+5%",
    },
    {
      title: t('pending_req'), // Changed
      count: `${dashboard?.stats?.pending}`,
      icon: <Clock size={22} />,
      trend: "-2%",
    },
    {
      title: t('total_coins'), // Changed
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className="container-fluid p-0 d-flex"
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="flex-grow-1 overflow-auto w-100" style={{ minWidth: 0 }}>
        {" "}
        <header
          className="bg-white z-0 border-bottom px-4 py-3 d-flex justify-content-between align-items-center sticky-top"
        // style={{ zIndex: 999 }}
        >
          <h5
            className="fw-bold text-dark m-0 text-uppercase"
            style={{ fontSize: "0.9rem", letterSpacing: "1px" }}
          >
            {t('panel')} /{" "}
            <span style={{ color: maroonMain }}>
              {t(activeTab)}
            </span>
          </h5>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <p className="m-0 fw-bold small">{t('admin_user')}</p>

              <p className="m-0 text-success small d-flex align-items-center justify-content-end gap-1">
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "green",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                ></span>
                {t('online')}
              </p>
            </div>

            <div
              className="rounded-circle shadow-sm border  border-white"
              style={{ width: "42px", height: "42px", background: maroonMain }}
            ></div>
          </div>
        </header>
        <main className="p-4">
          <AnimatePresence mode="wait">
            {/* OVERVIEW SECTION */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="row g-4 mb-4">
                  {stats.map((item, i) => (
                    <div className="col-xl-3 col-md-6" key={i}>
                      <div className="card border-0 shadow-sm p-3 rounded-4 h-100 bg-white hover-card">
                        <div className="d-flex justify-content-between">
                          <div
                            className="p-2 rounded-3"
                            style={{
                              background: maroonLight,
                              color: maroonMain,
                            }}
                          >
                            {item.icon}
                          </div>
                          <span
                            className={`small fw-bold ${item.trend.startsWith("+") ? "text-success" : "text-danger"}`}
                          >
                            {item.trend}
                          </span>
                        </div>
                        <h3 className="mt-3 mb-1 fw-bold">{item.count}</h3>
                        <p className="text-muted small mb-0 fw-medium">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-lg-12">
                    {/* <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                      <h6
                        className="fw-bold mb-4"
                        style={{ color: maroonMain }}
                      >
                        User Growth Analytics
                      </h6>
                      <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                          <AreaChart data={growthData}>
                            <defs>
                              <linearGradient
                                id="colorMaroon"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor={maroonMain}
                                  stopOpacity={0.3}
                                />
                                <stop
                                  offset="95%"
                                  stopColor={maroonMain}
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#eee"
                            />
                            <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Area
                              type="monotone"
                              dataKey="users"
                              stroke={maroonMain}
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#colorMaroon)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div> */}
                    <div className="bg-white rounded-xl shadow border overflow-x-auto">
                      <table className="min-w-full text-sm text-left">
                        {/* Header */}
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                          <tr>
                            <th className="px-4 py-3">{t('device_id')}</th>
                            <th className="px-4 py-3">{t('status')}</th>
                            <th className="px-4 py-3">{t('subscription')}</th>
                            <th className="px-4 py-3">{t('expires')}</th>
                            <th className="px-4 py-3">{t('registered')}</th>
                          </tr>
                        </thead>

                        {/* Body */}

                        <tbody>
                          {dashboard?.devices?.length > 0 ? (
                            dashboard.devices
                              .slice(0, 8)
                              .map((item, index) => (
                                <tr
                                  key={index}
                                  className="border-t hover:bg-gray-50"
                                >
                                  {/* Device ID */}
                                  <td className="px-3 line-clamp-1 truncate py-3 text-gray-600 flex items-center gap-2">
                                    <span>
                                      {item.deviceId?.slice(0, 8)}...
                                    </span>

                                    <button
                                      onClick={() =>
                                        copyToClipboard(item.deviceId)
                                      }
                                      className="text-blue-500 hover:text-blue-700 text-xs border px-2 py-1 rounded"
                                    >
                                      Copy
                                    </button>
                                  </td>

                                  {/* Status */}
                                  <td className="px-4 py-3">
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full font-semibold ${item.deviceStatus === "ACTIVE"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-600"
                                        }`}
                                    >
                                      {item.deviceStatus}
                                    </span>
                                  </td>

                                  {/* Subscription */}
                                  <td className="px-4 py-3">
                                    {item.subscriptionType}
                                  </td>

                                  {/* Status */}
                                  <td className="px-4 py-3">
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full font-semibold ${item.deviceStatus === "ACTIVE"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-600"
                                        }`}
                                    >
                                      {item.deviceStatus}
                                    </span>
                                  </td>

                                  {/* Registered */}
                                  <td className="px-4 py-3">
                                    {formatDate(item.registeredAt)}
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr className="w-full ">
                              <td colSpan="5" className="py-6">
                                <div className="w-full flex justify-center items-center text-gray-500">
                                  No devices found
                                </div>
                              </td>
                            </tr>
                          )}

                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
                      <h6
                        className="fw-bold mb-4"
                        style={{ color: maroonMain }}
                      >
                        Subscription Status
                      </h6>
                      <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={subStatusData}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {subStatusData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div> */}
                </div>
              </motion.div>
            )}

            {/* USERS SECTION */}
            {activeTab === "users" && <UserManagement />}

            {/* REQUESTS SECTION - Called the new component */}
            {activeTab === "requests" && (
              <RequestManagement
                containerVariants={containerVariants}
                maroonMain={maroonMain}
              />
            )}

            {activeTab === "subreseller" && (
              <SubReseller
                containerVariants={containerVariants}
                maroonMain={maroonMain}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
        .hover-card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
          cursor: pointer;
        }
        .hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05) !important;
        }
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
