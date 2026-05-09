import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../context/dashboardContext";
import { Menu } from "lucide-react";

const maroonMain = "#800000";

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { dashboard } = useDashboard();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const adminRoutes = [
    "/dashboard",
    "/users",
    "/requests",
    "/subreseller",
    "/purchase-credit",
    "/transition-history",
    "/payment-status",
  ];

  const hideNavbarRoutes = ["/login", "/register", "/registersuccess"];

  const currentPath = location.pathname.replace(/\/$/, "");
  const isAdmin = adminRoutes.includes(currentPath);
  const hideNavbar = hideNavbarRoutes.includes(currentPath);

const availableLanguages = [
  {
    code: "en",
    short: "EN",
    name: "English",
    flag: "🇺🇸",
  },
  {
    code: "fr",
    short: "FR",
    name: "Français",
    flag: "🇫🇷",
  },
  {
    code: "es",
    short: "ES",
    name: "Español",
    flag: "🇪🇸",
  },
  {
    code: "de",
    short: "DE",
    name: "Deutsch",
    flag: "🇩🇪",
  },
  {
    code: "it",
    short: "IT",
    name: "Italiano",
    flag: "🇮🇹",
  },
  {
    code: "pt",
    short: "PT",
    name: "Português",
    flag: "🇵🇹",
  },
  {
    code: "nl",
    short: "NL",
    name: "Nederlands",
    flag: "🇳🇱",
  },
  {
    code: "ar",
    short: "AR",
    name: "العربية",
    flag: "🇸🇦",
  },
];
  return (
    <div>
      {/* PUBLIC NAVBAR */}
      {!hideNavbar && !isAdmin && <Navbar />}

      {isAdmin ? (
        <div className="flex min-h-screen overflow-hidden">
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />

          {/* MAIN CONTENT */}
          <div
  className={`
    flex-1 min-h-screen bg-[#f8f9fa] transition-all duration-300
    ml-0
    ${collapsed ? "md:ml-[90px]" : "md:ml-[260px]"}
    w-full
    overflow-x-hidden
  `}
>
            {/* HEADER */}

            <div className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-50"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2000, // ✅ IMPORTANT
                overflow: "visible", // ✅ IMPORTANT
              }}
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">
                {/* HAMBURGER (ONLY MOBILE) */}
                <button
                  onClick={() => setMobileOpen(true)}
                  className="md:hidden p-2 rounded bg-gray-100"
                >
                  <Menu size={20} />
                </button>

                <h6 className="font-bold m-0" style={{ color: maroonMain }}>
                  {t("reseller_panel")}
                </h6>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3">

              {/* 🌐 LANGUAGE */}
<div style={{ position: "relative", zIndex: 3000 }}>
  {/* SELECT BUTTON */}
  <div
    onClick={() => setIsLangOpen(!isLangOpen)}
    style={{
      height: "36px",
      padding: "0 12px",
      borderRadius: "20px",
      border: "1px solid #e5e7eb",
      background: "#fff",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}
  >
    <span style={{ fontSize: "15px" }}>🌐</span>

    <span>
      {
        availableLanguages.find(
          (lang) => lang.code === i18n.language
        )?.short
      }
    </span>
  </div>

  {/* DROPDOWN */}
  {isLangOpen && (
    <div
      style={{
        position: "absolute",
        top: "110%",
        right: 0,
        width: "120px",
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
        zIndex: 99999,
      }}
    >
      {availableLanguages.map((lang) => {
        const active = i18n.language === lang.code;

        return (
          <div
            key={lang.code}
            onClick={() => {
              i18n.changeLanguage(lang.code);
              localStorage.setItem("lang", lang.code);

              document.documentElement.dir =
                lang.code === "ar" ? "rtl" : "ltr";

              setIsLangOpen(false);
            }}
            style={{
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              background: active ? "#f9f5f5" : "#fff",
              transition: "0.2s",
            }}
          >
            {/* LEFT */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "16px" }}>
                {lang.flag}
              </span>

              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    lineHeight: 1.2,
                  }}
                >
                  {lang.short}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    lineHeight: 1.2,
                  }}
                >
                  {lang.name}
                </div>
              </div>
            </div>

            {/* ACTIVE */}
            {active && (
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#800000",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  )}
</div>

                {/* 💰 CREDIT */}
                <div
                  style={{
                    background: maroonMain,
                    color: "#fff",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  💰 {dashboard?.stats?.creditCoin ?? 0}
                </div>
              </div>
            </div>

            {/* PAGE */}
            <div style={{ padding: "16px" }}>{children}</div>
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
};

export default MainLayout;