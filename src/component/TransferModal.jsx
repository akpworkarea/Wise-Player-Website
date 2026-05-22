import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";
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
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setAmount("");
      setError("");
    }
  }, [open, selectedUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      setError(t("enter_valid_amount"));
      return;
    }
    if (numAmount > availableCredits) {
      setError(t("not_enough_credits"));
      return;
    }

    const res = await transferCredits({
      subResellerId: selectedUser.id,
      amount: numAmount,
    });

    if (res.success) {
      setAmount("");
      setError("");
      onClose();
      if (refreshData) await refreshData();
    } else {
      setError(res.message || t("transfer_failed"));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            {/* ── MODAL HEADER — maroon bar, same as Create/Edit modals ── */}
            <div className="bg-[#800000] px-6 py-4 flex items-center justify-between">
              <h5 className="text-white font-bold text-base">
                {t("transfer_credits")}
              </h5>
              <button
                type="button"
                onClick={onClose}
                className="text-white hover:bg-white/20 p-1.5 rounded-full transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* ── MODAL BODY ── */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              {/* User info row */}
              <div className="flex items-center justify-between bg-[#f4f4f7] border border-gray-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                    {t("user")}
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {selectedUser?.fullName}
                  </p>
                </div>

                {/* Sub-reseller's current coin balance */}
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                    {t("available_credits")}
                  </p>
                  <p className="text-base font-black text-[#800000]">
                    {selectedUser?.subResellerCredits ?? 0}
                  </p>
                </div>
              </div>

              {/* Your available coins */}
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-[#800000] shrink-0" />
                <p className="text-xs text-[#800000] font-semibold">
                  {t("your_balance")}: {availableCredits ?? 0} {t("coins")}
                </p>
              </div>

              {/* Amount input */}
              <div className="relative">
                <input
                  type="number"
                  placeholder={t("enter_amount")}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-base font-semibold text-gray-800 pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold uppercase tracking-wider pointer-events-none">
                  {t("coins")}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#800000] text-white font-bold rounded-xl hover:bg-[#6a0000] transition active:scale-95 text-sm"
                >
                  {t("transfer")}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition active:scale-95 text-sm"
                >
                  {t("cancel")}
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