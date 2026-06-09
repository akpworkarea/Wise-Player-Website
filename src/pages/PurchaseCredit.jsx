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
    href="https://wa.me/212777754774"
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
}