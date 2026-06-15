import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, ShieldCheck, ArrowRight, RefreshCw,
  CheckCircle2, Mail, AlertCircle, Home,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp } from '../auth/apiservice';
import { useTranslation } from 'react-i18next';

// ─── Same 8 languages as Register ────────────────────────────────────────────
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

// ─── TopBar — identical to Register (Home + language picker) ─────────────────
const TopBar = ({ i18n, isLangOpen, setIsLangOpen, navigate }) => {
  const currentLang = availableLanguages.find((l) => l.code === i18n.language);
  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
      <button onClick={() => navigate('/home')}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/[0.08] shadow-sm text-[#1a1a1a] hover:border-[#800000]/40 hover:text-[#800000] transition-all duration-200">
        <Home size={16} />
      </button>
      <div className="relative">
        <button onClick={() => setIsLangOpen((v) => !v)}
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

const OTP_LENGTH = 6;

// ─── OtpBox — MODULE LEVEL ────────────────────────────────────────────────────
const OtpBox = ({ value, index, isFocused, inputRef, onChange, onKeyDown, onPaste }) => (
  <motion.div
    animate={{
      scale:       isFocused ? 1.06 : 1,
      borderColor: value ? '#800000' : isFocused ? '#800000' : '#e5e7eb',
      boxShadow:   isFocused ? '0 0 0 3px rgba(128,0,0,0.12)' : '0 0 0 0px transparent',
    }}
    transition={{ duration: 0.15 }}
    className="relative rounded-xl border-2 bg-white flex items-center justify-center"
    style={{ width: '2.75rem', height: '3.5rem' }}
  >
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(e) => onChange(e, index)}
      onKeyDown={(e) => onKeyDown(e, index)}
      onPaste={onPaste}
      className="absolute inset-0 w-full h-full text-center text-xl font-black text-[#800000] bg-transparent border-0 outline-none rounded-xl cursor-text"
    />
    {isFocused && !value && (
      <motion.div
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#800000]/40"
      />
    )}
  </motion.div>
);

// ─── StepItem — MODULE LEVEL ──────────────────────────────────────────────────
const StepItem = ({ num, label, state, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="flex items-center gap-3"
  >
    {/* Circle — done=maroon filled, active=maroon outline+dot, pending=dim */}
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all
      ${state === 'done'
        ? 'bg-[#800000] border-[#800000] text-white'
        : state === 'active'
        ? 'bg-transparent border-[#800000] text-[#800000]'
        : 'bg-transparent border-white/20 text-white/25'}`}>
      {state === 'done'
        ? <CheckCircle2 size={14} />
        : <span className="text-xs font-black">{num}</span>}
    </div>
    <p className={`text-sm font-semibold leading-none
      ${state === 'done'   ? 'text-white/40 line-through'
      : state === 'active' ? 'text-white font-bold'
      :                      'text-white/25'}`}>
      {label}
    </p>
    {/* Active indicator dot */}
    {state === 'active' && (
      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        className="w-1.5 h-1.5 rounded-full bg-[#800000] shrink-0"
      />
    )}
  </motion.div>
);

// ═════════════════════════════════════════════════════════════════════════════
const VerifyOtp = () => {
  const { t, i18n } = useTranslation();
  const navigate     = useNavigate();

  const [isLangOpen, setIsLangOpen] = useState(false);

  const [otp,        setOtp]       = useState(Array(OTP_LENGTH).fill(''));
  const [focusIndex, setFocusIndex]= useState(0);
  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState('');
  const [success,    setSuccess]   = useState(false);
  // Countdown — smooth, no blink
  const [countdown,  setCountdown] = useState(60);
  const [canResend,  setCanResend] = useState(false);
  const [resending,  setResending] = useState(false);

  const inputRefs = useRef(Array(OTP_LENGTH).fill(null).map(() => React.createRef()));

  // Smooth countdown — updates every 1s with transition on number
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  // Auto-focus first box on mount
  useEffect(() => { inputRefs.current[0]?.current?.focus(); }, []);

  const focusBox = useCallback((index) => {
    const c = Math.max(0, Math.min(OTP_LENGTH - 1, index));
    inputRefs.current[c]?.current?.focus();
    setFocusIndex(c);
  }, []);

  const handleChange = useCallback((e, index) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) return;
    const newOtp = [...otp];
    newOtp[index] = val[val.length - 1];
    setOtp(newOtp);
    setError('');
    // Move to next box but do NOT auto-submit
    if (index < OTP_LENGTH - 1) focusBox(index + 1);
  }, [otp, focusBox]);

  const handleKeyDown = useCallback((e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const n = [...otp]; n[index] = ''; setOtp(n);
      } else if (index > 0) {
        const n = [...otp]; n[index - 1] = ''; setOtp(n); focusBox(index - 1);
      }
    } else if (e.key === 'ArrowLeft')  focusBox(index - 1);
    else if  (e.key === 'ArrowRight') focusBox(index + 1);
    // Enter key triggers submit if all filled
    else if (e.key === 'Enter' && otp.every((d) => d !== '')) handleSubmit();
  }, [otp, focusBox]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((c, i) => { newOtp[i] = c; });
    setOtp(newOtp);
    setError('');
    focusBox(Math.min(pasted.length, OTP_LENGTH - 1));
    // No auto-submit on paste either — user clicks Verify button
  }, [focusBox]);

  // Submit — only called from button or Enter key
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setLoading(true); setError('');
    const result = await verifyOtp(code);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } else {
      setError(result.message || 'Invalid OTP. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => focusBox(0), 100);
    }
  }, [otp, focusBox, navigate]);

  const handleResend = () => {
    if (!canResend) return;
    setResending(true);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setCountdown(60);
    setCanResend(false);
    setResending(false);
    setTimeout(() => focusBox(0), 100);
  };

  const storedEmail = (() => {
    try { return JSON.parse(localStorage.getItem('user'))?.email || ''; }
    catch { return ''; }
  })();

  const otpFilled = otp.filter(Boolean).length;

  // ── Success ────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="h-screen bg-[#f4f4f7] flex items-center justify-center p-4">
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
          <h2 className="text-2xl font-black text-gray-900 mb-2">Verified!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your email has been verified. Redirecting to login…
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

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#f4f4f7] flex flex-col lg:flex-row overflow-hidden">

      {/* ══ LEFT BRAND PANEL (lg+) ══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[38%] bg-[#1a1a1a] flex-col justify-between px-12 py-14 relative overflow-hidden shrink-0"
      >
        {/* Glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#800000]/15 blur-3xl pointer-events-none" />

        {/* ── TOP: spacer (no logo row) ── */}
        <div />

        {/* ── CENTER: flame + brand name + steps ── */}
        <div className="relative z-10 flex flex-col items-center text-center">

          {/* Big pulsing flame */}
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl bg-[#800000]/20 border border-[#800000]/30 flex items-center justify-center shadow-lg mb-4"
          >
            <Flame size={42} fill="#800000" color="#800000" />
          </motion.div>

          {/* Brand name directly below flame */}
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">
            WISE<span className="text-[#800000]">PLAYER</span>
          </h1>
          <p className="text-[10px] text-white/30 tracking-[3px] uppercase mb-10">
            Reseller Hub
          </p>

          {/* Steps — left-aligned inside centered block */}
          <div className="w-full max-w-[200px] text-left space-y-0">
            <StepItem num={1} label="Create account"   state="done"    delay={0.3} />
            {/* Connector */}
            <div className="ml-4 w-px h-5 bg-white/10 my-1" />
            <StepItem num={2} label="Verify email OTP" state="active"  delay={0.4} />
            <div className="ml-4 w-px h-5 bg-white/10 my-1" />
            <StepItem num={3} label="Login & start"    state="pending" delay={0.5} />
          </div>
        </div>

        {/* ── BOTTOM: footer ── */}
        <div className="relative z-10 border-t border-white/[0.06] pt-5 text-center">
          <p className="text-[10px] text-gray-600 tracking-[2px] uppercase">
            © {new Date().getFullYear()} WisePlayer — Premium Access
          </p>
        </div>

        {/* Corner fold */}
        <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-b-[70px] border-r-[70px] border-b-[#f4f4f7] border-r-transparent border-t-transparent border-l-transparent" />
      </motion.div>

      {/* ══ RIGHT OTP PANEL ════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-full lg:h-screen overflow-hidden relative">

        {/* TopBar — Home + language picker, identical to Register */}
        <TopBar i18n={i18n} isLangOpen={isLangOpen} setIsLangOpen={setIsLangOpen} navigate={navigate} />

        <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
          <div className="w-full max-w-sm py-8 lg:py-0">

            {/* Mobile logo */}
            <motion.div
              initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex lg:hidden flex-col items-center mb-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-3 shadow-md">
                <Flame size={28} fill="#800000" color="#800000" />
              </div>
              <h2 className="text-2xl font-black text-[#1a1a1a] tracking-tight">
                WISE<span className="text-[#800000]">PLAYER</span>
              </h2>
            </motion.div>

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="bg-white rounded-2xl border border-black/[0.06] shadow-sm px-7 pt-9 pb-6 relative"
            >
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="px-5 py-1.5 rounded-full bg-[#800000] text-white text-[10px] font-black tracking-widest uppercase shadow-md shadow-[#800000]/25 whitespace-nowrap"
                >
                  Email Verification
                </motion.div>
              </div>

              {/* Mail icon + heading */}
              <div className="flex flex-col items-center text-center mb-5">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 280 }}
                  className="w-14 h-14 rounded-2xl bg-[#800000]/10 flex items-center justify-center mb-3"
                >
                  <Mail size={24} className="text-[#800000]" />
                </motion.div>
                <h2 className="text-lg font-black text-gray-900 mb-1">Check your email</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  We sent a 6-digit code to{' '}
                  {storedEmail
                    ? <span className="font-bold text-[#800000]">{storedEmail}</span>
                    : 'your registered email'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* OTP boxes */}
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <OtpBox key={i} value={digit} index={i}
                      isFocused={focusIndex === i}
                      inputRef={inputRefs.current[i]}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      onPaste={handlePaste}
                    />
                  ))}
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-1.5">
                  {otp.map((d, i) => (
                    <motion.div key={i}
                      animate={{ backgroundColor: d ? '#800000' : '#e5e7eb', scale: d ? 1.2 : 1 }}
                      transition={{ duration: 0.2 }}
                      className="w-1.5 h-1.5 rounded-full"
                    />
                  ))}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
                        <AlertCircle size={13} className="text-red-500 shrink-0" />
                        <p className="text-xs font-semibold text-red-600">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Verify button — only way to submit */}
                <motion.button
                  type="submit"
                  disabled={loading || otpFilled < OTP_LENGTH}
                  whileHover={!loading && otpFilled === OTP_LENGTH ? { scale: 1.02 } : {}}
                  whileTap={!loading  && otpFilled === OTP_LENGTH ? { scale: 0.98 } : {}}
                  className={`w-full h-11 rounded-xl font-bold text-sm border-0 flex items-center justify-center gap-2 transition-all duration-200
                    ${loading || otpFilled < OTP_LENGTH
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm cursor-pointer'}`}
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <><ShieldCheck size={15} />Verify Account<ArrowRight size={15} /></>
                  )}
                </motion.button>

                {/* Resend — smooth countdown, no blink */}
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs text-gray-400">Didn't receive the code?</p>
                  {canResend ? (
                    <button type="button" onClick={handleResend} disabled={resending}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#800000] hover:text-[#6a0000] transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50">
                      <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                      Resend code
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Resend in{' '}
                      {/* AnimatePresence key swap = smooth fade between numbers, not blink */}
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={countdown}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.25 }}
                          className="inline-block font-black text-[#800000]"
                        >
                          {countdown}s
                        </motion.span>
                      </AnimatePresence>
                    </p>
                  )}
                </div>

                {/* Back to register */}
                <p className="text-center text-xs text-gray-400">
                  Wrong account?{' '}
                  <button type="button" onClick={() => navigate('/register')}
                    className="font-bold text-[#800000] hover:text-[#6a0000] transition-colors border-0 bg-transparent cursor-pointer">
                    Back to Register
                  </button>
                </p>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Pinned footer */}
        <div className="border-t border-black/[0.06] bg-white py-3.5 flex items-center justify-center gap-2 shrink-0">
          <ShieldCheck size={14} className="text-green-500" />
          <span className="text-xs font-semibold text-gray-500">Secure Verification</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;