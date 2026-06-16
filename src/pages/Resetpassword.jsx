import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Lock, Eye, EyeOff, ArrowRight, Shield,
  CheckCircle2, Circle, AlertCircle, Home,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../auth/apiservice';
import { useTranslation } from 'react-i18next';

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

const getValidations = (password) => ({
  hasSpecial:    /[!@#$%^&*(),.?":{}|<>]/.test(password),
  hasNumber:     /\d/.test(password),
  hasLower:      /[a-z]/.test(password),
  hasUpper:      /[A-Z]/.test(password),
  isLengthValid: password.length >= 8,
});

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

// ═════════════════════════════════════════════════════════════════════════════
const ResetPassword = () => {
  const { t, i18n }      = useTranslation();
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();
  const token             = searchParams.get('token') || '';

  const [isLangOpen,      setIsLangOpen]      = useState(false);
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState(false);

  const v = getValidations(newPassword);
  const passwordPills = [
    { label: '8+',  done: v.isLengthValid },
    { label: 'A-Z', done: v.hasUpper      },
    { label: 'a-z', done: v.hasLower      },
    { label: '0-9', done: v.hasNumber     },
    { label: '!@#', done: v.hasSpecial    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset link. Please request a new one.');
      return;
    }
    if (!v.hasSpecial || !v.hasNumber || !v.hasLower || !v.hasUpper || !v.isLengthValid) {
      setError('Password must meet all the requirements below.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, newPassword);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } else {
      setError(result.message || 'Failed to reset password. The link may have expired.');
    }
  };

  // ── No token in URL — invalid link state ───────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-[#f4f4f7] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-black/[0.06] max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <h2 className="text-lg font-black text-gray-900 mb-2">Invalid Reset Link</h2>
          <p className="text-sm text-gray-500 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button onClick={() => navigate('/login')}
            className="w-full h-11 rounded-xl font-bold text-sm bg-[#800000] hover:bg-[#6a0000] text-white transition-colors border-0 cursor-pointer">
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Success state ───────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#f4f4f7] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="bg-white rounded-3xl p-10 shadow-xl text-center max-w-sm w-full"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
            className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle2 size={40} className="text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Password Reset!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your password has been changed successfully. Redirecting to login…
          </p>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }} animate={{ width: '100%' }}
              transition={{ duration: 1.8, ease: 'linear' }}
              className="h-full bg-[#800000] rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4f4f7] flex flex-col lg:flex-row overflow-x-hidden">

      <TopBar i18n={i18n} isLangOpen={isLangOpen} setIsLangOpen={setIsLangOpen} navigate={navigate} />

      {/* ── LEFT BRAND PANEL ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[38%] bg-[#1a1a1a] flex-col items-center justify-center px-12 py-14 relative overflow-hidden shrink-0"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#800000]/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 text-center w-full max-w-xs">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl bg-[#800000]/20 border border-[#800000]/30 flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Lock size={36} className="text-[#800000]" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            WISE<span className="text-[#800000]">PLAYER</span>
          </h1>
          <p className="text-xs text-gray-500 tracking-[3px] uppercase">
            Secure Password Reset
          </p>
        </div>
        <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-b-[70px] border-r-[70px] border-b-[#f4f4f7] border-r-transparent border-t-transparent border-l-transparent" />
      </motion.div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-14 lg:py-8">
          <div className="w-full max-w-sm">

            {/* Mobile logo */}
            <motion.div
              initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex lg:hidden flex-col items-center mb-7"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-3 shadow-md">
                <Flame size={28} fill="#800000" color="#800000" />
              </div>
              <h2 className="text-2xl font-black text-[#1a1a1a] tracking-tight">
                WISE<span className="text-[#800000]">PLAYER</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-7"
            >
              <div className="flex flex-col items-center text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 280 }}
                  className="w-14 h-14 rounded-2xl bg-[#800000]/10 flex items-center justify-center mb-3"
                >
                  <Lock size={24} className="text-[#800000]" />
                </motion.div>
                <h5 className="text-xl font-extrabold text-[#1a1a1a] tracking-tight">
                  Set new password
                </h5>
                <p className="text-sm text-gray-500 mt-1">
                  Choose a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="New Password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'} placeholder="••••••••" icon={Lock}
                  rightEl={
                    <button type="button" onClick={() => setShowPassword((p) => !p)}
                      className="text-gray-400 hover:text-[#800000] transition-colors duration-150 border-0 bg-transparent p-0">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />

                {/* Validation pills */}
                <AnimatePresence>
                  {newPassword && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                        {passwordPills.map(({ label, done }) => (
                          <motion.span key={label}
                            animate={{ backgroundColor: done ? '#dcfce7' : '#f3f4f6' }}
                            transition={{ duration: 0.25 }}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${done ? 'text-green-700' : 'text-gray-400'}`}>
                            {done ? <CheckCircle2 size={10} /> : <Circle size={10} />}{label}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <InputField
                  label="Confirm New Password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirm ? 'text' : 'password'} placeholder="••••••••" icon={Lock}
                  rightEl={
                    <button type="button" onClick={() => setShowConfirm((p) => !p)}
                      className="text-gray-400 hover:text-[#800000] transition-colors duration-150 border-0 bg-transparent p-0">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />

                <AnimatePresence>
                  {confirmPassword && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`text-xs font-semibold flex items-center gap-1.5 -mt-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                      {newPassword === confirmPassword
                        ? <><CheckCircle2 size={11} /> Passwords match</>
                        : <><Circle size={11} /> Passwords don't match</>}
                    </motion.p>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
                      {error}
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
                    <>Reset Password<ArrowRight size={16} /></>
                  )}
                </motion.button>

                <p className="text-center text-xs text-gray-500 pt-0.5">
                  Remembered your password?{' '}
                  <button type="button" onClick={() => navigate('/login')}
                    className="font-bold text-[#800000] hover:text-[#6a0000] transition-colors duration-150 border-0 bg-transparent">
                    Back to Login
                  </button>
                </p>
              </form>
            </motion.div>
          </div>
        </div>

        <div className="border-t border-black/[0.06] bg-white py-3.5 flex items-center justify-center gap-2 shrink-0">
          <Shield size={14} className="text-green-500" />
          <span className="text-xs font-semibold text-gray-500">Secure Password Reset</span>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;