import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../context/dashboardContext";
import { Earth, Menu } from "lucide-react";

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
      short: "🇺🇸",
      name: "English",
      flag: "🇺🇸",
      image: "https://flagcdn.com/w40/us.png",
    },
    {
      code: "fr",
      short: "🇫🇷",
      name: "Français",
      flag: "🇫🇷",
      image: "https://flagcdn.com/w40/fr.png",
    },
    {
      code: "es",
      short: "🇪🇸",
      name: "Español",
      flag: "🇪🇸",
      image: "https://flagcdn.com/w40/es.png",
    },
    {
      code: "de",
      short: "🇩🇪",
      name: "Deutsch",
      flag: "🇩🇪",
      image: "https://flagcdn.com/w40/de.png",
    },
    {
      code: "it",
      short: "🇮🇹",
      name: "Italiano",
      flag: "🇮🇹",
      image: "https://flagcdn.com/w40/it.png",
    },
    {
      code: "pt",
      short: "🇵🇹",
      name: "Português",
      flag: "🇵🇹",
      image: "https://flagcdn.com/w40/pt.png",
    },
    {
      code: "nl",
      short: "🇳🇱",
      name: "Nederlands",
      flag: "🇳🇱",
      image: "https://flagcdn.com/w40/nl.png",
    },
    {
      code: "ar",
      short: "🇸🇦",
      name: "العربية",
      flag: "🇸🇦",
      image: "https://flagcdn.com/w40/sa.png",
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
            <div
              className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-50"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2000,
                overflow: "visible",
              }}
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">
                {/* HAMBURGER */}
                <button
                  onClick={() => setMobileOpen(true)}
                  className="md:hidden p-2 rounded bg-gray-100"
                >
                  <Menu size={20} />
                </button>

                <h6 className="font-bold m-0" style={{ color: maroonMain }}>
                  {t("navbar.layout.reseller_panel")}
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
                      height: "38px",
                      padding: "0 14px",
                      borderRadius: "22px",
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      transition: "0.2s ease",
                      userSelect: "none",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>🌐</span>


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
                        top: "115%",
                        right: 0,
                        width: "180px",
                        background: "#fff",
                        border: "1px solid #eee",
                        borderRadius: "14px",
                        overflow: "hidden",
                        boxShadow: "0 12px 28px rgba(0,0,0,0.14)",
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

                              // document.documentElement.dir =
                              //   lang.code === "ar" ? "rtl" : "ltr";

                              setIsLangOpen(false);
                            }}
                            style={{
                              padding: "11px 14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                              background: active ? "#f9f5f5" : "#fff",
                              borderBottom: "1px solid #f3f4f6",
                              transition: "0.2s ease",
                            }}
                          >
                            {/* LEFT */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <img
                                src={lang.image}
                                alt={lang.name}
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />

                              <div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    lineHeight: 1.2,
                                    color: "#111827",
                                  }}
                                >
                                  {lang.short}
                                </div>

                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#6b7280",
                                    lineHeight: 1.2,
                                    marginTop: "2px",
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
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  background: "#800000",
                                  boxShadow: "0 0 0 3px rgba(128,0,0,0.12)",
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CREDIT */}
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