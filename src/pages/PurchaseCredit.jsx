import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { purchaseCredit } from "../auth/creditManagement";
import { useAuth } from "../context/AuthContext";
import { purchaseSubResellerCredit } from "../auth/subReseller/creditManagement";
import { useNavigate } from "react-router-dom";
import { useRefresh } from "../context/RefreshContext";
import { MessageSquare, Gift, X, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";


const Coincalculator = () => {
  const { triggerTransactionRefresh } = useRefresh();
  const navigate = useNavigate();
  const [coins, setCoins] = useState("");
  const [price, setPrice] = useState(0);
  const [bulkOffer, setBulkOffer] = useState(null);
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const payerId = params.get("PayerID");
  const paymentStatus = params.get("paymentStatus");
  const { t } = useTranslation()

  useEffect(() => {
    if ((token && payerId) || paymentStatus === "success") {
      console.log("Payment Success Triggered");

      // 🔥 1. trigger refresh
      triggerTransactionRefresh();

      // 🔥 2. OPTIONAL but recommended: clean URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // 🔥 3. redirect
      if (token && payerId) {
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    }
  }, [token, payerId, paymentStatus, triggerTransactionRefresh, navigate])

  console.log("Token:", token);
  console.log("PayerID:", payerId);

  const tiers = [
    { min: 10, max: 10, rate: 2.5 },
    { min: 11, max: 49, rate: 2.2 },
    { min: 50, max: 99, rate: 2.0 },
    { min: 100, max: 199, rate: 1.75 },
    { min: 200, max: 499, rate: 1.5 },
    { min: 500, max: 999, rate: 1.25 },
    { min: 1000, max: Infinity, rate: 1.0 },
  ];

  const calculatePrice = (value) => {
    const coinValue = Number(value) || 0;
    setCoins(value);

    const tier = tiers.find((t) => coinValue >= t.min && coinValue <= t.max);

    if (tier) {
      setPrice((coinValue * tier.rate).toFixed(2));
    } else {
      setPrice(0);
    }
  };

  const { userRole } = useAuth();

  const fetchdata = async (coins) => {
    if (coins < 10) {
      alert("Coins should be atleast 10");
      return;
    }

    let res;

    if (userRole === "SUB_RESELLER") {
      res = await purchaseSubResellerCredit(coins);
    } else {
      res = await purchaseCredit(coins);
    }

    console.log("res :", res);

    if (res?.success === false && res?.message?.includes("bonus")) {
      setBulkOffer(res.message);
      return;
    }

    if (res?.data?.checkoutUrl) {
      window.location.href = res?.data?.checkoutUrl;
    } else if (res?.success === false) {
      alert(res.message || "Failed to initiate payment");
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <AnimatePresence>
        {bulkOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full relative"
            >
              <div className="bg-gradient-to-r from-red-600 to-red-800 p-8 text-white text-center relative">
                <button
                  onClick={() => setBulkOffer(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                  <Gift size={32} className="text-white" />
                </div>

                <h2 className="text-2xl font-bold mb-1">
                  {t("purchaseCredit.exclusive_bulk_offer")}
                </h2>

                <p className="text-red-100 text-sm">
                  {t("purchaseCredit.special_bonus_available")}
                </p>
              </div>

              <div className="p-8">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8">
                  <p className="text-gray-700 text-center leading-relaxed font-medium">
                    {bulkOffer}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    href="https://wa.me/212676076001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 active:scale-95"
                  >
                    <MessageSquare size={20} />
                    {t("purchaseCredit.contact_on_whatsapp")}
                    <ExternalLink size={16} className="opacity-50" />
                  </a>

                  <button
                    onClick={() => setBulkOffer(null)}
                    className="py-3 text-gray-500 font-semibold hover:text-gray-700 transition-colors"
                  >
                    {t("purchaseCredit.maybe_later")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gray-200 p-6 rounded-xl mb-6 w-full max-w-md shadow-md border border-gray-300">
        <h2 className="text-lg font-bold mb-3 text-gray-800">
          {t("purchaseCredit.calculate_price")}
        </h2>

        <div className="relative mb-4">
          <input
            type="number"
            placeholder={t("purchaseCredit.enter_coins")}
            value={coins}
            onChange={(e) => calculatePrice(e.target.value)}
            className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl focus:border-red-600 focus:outline-none transition-colors text-lg font-semibold"
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {t("purchaseCredit.coins")}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="bg-white/50 px-4 py-2 rounded-lg border border-white">
            <p className="text-sm text-gray-500 mb-0 font-semibold uppercase tracking-wider">
              {t("purchaseCredit.total_price")}
            </p>

            <p className="text-2xl font-black text-red-700">
              {price} €
            </p>
          </div>

          <button
            onClick={() => fetchdata(Number(coins))}
            disabled={Number(coins) < 10}
            className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg active:scale-95
${Number(coins) >= 10
                ? "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20 cursor-pointer"
                : "bg-gray-300 text-gray-500 shadow-none cursor-not-allowed opacity-50"
              }`}
          >
            {t("purchaseCredit.buy_credits")}
          </button>
        </div>
      </div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold mb-4 text-gray-400 uppercase tracking-widest"
      >
        {t("purchaseCredit.credits_pricing")}
      </motion.h1>
    </div>
  );
};

export default function PurchaseCredit() {

  const {t} = useTranslation()
  const tiers = [
    { range: "10", price: "2.50 €", badge: "Standard" },
    { range: "10 - 50", price: "2.20 €", badge: "Starter" },
    { range: "50 - 100", price: "2.00 €", badge: "Pro" },
    { range: "100 - 200", price: "1.75 €", badge: "Elite" },
    { range: "200 - 500", price: "1.50 €", badge: "Wholesale" },
    { range: "500 - 1000", price: "1.25 €", badge: "Mega" },
    { range: "1000+", price: "1.00 €", badge: "Enterprise" },
  ];

  return (
    <div className="min-h-screen text-gray-900 p-6 flex flex-col items-center">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 mb-4"
      >
        {t("purchaseCredit.credits_system")}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-500 text-center max-w-xl mb-8"
      >
        {t("purchaseCredit.credits_system_desc")}
      </motion.p>

      {/* Customer Pricing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-200 p-6 rounded-2xl shadow-lg w-full max-w-md mb-6"
      >
        <h2 className="text-xl font-semibold text-red-800 mb-4">
          {t("purchaseCredit.customer_pricing")}
        </h2>

        <div className="flex justify-between mb-2">
          <span>{t("purchaseCredit.one_code_annual")}</span>
          <span className="text-yellow-800">5.99 €</span>
        </div>

        <div className="flex justify-between">
          <span>{t("purchaseCredit.two_codes_offer")}</span>
          <span className="text-yellow-800">14.99 €</span>
        </div>
      </motion.div>

      {/* Reseller Pricing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-200 p-6 rounded-2xl shadow-lg w-full"
      >
        <h2 className="text-xl font-semibold text-red-800 mb-4">
          {t("purchaseCredit.reseller_pricing")}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="w-full overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">
                    {t("purchaseCredit.quantity_codes")}
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">
                    {t("purchaseCredit.unit_price")}
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {tiers.map((tier, index) => (
                  <tr
                    key={index}
                    className="hover:bg-red-50/30 transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-900 font-bold">{tier.range}</span>

                        <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                          {tier.badge}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {tier.range === "1000+" && (
                          <a
                            href="https://wa.me/212676076001"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                            title={t("purchaseCredit.contact_for_bulk_bonus")}
                          >
                            <MessageSquare size={16} />
                          </a>
                        )}

                        <span className="text-lg font-black text-red-600 group-hover:scale-110 inline-block transition-transform">
                          {tier.price}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col justify-center">
            <Coincalculator />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
