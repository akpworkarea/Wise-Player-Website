import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";
import { ArrowRightLeft, Coins, AlertTriangle } from "lucide-react";
import { transferCredits } from "../auth/reSeller";
import { useTranslation } from "react-i18next";

const TransferModal = ({
  open,
  onClose,
  selectedUser,
  availableCredits,
  refreshData,
}) => {
  const { t } = useTranslation();
  const [amount,     setAmount]     = useState("");
  const [error,      setError]      = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) { setAmount(""); setError(""); }
  }, [open, selectedUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) { setError(t("enter_valid_amount") || "Enter a valid amount."); return; }
    if (numAmount > availableCredits)  { setError(t("not_enough_credits")  || "Not enough credits.");  return; }

    setSubmitting(true);
    const res = await transferCredits({ subResellerId: selectedUser.id, amount: numAmount });
    setSubmitting(false);

    if (res.success) {
      setAmount(""); setError("");
      onClose();
      if (refreshData) await refreshData();
    } else {
      setError(res.message || t("transfer_failed") || "Transfer failed.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        /* ── backdrop: same as every other modal — fixed inset-0 ── */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="bg-[#800000] px-6 pt-6 pb-5 relative">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition"
              >
                <MdClose size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <ArrowRightLeft size={20} className="text-white" />
                </div>
                <div>
                  <h5 className="text-white font-extrabold text-base leading-tight">
                    {t("transfer_credits") || "Transfer Credits"}
                  </h5>
                  <p className="text-white/60 text-xs mt-0.5">Move coins to sub-reseller</p>
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{   opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span className="font-semibold">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User info card */}
              <div className="flex items-center justify-between bg-[#f4f4f7] border border-gray-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                    {t("user") || "User"}
                  </p>
                  <p className="text-sm font-bold text-gray-800">{selectedUser?.fullName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                    {t("available_credits") || "Their Balance"}
                  </p>
                  <p className="text-base font-black text-[#800000]">
                    {selectedUser?.subResellerCredits ?? 0}
                  </p>
                </div>
              </div>

              {/* Your balance */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#800000]/[0.06] border border-[#800000]/20 rounded-xl">
                <Coins size={14} className="text-[#800000] shrink-0" />
                <p className="text-xs text-[#800000] font-semibold">
                  {t("your_balance") || "Your balance"}:{" "}
                  <span className="font-black">{availableCredits ?? 0}</span>{" "}
                  {t("coins") || "coins"}
                </p>
              </div>

              {/* Amount input */}
              <div className="relative">
                <input
                  type="number"
                  placeholder={t("enter_amount") || "Enter amount"}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 bg-[#f4f4f7] border-2 border-transparent rounded-xl
                             focus:border-[#800000] focus:bg-white focus:outline-none
                             transition-all duration-200 text-sm font-semibold text-gray-800 pr-16
                             [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                             [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold uppercase tracking-wider pointer-events-none">
                  {t("coins") || "coins"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02 } : {}}
                  whileTap={!submitting  ? { scale: 0.98 } : {}}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200
                    ${submitting ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm"}`}
                >
                  {submitting ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <><ArrowRightLeft size={14} />{t("transfer") || "Transfer"}</>
                  )}
                </motion.button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition active:scale-95 text-sm"
                >
                  {t("cancel") || "Cancel"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransferModal;