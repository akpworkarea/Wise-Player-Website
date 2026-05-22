import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Layers, Clock,
  LogOut, ShoppingCart, CirclePlus, Menu, X, Flame,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { userRole } = useAuth();
  const { t } = useTranslation();

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const menuItems = [
    { path: '/dashboard',           label: t('dashboard'),             icon: LayoutDashboard },
    { path: '/users',               label: t('device_management'),     icon: Users           },
    userRole === 'RESELLER' && {
      path: '/subreseller',         label: t('sub_reseller'),          icon: Layers          },
    { path: '/requests',            label: t('activation_requests'),   icon: Clock           },
    { path: '/transition-history',  label: t('transaction_history'),   icon: CirclePlus      },
    { path: '/purchase-credit',     label: t('purchase_credit'),       icon: ShoppingCart    },
    { path: '/logout',              label: t('logout'),                icon: LogOut          },
  ].filter(Boolean);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <>
      {/* ── MOBILE OVERLAY ───────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[2000] md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <div
        className={`
          fixed top-0 left-0 h-full z-[3000] flex flex-col
          bg-[#800000] transition-all duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${collapsed ? 'md:w-[80px]' : 'md:w-[260px]'}
          w-[260px]
        `}
      >
        {/* Header */}
        <div className={`flex items-center px-4 py-4 border-b border-white/10 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Flame size={20} fill="white" color="white" />
              </div>
              <div className="leading-none">
                <span className="block text-sm font-black text-white tracking-tight">
                  RESELLER <span className="text-yellow-400">HUB</span>
                </span>
                <span className="block text-[10px] font-bold text-white/40 tracking-[2px] uppercase mt-0.5">
                  WisePlayer
                </span>
              </div>
            </div>
          )}

          {/* Collapse / close toggle */}
          <button
            onClick={() => collapsed ? setCollapsed(false) : mobileOpen ? setMobileOpen(false) : setCollapsed(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-150 border-0 bg-transparent"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isLogout = item.path === '/logout';

            return (
              <button
                key={item.path}
                onClick={() => {
                  if (isLogout) {
                    setShowLogoutPopup(true);
                  } else {
                    navigate(item.path);
                    setMobileOpen(false);
                  }
                }}
                className={`
                  w-full flex items-center gap-3 rounded-xl border-0
                  transition-all duration-200
                  ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-white text-[#800000] font-bold shadow-sm'
                    : isLogout
                      ? 'text-white/60 hover:text-white hover:bg-white/10'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={19} className="shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-semibold truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-white/10">
            <p className="text-[10px] text-white/30 font-semibold tracking-[2px] uppercase text-center">
              © {new Date().getFullYear()} WisePlayer
            </p>
          </div>
        )}
      </div>

      {/* ── LOGOUT MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {showLogoutPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[4000] flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-white rounded-2xl border border-black/[0.06] shadow-xl p-7 w-full max-w-[340px] text-center"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <LogOut size={22} className="text-red-500" />
              </div>

              <h5 className="text-base font-extrabold text-[#1a1a1a] mb-1">
                {t('confirm_logout')}
              </h5>
              <p className="text-sm text-gray-500 mb-6">
                {t('are_you_sure_logout')}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutPopup(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors duration-150 border-0"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => { setShowLogoutPopup(false); handleLogout(); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors duration-150 border-0 shadow-sm"
                >
                  {t('logout')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;