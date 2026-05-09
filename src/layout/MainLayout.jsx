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

                {/* LANGUAGE */}
                <div style={{ position: "relative", zIndex: 3000 }}>
                  <div
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      border: "1px solid #e2e8f0",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "13px",
                      background: "#fff",
                      minWidth: "60px",
                      textAlign: "center",
                    }}
                  >
                    🌐 {i18n.language.toUpperCase()}
                  </div>

                  {isLangOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "120%",
                        right: 0,
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                        zIndex: 99999,
                        minWidth: "90px",
                      }}
                    >
                      {["en", "fr","pt","ar","de","it","nl","es"].map((lang) => (
                        <div
                          key={lang}
                          onClick={() => {
                            i18n.changeLanguage(lang);
                            setIsLangOpen(false);
                          }}
                          style={{
                            padding: "10px 14px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                            background:
                              i18n.language === lang
                                ? "#fdf2f2"
                                : "transparent",
                          }}
                        >
                          {lang}
                        </div>
                      ))}
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