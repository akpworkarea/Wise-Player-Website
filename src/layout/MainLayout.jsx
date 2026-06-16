import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../context/dashboardContext';
import { Menu, Flame, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Outside component — stable ────────────────────────────────
const availableLanguages = [
  { code: 'en', name: 'English',    flag: '🇺🇸', image: 'https://flagcdn.com/w40/us.png' },
  { code: 'fr', name: 'Français',   flag: '🇫🇷', image: 'https://flagcdn.com/w40/fr.png' },
  { code: 'es', name: 'Español',    flag: '🇪🇸', image: 'https://flagcdn.com/w40/es.png' },
  { code: 'de', name: 'Deutsch',    flag: '🇩🇪', image: 'https://flagcdn.com/w40/de.png' },
  { code: 'it', name: 'Italiano',   flag: '🇮🇹', image: 'https://flagcdn.com/w40/it.png' },
  { code: 'pt', name: 'Português',  flag: '🇵🇹', image: 'https://flagcdn.com/w40/pt.png' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', image: 'https://flagcdn.com/w40/nl.png' },
  { code: 'ar', name: 'العربية',    flag: '🇸🇦', image: 'https://flagcdn.com/w40/sa.png' },
];

const adminRoutes = [
  '/dashboard', '/users', '/requests', '/subreseller',
  '/purchase-credit', '/transition-history', '/payment-status',
];

const hideNavbarRoutes = ['/login', '/register', '/register-success', '/verify-otp','/reset-password'];

// ─────────────────────────────────────────────────────────────
const MainLayout = ({ children }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { dashboard } = useDashboard();

  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [isLangOpen,  setIsLangOpen]  = useState(false);

  const currentPath  = location.pathname.replace(/\/$/, '');
  const isAdmin      = adminRoutes.includes(currentPath);
  const hideNavbar   = hideNavbarRoutes.includes(currentPath);

  const currentLang = availableLanguages.find((l) => l.code === i18n.language);

  return (
    <div className="min-h-screen bg-[#f4f4f7]">

      {/* ── PUBLIC NAVBAR ──────────────────────────────── */}
      {!hideNavbar && !isAdmin && <Navbar />}

      {isAdmin ? (
        <div className="flex min-h-screen overflow-hidden">

          {/* ── SIDEBAR ──────────────────────────────────── */}
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />

          {/* ── MAIN CONTENT ─────────────────────────────── */}
          <div
            className={`
              flex-1 min-h-screen bg-[#f4f4f7] transition-all duration-300
              ml-0 w-full overflow-x-hidden
              ${collapsed ? 'md:ml-[80px]' : 'md:ml-[260px]'}
            `}
          >
            {/* ── TOPBAR ─────────────────────────────────── */}
            <div className="sticky top-0 z-[2000] bg-white border-b border-black/[0.06] shadow-sm px-4 py-3 flex items-center justify-between">

              {/* Left */}
              <div className="flex items-center gap-3">
                {/* Hamburger — mobile only */}
                <button
                  onClick={() => setMobileOpen(true)}
                  className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1a1a1a] transition-colors duration-150 border-0"
                >
                  <Menu size={18} />
                </button>

                {/* Brand label */}
                <div className="flex items-center gap-2">
                  <Flame size={18} fill="#800000" color="#800000" />
                  <h6 className="font-bold text-[#800000] m-0">
                    {t('navbar.layout.reseller_panel')}
                  </h6>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2">

                {/* Credit badge — same height as lang button */}
                <div className="h-9 flex items-center gap-1.5 px-4 rounded-full bg-[#800000] text-white text-xs font-bold border border-[#800000] shadow-sm">
                  💰 {dashboard?.stats?.creditCoin ?? 0}
                </div>

                {/* Language picker — h-9 to match */}
                <div className="relative z-[3000]">
                  <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="h-9 flex items-center gap-2 px-3 rounded-full bg-white border border-black/[0.08] shadow-sm text-sm font-bold text-[#1a1a1a] hover:border-[#800000]/40 transition-all duration-200"
                  >
                    <span className="text-base">🌐</span>
                    <span>{currentLang?.flag}</span>
                  </button>

                  <AnimatePresence>
                    {isLangOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0,  scale: 1    }}
                        exit={{   opacity: 0, y: -8,  scale: 0.96 }}
                        transition={{ duration: 0.16 }}
                        className="absolute top-12 right-0 w-[190px] bg-white rounded-2xl border border-black/[0.06] shadow-xl overflow-hidden"
                      >
                        {availableLanguages.map((lang) => {
                          const active = i18n.language === lang.code;
                          return (
                            <button
                              key={lang.code}
                              onClick={() => {
                                i18n.changeLanguage(lang.code);
                                localStorage.setItem('lang', lang.code);
                                setIsLangOpen(false);
                              }}
                              className={`
                                w-full flex items-center justify-between px-4 py-3
                                border-0 transition-colors duration-150
                                ${active ? 'bg-[#800000]/[0.04]' : 'bg-white hover:bg-gray-50'}
                              `}
                            >
                              <div className="flex items-center gap-3">
                                <img src={lang.image} alt={lang.name} className="w-5 h-5 rounded-full object-cover border border-gray-100" />
                                <div className="text-left">
                                  <p className="text-xs font-bold text-[#1a1a1a] leading-none">{lang.flag}</p>
                                  <p className="text-[11px] text-gray-400 mt-0.5">{lang.name}</p>
                                </div>
                              </div>
                              {active && (
                                <div className="w-2 h-2 rounded-full bg-[#800000] shadow-[0_0_0_3px_rgba(128,0,0,0.12)]" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>

            {/* ── PAGE CONTENT ─────────────────────────────── */}
            <div className="p-4">
              {children}
            </div>
          </div>
        </div>

      ) : (
        <div>{children}</div>
      )}
    </div>
  );
};

export default MainLayout;