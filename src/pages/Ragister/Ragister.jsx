import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, User, Lock, Eye, EyeOff, ArrowRight,
  CheckCircle2, Circle, Shield, Home, Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { registerReseller } from '../../auth/apiservice';
import { useTranslation } from 'react-i18next';

// ── Outside component — stable references ─────────────────────────────────────
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

const getValidations = (password, username) => ({
  hasSpecial:     /[!@#$%^&*(),.?":{}|<>]/.test(password),
  hasNumber:      /\d/.test(password),
  hasLower:       /[a-z]/.test(password),
  hasUpper:       /[A-Z]/.test(password),
  isLengthValid:  password.length >= 8,
  usernameLength: username.length >= 1 && username.length <= 30,
  usernameChars:  /^[a-zA-Z0-9._]*$/.test(username),
});

const InputField = ({ label, value, onChange, type = 'text', placeholder, icon: Icon, rightEl, maxLength }) => (
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
        placeholder={placeholder} maxLength={maxLength}
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
const Register = () => {
  const { t, i18n } = useTranslation();
  const navigate     = useNavigate();

  const [isLangOpen,      setIsLangOpen]      = useState(false);
  const [fullName,        setFullName]         = useState('');
  const [email,           setEmail]            = useState('');
  const [username,        setUsername]         = useState('');
  const [password,        setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword]  = useState('');
  const [agree,           setAgree]            = useState(false);
  const [error,           setError]            = useState('');
  const [showPassword,    setShowPassword]     = useState(false);
  const [showConfirm,     setShowConfirm]      = useState(false);
  const [loading,         setLoading]          = useState(false);

  const v = getValidations(password, username);

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
    if (!v.hasSpecial || !v.hasNumber || !v.hasLower || !v.hasUpper || !v.isLengthValid) {
      setError(t('reg_err_pass_req')); return;
    }
    if (!v.usernameLength || !v.usernameChars) {
      setError(t('reg_err_user_format')); return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.'); return;
    }
    if (password !== confirmPassword) {
      setError(t('reg_err_mismatch')); return;
    }
    if (!agree) {
      setError(t('reg_err_terms')); return;
    }
    setLoading(true);
    // requestAnimationFrame ensures React flushes the loading state to DOM
    // before the API call blocks — user sees spinner immediately
    await new Promise((r) => requestAnimationFrame(r));
    const result = await registerReseller({ fullName, username, email, password });
    setLoading(false);
    if (result.success) {
      // Token already saved in apiservice — navigate to OTP verification
      navigate('/verify-otp');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f7] flex flex-col lg:flex-row overflow-x-hidden">
      <TopBar i18n={i18n} isLangOpen={isLangOpen} setIsLangOpen={setIsLangOpen} navigate={navigate} />

      {/* ── LEFT BRAND PANEL (lg+) ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[38%] bg-[#1a1a1a] flex-col items-center justify-between px-12 py-14 relative overflow-hidden shrink-0"
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
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-14 lg:py-8 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <motion.div
              initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex lg:hidden flex-col items-center mb-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-3 shadow-md">
                <Flame size={28} fill="#800000" color="#800000" />
              </div>
              <h2 className="text-2xl font-black text-[#1a1a1a] tracking-tight">
                WISE <span className="text-[#800000]">PLAYER</span>
              </h2>
              <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">
                {t('activation.tagline')}
              </p>
            </motion.div>

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-7 sm:p-8 relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="px-5 py-1.5 rounded-full bg-[#800000] text-white text-[10px] font-black tracking-widest uppercase shadow-md shadow-[#800000]/25 whitespace-nowrap"
                >
                  {t('reg_signup_badge')}
                </motion.div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
                {/* Full name + Username */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <InputField label={t('reg_fullname')} value={fullName}
                    onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" icon={User} />
                  <div>
                    <InputField label={t('reg_username')} value={username}
                      onChange={(e) => setUsername(e.target.value)} placeholder="john_doe" icon={User} maxLength={30} />
                    <AnimatePresence>
                      {username && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                          <div className="flex items-center justify-between mt-1.5 px-1">
                            <span className={`text-[10px] font-semibold flex items-center gap-1 ${v.usernameChars ? 'text-green-600' : 'text-red-500'}`}>
                              {v.usernameChars ? <><CheckCircle2 size={10} /> a-z 0-9 . _</> : <><Circle size={10} /> Only a-z 0-9 . _</>}
                            </span>
                            <span className={`text-[10px] font-bold ${username.length >= 28 ? 'text-red-500' : 'text-gray-400'}`}>
                              {username.length}/30
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Email — full width, OTP will be sent here */}
                <InputField
                  label={t('reg_email') || 'Email Address'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  icon={Mail}
                />

                <InputField label={t('reg_password')} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'} placeholder="••••••••" icon={Lock}
                  rightEl={
                    <button type="button" onClick={() => setShowPassword((p) => !p)}
                      className="text-gray-400 hover:text-[#800000] transition-colors duration-150 border-0 bg-transparent p-0">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />

                <AnimatePresence>
                  {password && (
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

                <InputField label={t('reg_confirm_password')} value={confirmPassword}
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
                      className={`text-xs font-semibold flex items-center gap-1.5 -mt-1 ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                      {password === confirmPassword
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

                <button type="button" onClick={() => setAgree((a) => !a)}
                  className="flex items-start gap-3 w-full text-left border-0 bg-transparent cursor-pointer">
                  <motion.div
                    animate={{ backgroundColor: agree ? '#800000' : '#ffffff', borderColor: agree ? '#800000' : '#d1d5db' }}
                    transition={{ duration: 0.2 }}
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5">
                    <AnimatePresence>
                      {agree && (
                        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
                          <CheckCircle2 size={12} className="text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <span className="text-xs text-gray-500 leading-relaxed">
                    {t('reg_agree')}{' '}
                    <span className="font-bold text-[#800000]">{t('reg_terms')}</span>
                  </span>
                </button>

                <motion.button type="submit" disabled={loading}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className={`w-full h-11 rounded-xl font-bold text-sm border-0 flex items-center justify-center gap-2 transition-colors duration-200
                    ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm cursor-pointer'}`}>
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span>Creating account…</span>
                    </>
                  ) : (
                    <>{t('reg_create_btn')}<ArrowRight size={16} /></>
                  )}
                </motion.button>

                <p className="text-center text-xs text-gray-500 pt-0.5">
                  {t('reg_already_member')}{' '}
                  <button type="button" onClick={() => navigate('/login')}
                    className="font-bold text-[#800000] hover:text-[#6a0000] transition-colors duration-150 border-0 bg-transparent">
                    {t('reg_login_now')}
                  </button>
                </p>
              </form>
            </motion.div>
          </div>
        </div>

        <div className="border-t border-black/[0.06] bg-white py-3.5 flex items-center justify-center gap-2 shrink-0">
          <Shield size={14} className="text-green-500" />
          <span className="text-xs font-semibold text-gray-500">Authorized Access Only</span>
        </div>
      </div>
    </div>
  );
};

export default Register;