import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, User, Lock, ArrowRight, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginReseller } from '../auth/apiservice';
import { useDashboard } from '../context/dashboardContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

// ── Animation variants ────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const viewVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:   { opacity: 0, x: -24, transition: { duration: 0.18 } },
};

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { refetchDashboard } = useDashboard();
  const { setUserRole } = useAuth();

  const [isLangOpen, setIsLangOpen]     = useState(false);
  const [view, setView]                 = useState('login');
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

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
    setTimeout(() => {
      setLoading(false);
      showToast('Reset link sent!', 'success');
    }, 1500);
  };

  const currentLang = availableLanguages.find((l) => l.code === i18n.language);

  return (
    <div className="fixed inset-0 bg-[#f4f4f7] flex flex-col">

      {/* ── LANG PICKER ──────────────────────────────────── */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.08] shadow-sm text-sm font-bold text-[#1a1a1a] hover:border-[#800000]/30 transition-all duration-200"
        >
          <span className="text-base">🌐</span>
          <span>{currentLang?.flag}</span>
        </button>

        <AnimatePresence>
          {isLangOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="absolute top-[48px] right-0 w-[200px] bg-white rounded-2xl border border-black/[0.06] shadow-xl overflow-hidden z-50"
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
                      text-left transition-colors duration-150 border-0
                      ${active ? 'bg-[#800000]/[0.04]' : 'bg-white hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={lang.image}
                        alt={lang.name}
                        className="w-6 h-6 rounded-full object-cover border border-gray-200"
                      />
                      <div className="text-left">
                        <p className="text-xs font-bold text-[#1a1a1a] leading-none">{lang.flag}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{lang.name}</p>
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

      {/* ── CENTER CONTENT ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center text-center mb-6"
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
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-7"
          >
            <AnimatePresence mode="wait">

              {/* ── LOGIN VIEW ─────────────────────────────── */}
              {view === 'login' ? (
                <motion.div
                  key="login"
                  variants={viewVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h5 className="text-lg font-extrabold text-[#1a1a1a] tracking-tight mb-1">
                    {t('sign_in_title')}
                  </h5>
                  <p className="text-sm text-gray-500 mb-6">
                    {t('sign_in_subtitle')}
                  </p>

                  <form onSubmit={handleLogin} className="space-y-4">

                    {/* Username */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {t('username') || 'Username'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <User size={15} />
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          placeholder="Enter username"
                          className="w-full h-11 pl-10 pr-4 rounded-xl border-2 border-gray-200 bg-white text-sm text-[#1a1a1a] outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15 transition-colors duration-200 placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {t('password') || 'Password'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <Lock size={15} />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Enter password"
                          className="w-full h-11 pl-10 pr-12 rounded-xl border-2 border-gray-200 bg-white text-sm text-[#1a1a1a] outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15 transition-colors duration-200 placeholder:text-gray-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition-colors duration-200"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Forgot */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setView('forgot')}
                        className="text-xs font-semibold text-gray-500 hover:text-[#800000] transition-colors duration-150 border-0 bg-transparent"
                      >
                        {t('forgot_password')}
                      </button>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`
                        w-full h-11 rounded-xl font-bold text-sm border-0
                        flex items-center justify-center gap-2
                        transition-all duration-200 active:scale-[0.98]
                        ${loading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#1a1a1a] hover:bg-black text-white shadow-sm hover:shadow-md cursor-pointer'
                        }
                      `}
                    >
                      {loading ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      ) : (
                        <>
                          {t('Sign_in')}
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>

                  </form>

                  {/* Register link */}
                  <p className="text-center text-xs text-gray-500 mt-5">
                    Don't have an account?{' '}
                    <button
                      onClick={() => navigate('/register')}
                      className="font-bold text-[#800000] hover:text-[#6a0000] transition-colors duration-150 border-0 bg-transparent"
                    >
                      {t('Register')}
                    </button>
                  </p>

                </motion.div>

              ) : (

                /* ── FORGOT VIEW ───────────────────────────── */
                <motion.div
                  key="forgot"
                  variants={viewVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <button
                    onClick={() => setView('login')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#800000] transition-colors duration-150 mb-5 border-0 bg-transparent"
                  >
                    <ArrowLeft size={14} />
                    {t('back_to_signin')}
                  </button>

                  <h5 className="text-lg font-extrabold text-[#1a1a1a] tracking-tight mb-1">
                    {t('recover_password')}
                  </h5>
                  <p className="text-sm text-gray-500 mb-6">
                    {t('recover_subtitle')}
                  </p>

                  <form onSubmit={handleForgot} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {t('username') || 'Username'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <User size={15} />
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          placeholder="Enter username"
                          className="w-full h-11 pl-10 pr-4 rounded-xl border-2 border-gray-200 bg-white text-sm text-[#1a1a1a] outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15 transition-colors duration-200 placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`
                        w-full h-11 rounded-xl font-bold text-sm border-0
                        flex items-center justify-center gap-2
                        transition-all duration-200 active:scale-[0.98]
                        ${loading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm cursor-pointer'
                        }
                      `}
                    >
                      {loading ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      ) : t('btn_send_recovery')}
                    </button>
                  </form>

                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>

        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 py-4 border-t border-black/[0.06] bg-white">
        <Shield size={15} className="text-green-500" />
        <span className="text-xs font-semibold text-gray-500">
          Authorized Access Only
        </span>
      </div>

      {/* ── TOAST ────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <div className="fixed top-5 left-0 right-0 z-[99999] flex justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className={`
                pointer-events-auto px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg
                ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-amber-500'}
              `}
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