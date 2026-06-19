import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, User, Lock, ArrowRight, Shield,
  ArrowLeft, Eye, EyeOff, Home, CheckCircle2,
  Mail, MailCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginReseller, forgotPassword } from '../auth/apiservice';
import { useDashboard } from '../context/dashboardContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

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
  { icon: Shield,       text: 'Secure reseller portal'  },
  { icon: CheckCircle2, text: 'Full dashboard access'   },
  { icon: Flame,        text: 'Premium streaming tools' },
];

const viewVariants = {
  hidden:  { opacity: 0, x: 20  },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.22, ease: 'easeOut' } },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.16 } },
};

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
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required
        className="w-full h-11 pl-10 pr-10 rounded-xl border-2 border-gray-200 bg-white text-sm text-[#1a1a1a] outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15 transition-colors duration-200 placeholder:text-gray-300"
      />
      {rightEl && <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">{rightEl}</div>}
    </div>
  </div>
);

const TopBar = ({ i18n, isLangOpen, setIsLangOpen, navigate }) => {
  const currentLang = availableLanguages.find((l) => l.code === i18n.language);
  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
      <button onClick={() => navigate('/home')}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/[0.08] shadow-sm text-[#1a1a1a] hover:border-[#800000]/40 hover:text-[#800000] transition-all duration-200">
        <Home size={16} />
      </button>
      <div className="relative">
        <button onClick={() => setIsLangOpen(!isLangOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-black/[0.08] shadow-sm text-sm font-bold text-[#1a1a1a] hover:border-[#800000]/40 transition-all duration-200">
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
                  <button key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); localStorage.setItem('lang', lang.code); setIsLangOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 border-0 transition-colors duration-150 ${active ? 'bg-[#800000]/[0.04]' : 'bg-white hover:bg-gray-50'}`}>
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

// ═══════════════════════════════════════════════════════════════════════════════
const LoginPage = () => {
  const { t, i18n }         = useTranslation();
  const navigate             = useNavigate();
  const { refetchDashboard } = useDashboard();
  const { setUserRole }      = useAuth();

  const [isLangOpen,   setIsLangOpen]   = useState(false);
  // views: 'login' | 'forgot' | 'sent'
  const [view,         setView]         = useState('login');
  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState(null);
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot-password specific state
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await loginReseller({ username, password });
    setLoading(false);

    if (result.success) {
      // Email verified → dashboard
      localStorage.setItem('userName', username);
      setUserRole(result.data?.role);
      showToast('Success! Redirecting...', 'success');
      setTimeout(() => navigate('/dashboard'), 800);
    } else if (result.data?.token) {
      // success=false but token present → unverified email → OTP page
      // token + user already stored in apiservice, just set role + redirect
      localStorage.setItem('userName', username);
      setUserRole(result.data?.role);
      showToast('Please verify your email to continue.', 'info');
      setTimeout(() => navigate('/verify-otp'), 900);
    } else {
      // No token → truly bad credentials
      showToast(result.message || 'Invalid credentials', 'error');
    }
  };

  // ── FORGOT PASSWORD ───────────────────────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    setResetError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setResetError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const result = await forgotPassword(resetEmail);
    setLoading(false);

    if (result.success) {
      setView('sent');
    } else {
      setResetError(result.message || 'Failed to send recovery email.');
    }
  };

  const resetForgotState = () => {
    setView('login');
    setResetEmail('');
    setResetError('');
  };

  return (
    <div className="min-h-screen bg-[#f4f4f7] flex flex-col lg:flex-row overflow-x-hidden">

      <TopBar i18n={i18n} isLangOpen={isLangOpen} setIsLangOpen={setIsLangOpen} navigate={navigate} />

      {/* ── LEFT BRAND PANEL ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1,  x: 0   }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[40%] bg-[#1a1a1a] flex-col items-center justify-between px-12 py-14 relative overflow-hidden shrink-0"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#800000]/15 blur-3xl pointer-events-none" />
        <div />
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
              <motion.div key={i}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#800000]/20 flex items-center justify-center shrink-0 border border-[#800000]/20">
                  <Icon size={16} className="text-[#800000]" />
                </div>
                <span className="text-sm font-medium text-gray-300">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="relative z-10 w-full border-t border-white/[0.06] pt-5 text-center">
          <p className="text-[10px] text-gray-600 tracking-[2px] uppercase">
            © {new Date().getFullYear()} WisePlayer — Premium Access
          </p>
        </div>
        <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-b-[70px] border-r-[70px] border-b-[#f4f4f7] border-r-transparent border-t-transparent border-l-transparent" />
      </motion.div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-14 sm:py-16 lg:py-10">
          <div className="w-full max-w-sm">

            {/* Mobile logo */}
            <motion.div
              initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
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
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-7"
            >
              <AnimatePresence mode="wait">

                {/* ── LOGIN VIEW ── */}
                {view === 'login' && (
                  <motion.div key="login" variants={viewVariants} initial="hidden" animate="visible" exit="exit">
                    <div className="text-center mb-6">
                      <h5 className="text-xl font-extrabold text-[#1a1a1a] tracking-tight">
                        {t('sign_in_title')}
                      </h5>
                      <p className="text-sm text-gray-500 mt-1">{t('sign_in_subtitle')}</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <InputField
                        label={t('username') || 'Username or Email'}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username or email"
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

                      <motion.button type="submit" disabled={loading}
                        whileHover={!loading ? { scale: 1.02 } : {}}
                        whileTap={!loading  ? { scale: 0.98 } : {}}
                        className={`w-full h-11 rounded-xl font-bold text-sm border-0 flex items-center justify-center gap-2 transition-colors duration-200
                          ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#1a1a1a] hover:bg-black text-white shadow-sm cursor-pointer'}`}>
                        {loading ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : (
                          <>{t('Sign_in')}<ArrowRight size={16} /></>
                        )}
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
                )}

                {/* ── FORGOT PASSWORD VIEW ── */}
                {view === 'forgot' && (
                  <motion.div key="forgot" variants={viewVariants} initial="hidden" animate="visible" exit="exit">
                    <button onClick={resetForgotState}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#800000] transition-colors duration-150 mb-5 border-0 bg-transparent">
                      <ArrowLeft size={14} />{t('back_to_signin')}
                    </button>

                    <div className="flex flex-col items-center text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 280 }}
                        className="w-14 h-14 rounded-2xl bg-[#800000]/10 flex items-center justify-center mb-3"
                      >
                        <Mail size={24} className="text-[#800000]" />
                      </motion.div>
                      <h5 className="text-xl font-extrabold text-[#1a1a1a] tracking-tight">
                        {t('recover_password') || 'Forgot password?'}
                      </h5>
                      <p className="text-sm text-gray-500 mt-1 max-w-xs">
                        {t('recover_subtitle') || "Enter your email and we'll send you a link to reset your password."}
                      </p>
                    </div>

                    <form onSubmit={handleForgot} className="space-y-4">
                      <InputField
                        label="Email Address"
                        value={resetEmail}
                        onChange={(e) => { setResetEmail(e.target.value); setResetError(''); }}
                        type="email"
                        placeholder="you@example.com"
                        icon={Mail}
                      />

                      <AnimatePresence>
                        {resetError && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
                          >
                            <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
                              {resetError}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button type="submit" disabled={loading}
                        whileHover={!loading ? { scale: 1.02 } : {}}
                        whileTap={!loading  ? { scale: 0.98 } : {}}
                        className={`w-full h-11 rounded-xl font-bold text-sm border-0 flex items-center justify-center gap-2 transition-colors duration-200
                          ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm cursor-pointer'}`}>
                        {loading ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : (
                          t('btn_send_recovery') || 'Send Recovery Link'
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* ── EMAIL SENT CONFIRMATION VIEW ── */}
                {view === 'sent' && (
                  <motion.div key="sent" variants={viewVariants} initial="hidden" animate="visible" exit="exit"
                    className="flex flex-col items-center text-center">
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 280 }}
                      className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
                    >
                      <MailCheck size={28} className="text-green-600" />
                    </motion.div>
                    <h5 className="text-xl font-extrabold text-[#1a1a1a] tracking-tight mb-1.5">
                      Check your inbox
                    </h5>
                    <p className="text-sm text-gray-500 max-w-xs mb-1">
                      We've sent a password reset link to
                    </p>
                    <p className="text-sm font-bold text-[#800000] mb-6 break-all">
                      {resetEmail}
                    </p>
                    <p className="text-xs text-gray-400 mb-6 max-w-xs leading-relaxed">
                      Click the link in the email to set a new password. The link will expire
                      after a short period for your security.
                    </p>

                    <button onClick={resetForgotState}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#800000] hover:text-[#6a0000] transition-colors duration-150 border-0 bg-transparent">
                      <ArrowLeft size={14} />{t('back_to_signin')}
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        <div className="border-t border-black/[0.06] bg-white py-3.5 flex items-center justify-center gap-2">
          <Shield size={14} className="text-green-500" />
          <span className="text-xs font-semibold text-gray-500">Authorized Access Only</span>
        </div>
      </div>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast && (
          <div className="fixed top-5 left-0 right-0 z-[99999] flex justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
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