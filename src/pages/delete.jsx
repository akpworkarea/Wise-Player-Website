import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { purchaseCredit } from "../auth/creditManagement";
import { useAuth } from "../context/AuthContext";
import { purchaseSubResellerCredit } from "../auth/subReseller/creditManagement";
import { useNavigate } from "react-router-dom";
import { useRefresh } from "../context/RefreshContext";
import { MessageSquare, Gift, X, ExternalLink, Zap, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

// ─────────────────────────────────────────────
// COIN CALCULATOR
// ─────────────────────────────────────────────
const CoinCalculator = ({ onBulkOffer }) => {
  const { triggerTransactionRefresh } = useRefresh();
  const navigate = useNavigate();
  const [coins, setCoins] = useState("");
  const [price, setPrice] = useState(0);
  const [activeTier, setActiveTier] = useState(null);
  const { userRole } = useAuth();
  const { t } = useTranslation();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const payerId = params.get("PayerID");
  const paymentStatus = params.get("paymentStatus");

  useEffect(() => {
    if ((token && payerId) || paymentStatus === "success") {
      triggerTransactionRefresh();
      window.history.replaceState({}, document.title, window.location.pathname);
      if (token && payerId) {
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    }
  }, [token, payerId, paymentStatus, triggerTransactionRefresh, navigate]);

  const tiers = [
    { min: 10,   max: 10,       rate: 2.5  },
    { min: 11,   max: 49,       rate: 2.2  },
    { min: 50,   max: 99,       rate: 2.0  },
    { min: 100,  max: 199,      rate: 1.75 },
    { min: 200,  max: 499,      rate: 1.5  },
    { min: 500,  max: 999,      rate: 1.25 },
    { min: 1000, max: Infinity, rate: 1.0  },
  ];

  const calculatePrice = (value) => {
    const coinValue = Number(value) || 0;
    setCoins(value);
    const tier = tiers.find((tr) => coinValue >= tr.min && coinValue <= tr.max);
    if (tier) {
      setPrice((coinValue * tier.rate).toFixed(2));
      setActiveTier(tier);
    } else {
      setPrice(0);
      setActiveTier(null);
    }
  };

  const handleBuy = async () => {
    const coinCount = Number(coins);
    if (coinCount < 10) {
      alert("Coins should be at least 10");
      return;
    }
    let res;
    if (userRole === "SUB_RESELLER") {
      res = await purchaseSubResellerCredit(coinCount);
    } else {
      res = await purchaseCredit(coinCount);
    }
    if (res?.success === false && res?.message?.includes("bonus")) {
      onBulkOffer(res.message);
      return;
    }
    if (res?.data?.checkoutUrl) {
      window.location.href = res.data.checkoutUrl;
    } else if (res?.success === false) {
      alert(res.message || "Failed to initiate payment");
    }
  };

  const isReady = Number(coins) >= 10;

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-5 w-full">

      {/* Title row */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-red-50 text-[#800000] rounded-md">
          <Zap size={18} />
        </div>
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          {t("purchaseCredit.calculate_price")}
        </h2>
      </div>

      {/* Coin input */}
      <div className="relative mb-3">
        <input
          type="number"
          placeholder={t("purchaseCredit.enter_coins")}
          value={coins}
          onChange={(e) => calculatePrice(e.target.value)}
          className="w-full px-4 py-3 bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-base font-semibold text-gray-800 pr-16"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold uppercase tracking-wider pointer-events-none">
          {t("purchaseCredit.coins")}
        </span>
      </div>

      {/* Active tier pill */}
      {activeTier && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-[#800000] shrink-0" />
          <p className="text-xs text-[#800000] font-semibold">
            Rate: {activeTier.rate} per coin
          </p>
        </div>
      )}

      {/* Price + buy */}
      <div className="flex items-stretch gap-3">
        <div className="flex-1 bg-[#f4f4f7] border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
            {t("purchaseCredit.total_price")}
          </p>
          <p className="text-xl font-black text-[#800000] leading-none">
            {price} EUR
          </p>
        </div>

        <button
          onClick={handleBuy}
          disabled={!isReady}
          className={[
            "px-6 py-3 rounded-xl font-bold text-sm transition active:scale-95 shrink-0",
            isReady
              ? "bg-[#800000] text-white hover:bg-[#6a0000] cursor-pointer shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed",
          ].join(" ")}
        >
          {t("purchaseCredit.buy_credits")}
        </button>
      </div>

    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────
export default function PurchaseCredit() {
  const { t } = useTranslation();
  const [bulkOffer, setBulkOffer] = useState(null);

  const tiers = [
    { range: "10",           price: "2.50 EUR", badge: "Standard",   badgeClass: "bg-gray-100 text-gray-500"         },
    { range: "11 - 49",      price: "2.20 EUR", badge: "Starter",    badgeClass: "bg-blue-50 text-blue-600"          },
    { range: "50 - 99",      price: "2.00 EUR", badge: "Pro",        badgeClass: "bg-indigo-50 text-indigo-600"      },
    { range: "100 - 199",    price: "1.75 EUR", badge: "Elite",      badgeClass: "bg-amber-50 text-amber-600"        },
    { range: "200 - 499",    price: "1.50 EUR", badge: "Wholesale",  badgeClass: "bg-orange-50 text-orange-600"      },
    { range: "500 - 999",    price: "1.25 EUR", badge: "Mega",       badgeClass: "bg-red-50 text-red-600"            },
    { range: "1000+",        price: "1.00 EUR", badge: "Enterprise", badgeClass: "bg-red-100 text-[#800000]"         },
  ];

  const customerPlans = [
    { label: t("purchaseCredit.one_code_annual"), price: "5.99 EUR"  },
    { label: t("purchaseCredit.two_codes_offer"), price: "14.99 EUR" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f7] w-full p-4 sm:p-6 space-y-6">

      {/* ── BULK OFFER MODAL ── */}
      <AnimatePresence>
        {bulkOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-md w-full"
            >
              {/* Modal header */}
              <div className="bg-[#800000] p-6 text-white text-center relative">
                <button
                  onClick={() => setBulkOffer(null)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-full transition"
                >
                  <X size={18} />
                </button>
                <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Gift size={28} className="text-white" />
                </div>
                <h2 className="text-xl font-bold mb-1">
                  {t("purchaseCredit.exclusive_bulk_offer")}
                </h2>
                <p className="text-red-200 text-sm">
                  {t("purchaseCredit.special_bonus_available")}
                </p>
              </div>

              {/* Modal body */}
              <div className="p-6">
                <div className="bg-[#f4f4f7] border border-gray-200 rounded-xl p-5 mb-6">
                  <p className="text-gray-700 text-center leading-relaxed font-medium text-sm">
                    {bulkOffer}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
  <a
    href="https://wa.me/212676076001"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition active:scale-95 text-sm"
  >
                    <MessageSquare size={18} />
                    <span>{t("purchaseCredit.contact_on_whatsapp")}</span>
                    <ExternalLink size={14} className="opacity-60" />
                  </a>
                  <button
                    onClick={() => setBulkOffer(null)}
                    className="py-2.5 text-gray-500 font-semibold hover:text-gray-700 transition text-sm"
                  >
                    {t("purchaseCredit.maybe_later")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGE HEADER ── */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg sm:text-xl font-bold text-[#800000]"
        >
          {t("purchaseCredit.credits_system")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-sm text-gray-500 mt-1"
        >
          {t("purchaseCredit.credits_system_desc")}
        </motion.p>
      </div>

      {/* ── CUSTOMER PRICING ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow border border-gray-200 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-red-50 text-[#800000] rounded-md">
            <Gift size={18} />
          </div>
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            {t("purchaseCredit.customer_pricing")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {customerPlans.map((plan, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-[#f4f4f7] border border-gray-200 rounded-xl px-4 py-3"
            >
              <span className="text-sm text-gray-700 font-semibold">
                {plan.label}
              </span>
              <span className="text-base font-black text-[#800000]">
                {plan.price}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── RESELLER PRICING ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-xl shadow border border-gray-200 p-5"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-red-50 text-[#800000] rounded-md">
            <Tag size={18} />
          </div>
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            {t("purchaseCredit.reseller_pricing")}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pricing table — table-fixed, no horizontal scroll */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{ width: "62%" }} />
                <col style={{ width: "38%" }} />
              </colgroup>
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                    {t("purchaseCredit.quantity_codes")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">
                    {t("purchaseCredit.unit_price")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tiers.map((tier, index) => (
                  <tr
                    key={index}
                    className="hover:bg-red-50/40 transition group cursor-default"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 text-sm">
                          {tier.range}
                        </span>
                        <span className={[
                          "text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full",
                          tier.badgeClass,
                        ].join(" ")}>
                          {tier.badge}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {tier.range === "1000+" && (
  <a
    href="https://wa.me/212676076001"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-green-100 text-green-600 p-1.5 rounded-lg hover:bg-green-600 hover:text-white transition shrink-0"
    title={t("purchaseCredit.contact_for_bulk_bonus")}
  >
                            <MessageSquare size={14} />
                          </a>
                        )}
                        <span className="text-base font-black text-[#800000] group-hover:scale-105 inline-block transition-transform">
                          {tier.price}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculator */}
          <div className="w-full">
            <CoinCalculator onBulkOffer={setBulkOffer} />
          </div>

        </div>
      </motion.div>

    </div>
  );
}import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, User, Lock, ArrowRight, Shield,
  ArrowLeft, Eye, EyeOff, Home, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginReseller } from '../auth/apiservice';
import { useDashboard } from '../context/dashboardContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

// ── Outside component — stable references ─────────────────────
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

const brandFeatures = [
  { icon: Shield,       text: 'Secure reseller portal'   },
  { icon: CheckCircle2, text: 'Full dashboard access'    },
  { icon: Flame,        text: 'Premium streaming tools'  },
];

const viewVariants = {
  hidden:  { opacity: 0, x: 20  },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.22, ease: 'easeOut' } },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.16 } },
};

// ── Reusable Input — outside to prevent remount ───────────────
const InputField = ({ label, value, onChange, type = 'text', placeholder, icon: Icon, rightEl }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
        <Icon size={15} />
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full h-11 pl-10 pr-10 rounded-xl border-2 border-gray-200 bg-white text-sm text-[#1a1a1a] outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15 transition-colors duration-200 placeholder:text-gray-300"
      />
      {rightEl && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">{rightEl}</div>
      )}
    </div>
  </div>
);

// ── Lang + Home top bar — shared pattern ──────────────────────
const TopBar = ({ i18n, isLangOpen, setIsLangOpen, navigate }) => {
  const currentLang = availableLanguages.find((l) => l.code === i18n.language);
  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
      {/* Home */}
      <button
        onClick={() => navigate('/home')}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/[0.08] shadow-sm text-[#1a1a1a] hover:border-[#800000]/40 hover:text-[#800000] transition-all duration-200"
      >
        <Home size={16} />
      </button>

      {/* Lang */}
      <div className="relative">
        <button
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-black/[0.08] shadow-sm text-sm font-bold text-[#1a1a1a] hover:border-[#800000]/40 transition-all duration-200"
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
              className="absolute top-12 right-0 w-[200px] bg-white rounded-2xl border border-black/[0.06] shadow-xl overflow-hidden"
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
                    className={`w-full flex items-center justify-between px-4 py-3 border-0 transition-colors duration-150 ${active ? 'bg-[#800000]/[0.04]' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={lang.image} alt={lang.name} className="w-6 h-6 rounded-full object-cover border border-gray-100" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-[#1a1a1a] leading-none">{lang.flag}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{lang.name}</p>
                      </div>
                    </div>
                    {active && <div className="w-2 h-2 rounded-full bg-[#800000] shadow-[0_0_0_3px_rgba(128,0,0,0.12)]" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { refetchDashboard } = useDashboard();
  const { setUserRole } = useAuth();

  const [isLangOpen,   setIsLangOpen]   = useState(false);
  const [view,         setView]         = useState('login');
  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState(null);
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await loginReseller({ username, password });
    setLoading(false);
    if (result.success) {
      showToast('Success! Redirecting...', 'success');
      localStorage.setItem('user', JSON.stringify(result.data));
      setUserRole(result?.data?.role);
      localStorage.setItem('userName', username);
      await refetchDashboard();
      navigate('/dashboard');
    } else {
      showToast(result.message || 'Invalid credentials', 'error');
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); showToast('Reset link sent!', 'success'); }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f7] flex flex-col lg:flex-row overflow-x-hidden">

      <TopBar i18n={i18n} isLangOpen={isLangOpen} setIsLangOpen={setIsLangOpen} navigate={navigate} />

      {/* ── LEFT BRAND PANEL ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1,  x: 0   }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[40%] bg-[#1a1a1a] flex-col items-center justify-between px-12 py-14 relative overflow-hidden shrink-0"
      >
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#800000]/15 blur-3xl pointer-events-none" />

        {/* Top spacer */}
        <div />

        {/* Center content */}
        <div className="relative z-10 text-center w-full max-w-xs">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl bg-[#800000]/20 border border-[#800000]/30 flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Flame size={40} fill="#800000" color="#800000" />
          </motion.div>

          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            WISE <span className="text-[#800000]">PLAYER</span>
          </h1>
          <p className="text-xs text-gray-500 tracking-[3px] uppercase mb-10">
            {t('activation.tagline')}
          </p>

          <div className="space-y-3 text-left">
            {brandFeatures.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1,  x: 0   }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[#800000]/20 flex items-center justify-center shrink-0 border border-[#800000]/20">
                  <Icon size={16} className="text-[#800000]" />
                </div>
                <span className="text-sm font-medium text-gray-300">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Fixed bottom footer inside panel */}
        <div className="relative z-10 w-full border-t border-white/[0.06] pt-5 text-center">
          <p className="text-[10px] text-gray-600 tracking-[2px] uppercase">
            © {new Date().getFullYear()} WisePlayer — Premium Access
          </p>
        </div>

        {/* Corner fold */}
        <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-b-[70px] border-r-[70px] border-b-[#f4f4f7] border-r-transparent border-t-transparent border-l-transparent" />
      </motion.div>

      {/* ── RIGHT FORM PANEL ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">

        {/* Scrollable center */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-14 sm:py-16 lg:py-10">
          <div className="w-full max-w-sm">

            {/* Mobile logo */}
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0,   opacity: 1  }}
              transition={{ duration: 0.4 }}
              className="flex lg:hidden flex-col items-center text-center mb-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-3 shadow-md">
                <Flame size={28} fill="#800000" color="#800000" />
              </div>
              <h2 className="text-2xl font-black text-[#1a1a1a] tracking-tight">
                WISE <span className="text-[#800000]">PLAYER</span>
              </h2>
              <span className="mt-2 px-3 py-1 rounded-full bg-[#1a1a1a] text-white text-[10px] font-bold tracking-widest uppercase">
                {t('reseller_portal')}
              </span>
            </motion.div>

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-7"
            >
              <AnimatePresence mode="wait">

                {/* LOGIN */}
                {view === 'login' ? (
                  <motion.div key="login" variants={viewVariants} initial="hidden" animate="visible" exit="exit">

                    {/* Centered heading */}
                    <div className="text-center mb-6">
                      <h5 className="text-xl font-extrabold text-[#1a1a1a] tracking-tight">
                        {t('sign_in_title')}
                      </h5>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('sign_in_subtitle')}
                      </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <InputField
                        label={t('username') || 'Username'}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        icon={User}
                      />
                      <InputField
                        label={t('password') || 'Password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        icon={Lock}
                        rightEl={
                          <button type="button" onClick={() => setShowPassword((p) => !p)}
                            className="text-gray-400 hover:text-[#800000] transition-colors duration-150 border-0 bg-transparent p-0">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        }
                      />

                      <div className="flex justify-end">
                        <button type="button" onClick={() => setView('forgot')}
                          className="text-xs font-semibold text-gray-500 hover:text-[#800000] transition-colors duration-150 border-0 bg-transparent">
                          {t('forgot_password')}
                        </button>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={!loading ? { scale: 1.02 } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                        className={`w-full h-11 rounded-xl font-bold text-sm border-0 flex items-center justify-center gap-2 transition-colors duration-200
                          ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#1a1a1a] hover:bg-black text-white shadow-sm cursor-pointer'}`}
                      >
                        {loading
                          ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                          : <>{t('Sign_in')}<ArrowRight size={16} /></>
                        }
                      </motion.button>
                    </form>

                    <p className="text-center text-xs text-gray-500 mt-5">
                      Don't have an account?{' '}
                      <button onClick={() => navigate('/register')}
                        className="font-bold text-[#800000] hover:text-[#6a0000] transition-colors duration-150 border-0 bg-transparent">
                        {t('Register')}
                      </button>
                    </p>
                  </motion.div>

                ) : (
                  /* FORGOT */
                  <motion.div key="forgot" variants={viewVariants} initial="hidden" animate="visible" exit="exit">
                    <button onClick={() => setView('login')}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#800000] transition-colors duration-150 mb-5 border-0 bg-transparent">
                      <ArrowLeft size={14} />{t('back_to_signin')}
                    </button>

                    <div className="text-center mb-6">
                      <h5 className="text-xl font-extrabold text-[#1a1a1a] tracking-tight">{t('recover_password')}</h5>
                      <p className="text-sm text-gray-500 mt-1">{t('recover_subtitle')}</p>
                    </div>

                    <form onSubmit={handleForgot} className="space-y-4">
                      <InputField
                        label={t('username') || 'Username'}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        icon={User}
                      />
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={!loading ? { scale: 1.02 } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                        className={`w-full h-11 rounded-xl font-bold text-sm border-0 flex items-center justify-center gap-2 transition-colors duration-200
                          ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm cursor-pointer'}`}
                      >
                        {loading
                          ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                          : t('btn_send_recovery')
                        }
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Fixed footer inside right panel */}
        <div className="border-t border-black/[0.06] bg-white py-3.5 flex items-center justify-center gap-2">
          <Shield size={14} className="text-green-500" />
          <span className="text-xs font-semibold text-gray-500">Authorized Access Only</span>
        </div>
      </div>

      {/* ── TOAST ────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <div className="fixed top-5 left-0 right-0 z-[99999] flex justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0   }}
              exit={{   opacity: 0, y: -16  }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg
                ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-amber-500'}`}
            >
              {toast.msg}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;