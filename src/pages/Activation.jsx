import React, { useState } from "react";
import { Cpu, ShieldCheck, CheckCircle2, Shield, Flame } from "lucide-react";
import { generateDeviceKey, activateDeviceApi } from "../auth/apiservice";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "../component/Footer";

// ── MAC formatter ─────────────────────────────────────────────
const formatMac = (val) => val.match(/.{1,2}/g)?.join(":") || val;

const WisePlayerActivation = () => {
  const { t } = useTranslation();

  const [macAddress, setMacAddress]       = useState("");
  const [isAgreed, setIsAgreed]           = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [isKeyGenerated, setIsKeyGenerated] = useState(false);
  const [isKeyLoading, setIsKeyLoading]   = useState(false);
  const [generatedKey, setGeneratedKey]   = useState("");
  const [isSuccess, setIsSuccess]         = useState(false);

  const isMacValid  = macAddress.length === 12;
  const canActivate = isMacValid && isKeyGenerated && isAgreed;

  const handleMacChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "");
    if (value.length <= 12) {
      setMacAddress(value);
      setIsKeyGenerated(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!isMacValid) return;
    setIsKeyLoading(true);
    const result = await generateDeviceKey(formatMac(macAddress));
    if (result.success) {
      setGeneratedKey(result.data.activationKey);
      setIsKeyGenerated(true);
      toast.success(t("activation.keyGeneratedSuccess"));
    } else {
      toast.error(result.message || t("activation.keyGenerateFailed"));
    }
    setIsKeyLoading(false);
  };

  const handleActivate = async () => {
    if (!canActivate) return;
    setIsLoading(true);
    const result = await activateDeviceApi(formatMac(macAddress), generatedKey);
    if (result.success) {
      toast.success(t("activation.deviceActivated"));
      setIsSuccess(true);
    } else {
      toast.error(result.message || t("activation.activationFailed"));
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setMacAddress("");
    setIsKeyGenerated(false);
    setIsAgreed(false);
    setGeneratedKey("");
  };

  return (
    <div className="fixed inset-0 bg-[#f4f4f7] flex flex-col items-center justify-center px-4 pt-[85px] pb-[72px]">

      {/* ── CARD ───────────────────────────────────────────── */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">

        <AnimatePresence mode="wait">

          {/* ── FORM STATE ─────────────────────────────────── */}
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-8 space-y-5"
            >
              {/* Header */}
              <div className="flex flex-col items-center text-center">
                <div className="w-13 h-13 w-14 h-14 rounded-2xl bg-[#800000]/[0.08] flex items-center justify-center mb-3">
                  <Flame size={28} fill="#800000" color="#800000" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] tracking-tight">
                  {t("activation.appName")}
                  <span className="text-[#800000]"> {t("activation.appName2")}</span>
                </h1>
                <p className="text-xs text-gray-400 mt-1 tracking-wide">
                  {t("activation.tagline")}
                </p>
              </div>

              {/* ── STEPPER ──────────────────────────────────── */}
              <div className="flex items-center justify-between">
                {[
                  { step: 1, label: t("activation.stepEnterMac"), done: isMacValid },
                  { step: 2, label: t("activation.stepGenerateKey"), done: isKeyGenerated },
                  { step: 3, label: t("activation.stepActivate"), done: canActivate },
                ].map(({ step, label, done }, i, arr) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`
                        w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
                        text-xs font-bold transition-all duration-300
                        ${done ? "bg-[#800000] text-white scale-110 shadow-sm" : "bg-gray-200 text-gray-500"}
                      `}>
                        {step}
                      </div>
                      <span className={`mt-1 text-[10px] sm:text-xs text-center leading-tight ${done ? "text-[#800000] font-semibold" : "text-gray-400"}`}>
                        {label}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="flex-1 h-[2px] mx-1 bg-gray-200 rounded-full overflow-hidden mb-4">
                        <div className={`h-full bg-[#800000] transition-all duration-500 ${done ? "w-full" : "w-0"}`} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* ── MAC INPUT ────────────────────────────────── */}
              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] tracking-wide uppercase mb-2">
                  {t("activation.macLabel")}
                </label>
                <input
                  type="text"
                  value={formatMac(macAddress)}
                  onChange={handleMacChange}
                  placeholder={t("activation.macPlaceholder")}
                  inputMode="text"
                  className={`
                    w-full h-11 sm:h-12 px-4 rounded-xl border-2 outline-none
                    font-mono text-sm tracking-wider transition-colors duration-200
                    ${isMacValid
                      ? "border-[#800000] bg-[#800000]/[0.04] text-[#800000]"
                      : "border-gray-200 bg-white text-[#1a1a1a] focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15"
                    }
                  `}
                />
              </div>

              {/* ── GENERATE KEY BUTTON ───────────────────────── */}
              <button
                onClick={handleGenerateKey}
                disabled={!isMacValid || isKeyLoading}
                className={`
                  w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98] border-0
                  ${isKeyGenerated
                    ? "bg-green-600 text-white"
                    : isMacValid
                      ? "bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                {isKeyLoading
                  ? t("activation.generating")
                  : isKeyGenerated
                    ? t("activation.keyGenerated")
                    : t("activation.generateKey")}
              </button>

              {/* ── AGREEMENT ────────────────────────────────── */}
              <label className="flex items-start gap-3 text-xs sm:text-sm text-gray-600 cursor-pointer leading-relaxed">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={() => setIsAgreed(!isAgreed)}
                  disabled={!isKeyGenerated}
                  className="mt-0.5 w-4 h-4 shrink-0 accent-[#800000]"
                />
                <span>
                  {t("activation.agreement")}{" "}
                  <span className="font-bold text-[#1a1a1a]">{t("activation.terms")}</span>.
                </span>
              </label>

              {/* ── ACTIVATE BUTTON ───────────────────────────── */}
              <button
                onClick={handleActivate}
                disabled={!canActivate || isLoading}
                className={`
                  w-full py-3 sm:py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98] border-0
                  ${canActivate
                    ? "bg-[#800000] hover:bg-black text-white shadow-sm"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                {isLoading ? t("activation.verifying") : t("activation.activateDevice")}
              </button>

            </motion.div>

          ) : (

            /* ── SUCCESS STATE ─────────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4"
            >
              {/* Pulsing icon */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-green-200 animate-ping opacity-60" />
                <div className="relative w-16 h-16 flex items-center justify-center bg-green-50 rounded-full border border-green-200">
                  <ShieldCheck size={32} className="text-green-600" />
                </div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] tracking-tight">
                  {t("activation.successTitle")}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t("activation.successDesc")}
                </p>
              </div>

              {/* Device MAC */}
              <div className="w-full bg-gray-50 border border-black/[0.06] rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">{t("activation.activatedDevice")}</p>
                <p className="font-mono text-sm font-bold text-[#1a1a1a] break-all">
                  {formatMac(macAddress)}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={12} /> {t("activation.lifetime")}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-[#800000]/[0.08] text-[#800000] px-3 py-1.5 rounded-full">
                  <Shield size={12} /> {t("activation.secured")}
                </span>
              </div>

              {/* Action buttons */}
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl text-sm font-bold bg-[#1a1a1a] hover:bg-black text-white transition-all duration-200 active:scale-[0.98] border-0"
              >
                {t("activation.activateAnother")}
              </button>
              <button
                onClick={() => window.location.href = "/home"}
                className="w-full py-3 rounded-xl text-sm font-bold bg-[#800000] hover:bg-[#6a0000] text-white transition-all duration-200 active:scale-[0.98] border-0"
              >
                {t("activation.goToHome")}
              </button>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── FOOTER — fixed to bottom ──────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.06] py-3 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 max-w-md mx-auto">
          <Footer />
        </div>
      </div>

    </div>
  );
};

export default WisePlayerActivation;