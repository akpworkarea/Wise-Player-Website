import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import UserManagement from "./UserManagement";
import RequestManagement from "./RequestManagement";
import SubReseller from "./Subreseller";
import { Users, CheckCircle, Clock, TrendingUp, TrendingDown, Smartphone, Wifi, WifiOff } from "lucide-react";
import { BsCoin } from "react-icons/bs";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
} from "chart.js";
import { formatDate } from "../auth/utilfunction";
import { useDashboard } from "../context/dashboardContext";
import { useAuth } from "../context/AuthContext";

ChartJS.register(ArcElement, Tooltip, Legend);

// ─── CopyButton — MODULE LEVEL (no flicker on copy state change) ──────────────
const CopyButton = ({ id, copiedId, onCopy, copyLabel, copiedLabel }) => {
  const isThis = copiedId === id;
  return (
    <div className="relative inline-flex shrink-0">
      <button
        onClick={() => onCopy(id)}
        className="text-[10px] border border-gray-300 px-2 py-0.5 rounded hover:bg-red-50 hover:border-[#800000] hover:text-[#800000] transition text-gray-500 whitespace-nowrap"
      >
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

// ─── StatCard — MODULE LEVEL ──────────────────────────────────────────────────
const StatCard = ({ icon: Icon, count, title, trend, trendUp, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    whileHover={{ y: -3 }}
    className="bg-white p-4 rounded-xl shadow border border-gray-200 transition-shadow hover:shadow-md"
  >
    <div className="flex justify-between items-start">
      <div className="p-2.5 bg-[#800000]/10 text-[#800000] rounded-xl">
        <Icon size={20} />
      </div>
      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full
        ${trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
        {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {trend}
      </span>
    </div>
    <h2 className="text-2xl font-black text-gray-900 mt-3">{count}</h2>
    <p className="text-xs text-gray-500 font-medium mt-0.5">{title}</p>
  </motion.div>
);

// ─── StatusPill — MODULE LEVEL ────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const active = status === "ACTIVE";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shrink-0
      ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
      {active ? <Wifi size={11} /> : <WifiOff size={11} />}
      {status}
    </span>
  );
};

// ─── SkeletonRow — MODULE LEVEL ───────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-t animate-pulse">
    {[34, 22, 22, 22].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 bg-gray-200 rounded mx-auto" style={{ width: `${w * 2}%` }} />
      </td>
    ))}
  </tr>
);

// ─── SkeletonCard — MODULE LEVEL ──────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-xl shadow border border-gray-200 animate-pulse space-y-2">
    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-5 bg-gray-200 rounded-full w-16" />
    </div>
    <div className="h-3 bg-gray-200 rounded w-1/2" />
    <div className="h-3 bg-gray-200 rounded w-2/3" />
  </div>
);

// ─── DeviceRow (desktop table) — MODULE LEVEL ─────────────────────────────────
const DeviceRow = ({ item, idx, copiedId, onCopy, truncateId, copyLabel, copiedLabel }) => (
  <tr className={`border-t text-center transition-colors hover:bg-red-50/30 ${idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"}`}>
    <td className="px-4 py-3">
      <div className="flex items-center justify-center gap-2 min-w-0">
        <span className="text-[#800000] font-semibold text-xs truncate min-w-0" title={item.deviceId}>
          {truncateId(item.deviceId)}
        </span>
        <span className="shrink-0">
          <CopyButton id={item.deviceId} copiedId={copiedId} onCopy={onCopy} copyLabel={copyLabel} copiedLabel={copiedLabel} />
        </span>
      </div>
    </td>
    <td className="px-4 py-3"><div className="flex justify-center"><StatusPill status={item.deviceStatus} /></div></td>
    <td className="px-4 py-3 text-gray-700 text-xs font-semibold">{item.subscriptionType}</td>
    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(item.registeredAt)}</td>
  </tr>
);

// ─── DeviceCard (mobile) — MODULE LEVEL ───────────────────────────────────────
const DeviceCard = ({ item, copiedId, onCopy, truncateId, copyLabel, copiedLabel, planLabel, registeredLabel }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-4 rounded-xl shadow border border-gray-200"
  >
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[#800000] font-semibold text-sm truncate" title={item.deviceId}>
          {truncateId(item.deviceId, 6, 4)}
        </span>
        <CopyButton id={item.deviceId} copiedId={copiedId} onCopy={onCopy} copyLabel={copyLabel} copiedLabel={copiedLabel} />
      </div>
      <StatusPill status={item.deviceStatus} />
    </div>
    <div className="text-xs text-gray-500 mt-2 space-y-0.5">
      <p>{planLabel}: <span className="font-semibold text-gray-700">{item.subscriptionType}</span></p>
      <p>{registeredLabel}: {formatDate(item.registeredAt)}</p>
    </div>
  </motion.div>
);

// ─── DonutCard — MODULE LEVEL, small meaningful chart in a card ──────────────
const DonutCard = ({ title, subtitle, data, options, legend, total, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow border border-gray-200 p-4"
  >
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      {Icon && (
        <div className="p-1.5 bg-[#800000]/10 text-[#800000] rounded-lg">
          <Icon size={14} />
        </div>
      )}
    </div>

    <div className="flex items-center gap-4">
      {/* Fixed-size donut — never causes layout overflow */}
      <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-black text-gray-900 leading-none">{total}</span>
          <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">total</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-gray-600 font-medium truncate">{item.label}</span>
            </div>
            <span className="font-bold text-gray-800 shrink-0">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);


// ═════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState("overview");
  const { dashboard, refetchDashboard } = useDashboard();
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Pull logged-in user details from localStorage (saved on login) ─────────
  const { userRole, user: storedUser } = useAuth();
  const displayName = storedUser.fullName || storedUser.username || "User";
  const avatarSeed  = encodeURIComponent(storedUser.username || storedUser.fullName || "user");
  const avatarUrl   = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${avatarSeed}`;

  // ── Role label for the "online" line ─────────────────────────────────────
  const roleLabel = userRole === "SUB_RESELLER" ? "Sub Reseller"
                  : userRole === "RESELLER"     ? "Reseller"
                  : "User";

  const truncateId = (id, start = 8, end = 4) => {
    if (!id) return "—";
    if (id.length <= start + end) return id;
    return `${id.slice(0, start)}…${id.slice(-end)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  useEffect(() => {
    setLoading(true);
    refetchDashboard().finally(() => setLoading(false));
  }, []);

  // ── Dynamic trend calculations from real dashboard stats ─────────────────
  // All derived from the same dashboard.stats data already on screen.
  const totalUsers = dashboard?.stats?.totalUsers ?? 0;
  const activeSub  = dashboard?.stats?.activeSub  ?? 0;
  const pending    = dashboard?.stats?.pending    ?? 0;
  const creditCoin = dashboard?.stats?.creditCoin ?? 0;

  // % of users who are active (shown on Total Users card)
  const activeRate = totalUsers > 0
    ? ((activeSub / totalUsers) * 100).toFixed(1)
    : "0.0";

  // % of total users who are on active subscription (shown on Active Subs card)
  const subRate = totalUsers > 0
    ? ((activeSub / totalUsers) * 100).toFixed(1)
    : "0.0";

  // % of total users who are pending (shown on Pending card)
  const pendingRate = totalUsers > 0
    ? ((pending / totalUsers) * 100).toFixed(1)
    : "0.0";

  // Coins per active user — meaningful ratio (shown on Coins card)
  const coinsPerUser = activeSub > 0
    ? (creditCoin / activeSub).toFixed(1)
    : creditCoin > 0 ? creditCoin : "0";

  const stats = [
    {
      title: t("total_users"),
      count: totalUsers,
      icon: Users,
      trend: `${activeRate}% active`,
      trendUp: parseFloat(activeRate) >= 50,
    },
    {
      title: t("active_subs"),
      count: activeSub,
      icon: CheckCircle,
      trend: `${subRate}% of users`,
      trendUp: parseFloat(subRate) >= 50,
    },
    {
      title: t("pending_req"),
      count: pending,
      icon: Clock,
      trend: `${pendingRate}% pending`,
      trendUp: false, // pending is always a concern — never show green
    },
    {
      title: t("total_coins"),
      count: creditCoin,
      icon: BsCoin,
      trend: `${coinsPerUser} per user`,
      trendUp: true,
    },
  ];

  // ── Device status split — Active vs Inactive, real data ──────────────────
  const statusChart = useMemo(() => {
    const devices = dashboard?.devices ?? [];
    const active   = devices.filter((d) => d.deviceStatus === "ACTIVE").length;
    const inactive = devices.length - active;
    return {
      total: devices.length,
      legend: [
        { label: "Active",   value: active,   color: "#16a34a" },
        { label: "Inactive", value: inactive, color: "#dc2626" },
      ],
      data: {
        labels: ["Active", "Inactive"],
        datasets: [{
          data: [active, inactive],
          backgroundColor: ["#16a34a", "#dc2626"],
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 4,
        }],
      },
    };
  }, [dashboard]);

  // ── Subscription plan distribution — real data, dynamic plan names ───────
  const planChart = useMemo(() => {
    const devices = dashboard?.devices ?? [];
    const palette = ["#800000", "#b45309", "#0284c7", "#7c3aed", "#0f766e", "#9333ea"];
    const counts = {};
    devices.forEach((d) => {
      const plan = d.subscriptionType || "Unknown";
      counts[plan] = (counts[plan] || 0) + 1;
    });
    const entries = Object.entries(counts);
    return {
      total: devices.length,
      legend: entries.map(([label, value], i) => ({
        label, value, color: palette[i % palette.length],
      })),
      data: {
        labels: entries.map(([label]) => label),
        datasets: [{
          data: entries.map(([, value]) => value),
          backgroundColor: entries.map((_, i) => palette[i % palette.length]),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 4,
        }],
      },
    };
  }, [dashboard]);

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1a1a",
        padding: 8,
        cornerRadius: 8,
        titleFont: { size: 11, weight: "500" },
        bodyFont: { size: 11 },
        displayColors: false,
      },
    },
  };

  const cardProps = {
    copiedId, onCopy: copyToClipboard, truncateId,
    copyLabel: t("admin_dashboard.copy") || "Copy",
    copiedLabel: t("admin_dashboard.copied") || "Copied!",
    planLabel: t("admin_dashboard.plan") || "Plan",
    registeredLabel: t("admin_dashboard.registered") || "Registered",
  };

  return (
   <div className="h-full flex flex-col overflow-hidden bg-[#f4f4f7]">
     <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pt-4 pb-4
                    [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-row items-center justify-between gap-2 mb-5">
        <h5 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500 truncate min-w-0">
          {t("admin_dashboard.panel")} /{" "}
          <span className="text-[#800000]">{t(`admin_dashboard.${activeTab}`)}</span>
        </h5>

        <div className="flex items-center gap-3">
          {/* Name + role — visible on all screen sizes, right-aligned */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{displayName}</p>
            <p className="text-xs text-green-600 flex items-center gap-1 justify-end mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              {roleLabel}
            </p>
          </div>

          {/* DiceBear avatar — fun-emoji style, seed = username so unique per user */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-10 h-10 rounded-full bg-[#800000]/10 border-2 border-[#800000]/20 overflow-hidden shrink-0 flex items-center justify-center"
          >
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if DiceBear fails (offline/network issue)
                e.target.style.display = "none";
                e.target.parentNode.classList.add("bg-[#800000]");
                e.target.parentNode.innerHTML = `<span class="text-white text-sm font-black">${displayName[0]?.toUpperCase() ?? "U"}</span>`;
              }}
            />
          </motion.div>
        </div>
      </div>

      <div className="space-y-6">

        {/* ── STATS GRID ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={s.title} {...s} delay={i * 0.07} />)}
        </div>

        {/* ── CHARTS — 2 small donut cards side by side, no scroll risk ────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DonutCard
            title="Device Status"
            subtitle="Active vs Inactive"
            data={statusChart.data}
            options={donutOptions}
            legend={statusChart.legend}
            total={statusChart.total}
            icon={Smartphone}
          />
          <DonutCard
            title="Subscription Plans"
            subtitle="Plan distribution"
            data={planChart.data}
            options={donutOptions}
            legend={planChart.legend}
            total={planChart.total}
            icon={CheckCircle}
          />
        </div>

        {/* ── DEVICE TABLE — desktop+tablet, table-fixed, NO horizontal scroll ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="hidden md:block bg-white rounded-xl shadow border border-gray-200 overflow-hidden"
        >
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: "34%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "22%" }} />
            </colgroup>
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3 text-center">{t("admin_dashboard.device_id")}</th>
                <th className="px-4 py-3 text-center">{t("admin_dashboard.status")}</th>
                <th className="px-4 py-3 text-center">{t("admin_dashboard.subscription")}</th>
                <th className="px-4 py-3 text-center">{t("admin_dashboard.registered")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : dashboard?.devices?.length > 0 ? (
                dashboard.devices.slice(0, 8).map((item, idx) => (
                  <DeviceRow key={item.deviceId} item={item} idx={idx} {...cardProps} />
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-400 font-semibold">
                    {t("admin_dashboard.no_devices_found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

        {/* ── DEVICE CARDS — mobile only ────────────────────────────────────── */}
        <div className="md:hidden space-y-3">
          {loading ? (
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          ) : dashboard?.devices?.length > 0 ? (
            dashboard.devices.slice(0, 8).map((item) => (
              <DeviceCard key={item.deviceId} item={item} {...cardProps} />
            ))
          ) : (
            <p className="text-center text-gray-400 font-semibold py-8">
              {t("admin_dashboard.no_devices")}
            </p>
          )}
        </div>

        {/* ── TABS ─────────────────────────────────────────────────────────── */}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "requests" && <RequestManagement />}
        {activeTab === "subreseller" && <SubReseller />}

      </div>
    </div>
    </div>
  );
};

export default Dashboard;