import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Flame, ArrowRight, MessageCircle, CheckCircle2,
  Zap, Users, TrendingUp, Star
} from "lucide-react";

// ── Animation presets ─────────────────────────────────────────
const fadeUp = {
  initial:     { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0  },
  viewport:    { once: true },
  transition:  { duration: 0.5 },
};

const stagger = {
  initial:     {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport:    { once: true },
};

// ── Pricing tiers — total computed per row ────────────────────
const tiers = [
  { qty: "10",          unitPrice: 2.50, fixedTotal: 25,   fixedQty: 10   },
  { qty: "10 – 50",    unitPrice: 2.20, fixedTotal: null,  fixedQty: null },
  { qty: "50 – 100",   unitPrice: 2.00, fixedTotal: null,  fixedQty: null },
  { qty: "100 – 200",  unitPrice: 1.75, fixedTotal: null,  fixedQty: null },
  { qty: "200 – 500",  unitPrice: 1.50, fixedTotal: null,  fixedQty: null },
  { qty: "500 – 1000", unitPrice: 1.25, fixedTotal: null,  fixedQty: null },
  { qty: "1000+",      unitPrice: 1.00, fixedTotal: null,  fixedQty: null, custom: true },
];

const getUnitPrice = () => {}; // kept for compatibility

// ─────────────────────────────────────────────────────────────
const Reseller = () => {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const [rowQtys, setRowQtys] = useState({});

  const updateRowQty = (i, val) => setRowQtys((prev) => ({ ...prev, [i]: val }));

  const getRowTotal = (tier, i) => {
    if (tier.fixedTotal) return { val: tier.fixedTotal, show: true };
    if (tier.custom) return { val: null, show: false };
    const q = Number(rowQtys[i]);
    if (!q || q <= 0) return { val: null, show: false };
    return { val: +(q * tier.unitPrice).toFixed(2), show: true };
  };

  return (
    <>
    <div className="bg-[#f4f4f7] min-h-screen pb-[72px]">

      {/* ── HERO CARD ──────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 pt-10 sm:pt-14">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-8 sm:p-10 text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#800000]/[0.08] text-[#800000] text-xs font-bold uppercase tracking-widest mb-5">
              <Zap size={12} fill="#800000" />
              {t('resellerpage.reseller_badge')}
            </span>
          </motion.div>

          {/* Logo */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-2.5 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shadow-md">
              <Flame size={26} fill="#800000" color="#800000" />
            </div>
            <h2 className="text-2xl font-black text-[#1a1a1a] tracking-tight">
              WISE <span className="text-[#800000]">PLAYER</span>
            </h2>
          </motion.div>

          <motion.h3 variants={fadeUp} className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] mb-3 tracking-tight">
            {t('resellerpage.reseller_title')}
          </motion.h3>

          <motion.p variants={fadeUp} className="text-gray-500 text-sm sm:text-base leading-relaxed mb-7 max-w-lg mx-auto">
            {t('resellerpage.reseller_desc')}
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/register")}
              className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white bg-[#800000] hover:bg-[#6a0000] border-0 shadow-sm transition-colors duration-200"
            >
              {t('resellerpage.register')}
              <ArrowRight size={16} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm border-2 border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white transition-all duration-200 bg-transparent"
            >
              {t('resellerpage.login')}
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES ROW ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Users size={20} className="text-[#800000]" />,      label: "Reseller Network"    },
            { icon: <TrendingUp size={20} className="text-[#800000]" />, label: "Volume Discounts"   },
            { icon: <Star size={20} className="text-[#800000]" />,       label: "Premium Support"    },
          ].map(({ icon, label }, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="bg-white rounded-xl border border-black/[0.06] shadow-sm px-5 py-4 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[#800000]/[0.08] flex items-center justify-center shrink-0">
                {icon}
              </div>
              <span className="text-sm font-bold text-[#1a1a1a]">{label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SECTION HEADING ────────────────────────────────── */}
      <motion.div {...fadeUp} className="text-center mt-12 mb-8 px-4">
        <p className="text-[#800000] font-bold tracking-[3px] text-xs uppercase mb-2">
          {t('resellerpage.pricing_title')}
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] tracking-tight">
          {t('resellerpage.pricing_subtitle')}
        </h2>
      </motion.div>

      {/* ── CUSTOMER PLANS ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 mb-8">
        <motion.h3 {...fadeUp} className="text-lg font-extrabold text-[#1a1a1a] mb-5 text-center tracking-tight">
          {t('resellerpage.customer_plans')}
        </motion.h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* 1 Code */}
          <motion.div
            {...fadeUp}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-7 flex flex-col transition-shadow hover:shadow-md"
          >
            <h3 className="font-extrabold text-[#1a1a1a] text-lg mb-1">{t('resellerpage.one_code')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('resellerpage.annual_sub')}</p>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-black text-[#800000]">€5.99</span>
              <span className="text-sm text-gray-400 mb-1">/device</span>
            </div>
            <div className="space-y-2 mb-7">
              {['1 Year Access', 'Instant Activation', 'Full Support'].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={15} className="text-[#800000] shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="mt-auto w-full py-3 rounded-xl font-bold text-sm border-2 border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white transition-all duration-200 border-0"
            >
              {t('resellerpage.buy_now')}
            </motion.button>
          </motion.div>

          {/* 2 Codes — featured */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-[#1a1a1a] rounded-2xl shadow-sm p-7 flex flex-col relative overflow-hidden transition-shadow hover:shadow-lg"
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#800000]/20 blur-2xl pointer-events-none" />

            {/* Badge */}
            <span className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-[#800000] text-white text-[10px] font-black tracking-widest uppercase">
              <Flame size={10} fill="white" color="white" />
              {t('resellerpage.special_offer')}
            </span>

            <h3 className="font-extrabold text-white text-lg mb-1 relative z-10">{t('resellerpage.two_codes')}</h3>
            <p className="text-sm text-gray-400 mb-4 relative z-10">{t('resellerpage.best_couples')}</p>
            <div className="flex items-end gap-1 mb-6 relative z-10">
              <span className="text-4xl font-black text-[#800000]">€14.99</span>
              <span className="text-sm text-gray-500 mb-1">/2 devices</span>
            </div>
            <div className="space-y-2 mb-7 relative z-10">
              {['2 Devices Covered', 'Best Value Deal', 'Priority Support'].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 size={15} className="text-[#800000] shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="mt-auto w-full py-3 rounded-xl font-bold text-sm bg-[#800000] hover:bg-[#6a0000] text-white transition-colors duration-200 border-0 relative z-10"
            >
              {t('resellerpage.get_offer')}
            </motion.button>

            {/* Corner fold */}
            <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-b-[50px] border-r-[50px] border-b-[#f4f4f7] border-r-transparent border-t-transparent border-l-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ── RESELLER PRICING TABLE ─────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 mb-8">
        <motion.div
          {...fadeUp}
          className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden"
        >
          {/* Table header */}
          <div className="px-6 py-4 border-b border-black/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#800000]/[0.08] flex items-center justify-center">
              <TrendingUp size={16} className="text-[#800000]" />
            </div>
            <h3 className="font-extrabold text-[#1a1a1a] text-base tracking-tight">
              {t('resellerpage.reseller_pricing_table')}
            </h3>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-black/[0.06]">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">{t('resellerpage.qty')}</th>
                  <th className="px-5 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">{t('resellerpage.unit_price')}</th>
                  <th className="px-5 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Your Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">{t('resellerpage.total_label')}</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, i) => {
                  const rowTotal = getRowTotal(tier, i);
                  const isFixed  = !!tier.fixedTotal;
                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="border-b border-black/[0.04] hover:bg-[#800000]/[0.02] transition-colors duration-150"
                    >
                      {/* Qty range */}
                      <td className="px-6 py-3 font-bold text-[#1a1a1a] whitespace-nowrap">{tier.qty}</td>

                      {/* Unit price */}
                      <td className="px-5 py-3 text-center font-bold text-[#800000]">
                        €{tier.unitPrice.toFixed(2)}
                      </td>

                      {/* Your qty input */}
                      <td className="px-5 py-3 text-center">
                        {isFixed ? (
                          <span className="inline-flex items-center justify-center w-20 h-8 rounded-lg bg-gray-100 text-xs font-bold text-gray-400">
                            {tier.fixedQty}
                          </span>
                        ) : tier.custom ? (
                          <span className="inline-flex items-center justify-center w-20 h-8 rounded-lg bg-gray-100 text-xs font-semibold text-gray-400">
                            —
                          </span>
                        ) : (
                          <input
                            type="number"
                            min="1"
                            value={rowQtys[i] || ''}
                            onChange={(e) => updateRowQty(i, e.target.value)}
                            placeholder="Qty"
                            className="w-20 h-8 px-2 rounded-lg border-2 border-gray-200 bg-white text-xs font-bold text-center text-[#1a1a1a] outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/15 transition-colors duration-200 placeholder:text-gray-300"
                          />
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-6 py-3 text-right">
                        {tier.custom ? (
                          <a
                            href="https://wa.me/212676076001?text=Hi%20I%20want%20custom%20pricing%20for%201000%2B%20codes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-green-600 font-bold no-underline hover:text-green-700 transition-colors"
                          >
                            <MessageCircle size={14} />
                            {t('resellerpage.custom')}
                          </a>
                        ) : rowTotal.show ? (
                          <motion.span
                            key={rowTotal.val}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="font-black text-[#800000]"
                          >
                            €{rowTotal.val.toFixed(2)}
                          </motion.span>
                        ) : (
                          <span className="text-gray-300 font-semibold text-xs">enter qty</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer notes */}
          <div className="px-6 py-4 bg-[#800000]/[0.03] border-t border-[#800000]/10 space-y-1.5">
            {[t('resellerpage.bonus_msg'), t('resellerpage.whatsapp_msg')].map((msg, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-600 font-semibold">
                <CheckCircle2 size={13} className="text-[#800000] shrink-0 mt-0.5" />
                {msg}
              </div>
            ))}
          </div>

        </motion.div>
      </section>

    </div>

      {/* ── FOOTER — fixed to bottom ──────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.06] py-3 px-4 z-50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 max-w-4xl mx-auto">
          <p className="text-xs text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} {t('playlist.footerCopyRight')}
          </p>
          <div className="flex items-center gap-4">
            {[
              t('playlist.footer_privacy'),
              t('playlist.footer_terms'),
              t('playlist.footer_helpdesk'),
            ].map((label) => (
              <a
                key={label}
                href="#"
                className="text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-[#800000] transition-colors duration-150 no-underline"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Reseller;