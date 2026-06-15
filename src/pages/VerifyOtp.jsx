import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield, MailCheck, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp } from '../auth/apiservice';
import { useTranslation } from 'react-i18next';

const VerifyOtp = () => {
  const navigate     = useNavigate();
  const { t }        = useTranslation();

  const OTP_LENGTH   = 6;
  const [digits, setDigits]       = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // ── Countdown timer for resend ──
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Auto-focus first box on mount ──
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Accept only single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const next  = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');

    // Auto-advance to next box
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft'  && index > 0)              inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  // Handle paste — fills all boxes at once
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    setError('');
    // Focus last filled box
    const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastIdx]?.focus();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      setError('Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await verifyOtp(otp);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.message || 'Invalid OTP. Please try again.');
      // Shake and clear on error
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    // Reset state
    setDigits(Array(OTP_LENGTH).fill(''));
    setError('');
    setCanResend(false);
    setCountdown(60);
    inputRefs.current[0]?.focus();
    // Note: resend endpoint not provided — add when available
    await new Promise((r) => setTimeout(r, 800));
    setResending(false);
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div className="min-h-screen bg-[#f4f4f7] flex flex-col lg:flex-row overflow-x-hidden">

      {/* ── TOP BAR ── */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => navigate('/home')}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/[0.08] shadow-sm text-[#1a1a1a] hover:border-[#800000]/40 hover:text-[#800000] transition-all duration-200"
        >
          <Home size={16} />
        </button>
      </div>

      {/* ── LEFT BRAND PANEL ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1,  x: 0   }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[40%] bg-[#1a1a1a] flex-col items-center justify-between px-12 py-14 relative overflow-hidden shrink-0"
      >
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#800000]/15 blur-3xl pointer-events-none" />

        <div />

        <div className="relative z-10 text-center w-full max-w-xs">
          {/* Animated icon */}
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

          {/* Email illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1,  y: 0  }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-[#800000]/10 border border-[#800000]/20 rounded-2xl p-6 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#800000]/20 flex items-center justify-center mb-3">
              <MailCheck size={20} className="text-[#800000]" />
            </div>
            <p className="text-sm font-bold text-white mb-1">Check your email</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              We sent a 6-digit verification code to the email address you registered with.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 w-full border-t border-white/[0.06] pt-5 text-center">
          <p className="text-[10px] text-gray-600 tracking-[2px] uppercase">
            © {new Date().getFullYear()} WisePlayer — Premium Access
          </p>
        </div>

        {/* Corner fold */}
        <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-b-[70px] border-r-[70px] border-b-[#f4f4f7] border-r-transparent border-t-transparent border-l-transparent" />
      </motion.div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-14 lg:py-10">
          <div className="w-full max-w-sm">

            {/* Mobile header */}
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
                Email Verification
              </span>
            </motion.div>

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-7 relative"
            >

              <AnimatePresence mode="wait">

                {/* ── SUCCESS STATE ── */}
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1   }}
                    className="flex flex-col items-center text-center py-4 gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"
                    >
                      <MailCheck size={32} className="text-green-600" />
                    </motion.div>
                    <div>
                      <h5 className="text-xl font-extrabold text-[#1a1a1a]">Email Verified!</h5>
                      <p className="text-sm text-gray-500 mt-1">Redirecting you to login...</p>
                    </div>
                    <div className="w-8 h-1 rounded-full bg-green-500">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 }}
                        className="h-full bg-green-600 rounded-full"
                      />
                    </div>
                  </motion.div>

                ) : (

                  /* ── OTP ENTRY STATE ── */
                  <motion.div key="otp-entry">

                    {/* Icon + heading */}
                    <div className="flex flex-col items-center text-center mb-6">
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                        className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4"
                      >
                        <MailCheck size={26} className="text-[#800000]" />
                      </motion.div>
                      <h5 className="text-xl font-extrabold text-[#1a1a1a] tracking-tight">
                        Verify your email
                      </h5>
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                        Enter the 6-digit code sent to your email address
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                      {/* OTP digit boxes */}
                      <motion.div
                        animate={error ? { x: [-8, 8, -8, 8, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className="flex justify-center gap-2 sm:gap-3"
                      >
                        {digits.map((digit, i) => (
                          <motion.input
                            key={i}
                            ref={(el) => (inputRefs.current[i] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={i === 0 ? handlePaste : undefined}
                            animate={{
                              borderColor: digit
                                ? '#800000'
                                : error
                                ? '#ef4444'
                                : '#e5e7eb',
                              scale: digit ? 1.05 : 1,
                            }}
                            transition={{ duration: 0.15 }}
                            className={`
                              w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black
                              rounded-xl border-2 outline-none bg-[#f4f4f7]
                              focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15
                              focus:bg-white transition-colors duration-150
                              ${digit ? 'text-[#800000]' : 'text-gray-400'}
                            `}
                            style={{ width: 44, height: 52 }}
                          />
                        ))}
                      </motion.div>

                      {/* Error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0  }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center"
                          >
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={loading || !isComplete}
                        whileHover={(!loading && isComplete) ? { scale: 1.02 } : {}}
                        whileTap={(!loading && isComplete)  ? { scale: 0.98 } : {}}
                        className={`w-full h-11 rounded-xl font-bold text-sm border-0 flex items-center justify-center gap-2 transition-colors duration-200
                          ${loading || !isComplete
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm cursor-pointer'
                          }`}
                      >
                        {loading ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : (
                          <>Verify Email <ArrowRight size={16} /></>
                        )}
                      </motion.button>

                    </form>

                    {/* Resend */}
                    <div className="mt-5 text-center">
                      <p className="text-xs text-gray-500">
                        Didn't receive the code?{' '}
                        {canResend ? (
                          <button
                            onClick={handleResend}
                            disabled={resending}
                            className="font-bold text-[#800000] hover:text-[#6a0000] transition-colors duration-150 border-0 bg-transparent inline-flex items-center gap-1"
                          >
                            {resending
                              ? <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Sending...</>
                              : <><RotateCcw size={11} /> Resend code</>
                            }
                          </button>
                        ) : (
                          <span className="font-bold text-gray-400">
                            Resend in {countdown}s
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Back to login */}
                    <p className="text-center text-xs text-gray-400 mt-3">
                      <button
                        onClick={() => navigate('/login')}
                        className="hover:text-[#800000] transition-colors duration-150 border-0 bg-transparent font-semibold"
                      >
                        Back to login
                      </button>
                    </p>

                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-black/[0.06] bg-white py-3.5 flex items-center justify-center gap-2 shrink-0">
          <Shield size={14} className="text-green-500" />
          <span className="text-xs font-semibold text-gray-500">Authorized Access Only</span>
        </div>
      </div>

    </div>
  );
};

export default VerifyOtp;