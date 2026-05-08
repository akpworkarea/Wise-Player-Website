import React, { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
function Reseller() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState("");

  const getUnitPrice = (qty) => {
    if (qty === 10) return 2.5;
    if (qty > 10 && qty <= 50) return 2.2;
    if (qty > 50 && qty <= 100) return 2.0;
    if (qty > 100 && qty <= 200) return 1.75;
    if (qty > 200 && qty <= 500) return 1.5;
    if (qty > 500 && qty <= 1000) return 1.25;
    if (qty > 1000) return 1.0;
    return 0;
  };

  const numericQty = Number(quantity);
  const unitPrice = getUnitPrice(numericQty);
  const total = numericQty * unitPrice;

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    whileInView: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <>
      <div className="bg-white min-h-screen px-6 py-10">
        <div className="flex justify-center mt-6 px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl text-center border border-gray-200"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <span className="inline-block bg-yellow-400 text-black text-xs px-3 py-1 rounded-full mb-4 font-semibold">
                🚀 {t('resellerpage.reseller_badge')}

              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              variants={fadeInUp}
              className="text-2xl md:text-3xl font-bold text-gray-800"
            >
              {t('resellerpage.reseller_title')}
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="text-gray-600 mt-4 leading-relaxed"
            >
              {t('resellerpage.reseller_desc')}
            </motion.p>

            {/* Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row justify-center gap-4 mt-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 w-40 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition"
                onClick={() => navigate("/register")}
              >
                {t('resellerpage.register')}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="w-40 !border !border-red-600 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition"
              >
                {t('resellerpage.login')}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
        {/* HEADER */}
        <div className="text-center pt-12 mb-12">
          <h1 className="text-4xl font-bold text-red-600">{t('resellerpage.pricing_title')}</h1>
          <p className="text-gray-500 mt-2">
            {t('resellerpage.pricing_subtitle')}
          </p>
        </div>

        {/* ================= CUSTOMER PRICING ================= */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {t('resellerpage.customer_plans')}
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 1 CODE */}
          <div className="border rounded-2xl p-8 shadow hover:shadow-xl transition">
            <h3 className="text-xl font-semibold">{t('resellerpage.one_code')}</h3>
            <p className="text-gray-500">{t('resellerpage.annual_sub')}</p>

            <h1 className="text-4xl font-bold text-red-600 mt-4">€5.99</h1>

            <button className="mt-6 w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700">
              {t('resellerpage.buy_now')}
            </button>
          </div>

          {/* 2 CODE */}
          <div className="border-2 border-yellow-400 rounded-2xl p-8 shadow-lg relative">
            <span className="absolute top-3 right-3 bg-yellow-400 text-black px-3 py-1 text-xs rounded-full">
              🔥 {t('resellerpage.special_offer')}

            </span>

            <h3 className="text-xl font-semibold">{t('resellerpage.two_codes')}</h3>
            <p className="text-gray-500">{t('resellerpage.best_couples')}</p>

            <h1 className="text-4xl font-bold text-red-600 mt-4">€14.99</h1>

            <button className="mt-6 w-full bg-yellow-400 text-black py-3 rounded-xl hover:bg-yellow-500">
              {t('resellerpage.get_offer')}
            </button>
          </div>
        </div>

        {/* ================= RESELLER PRICING ================= */}
        <div className="max-w-5xl mx-auto mt-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className=" font-bold text-center py-4">
              <h2 className="text-xl font-semibold tracking-wide">
                {t('resellerpage.reseller_pricing_table')}
              </h2>
            </div>

            {/* Table */}
            <table className="w-full text-center">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-sm uppercase">
                  <th className="p-4">{t('resellerpage.qty')}</th>                 <th className="p-4">{t('resellerpage.unit_price')}</th>
                  <th className="p-4">{t('resellerpage.total_label')}</th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                <tr className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">10</td>
                  <td>€2.50</td>
                  <td>€25</td>
                </tr>

                <tr className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">10 – 50</td>
                  <td>€2.20</td>
                  <td>{t('resellerpage.depends')}</td>                </tr>

                <tr className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">50 – 100</td>
                  <td>€2.00</td>
                  <td>{t('resellerpage.depends')}</td>
                </tr>

                <tr className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">100 – 200</td>
                  <td>€1.75</td>
                  <td>{t('resellerpage.depends')}</td>

                </tr>

                <tr className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">200 – 500</td>
                  <td>€1.50</td>
                  <td>{t('resellerpage.depends')}</td>

                </tr>

                <tr className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">500 – 1000</td>
                  <td>€1.25</td>
                  <td>{t('resellerpage.depends')}</td>

                </tr>

                <tr>
                  <td className="p-4 font-medium">1000+</td>
                  <td>€1.00</td>
                  <td className="text-gray-700 font-semibold">
                    <a
                      href="https://wa.me/919546778032?text=Hi%20I%20want%20custom%20pricing%20for%201000%2B%20codes"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <FaWhatsapp className="text-green-600 text-lg" />
                      <span>{t('resellerpage.custom')}</span>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Footer Notes */}
            <div className="bg-gray-50 p-4 text-sm text-gray-800 font-semibold space-y-1">
              <p>✔ {t('resellerpage.bonus_msg')}</p>
              <p>✔ {t('resellerpage.whatsapp_msg')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Reseller;
