import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, ShieldCheck, Zap, Monitor, CheckCircle,
  Smartphone, ArrowRight, Phone, Instagram, Twitter, AlertTriangle
} from 'lucide-react';
import {Link,useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { validateDevice, checkoutPayment, fetchPublicPlans } from '../auth/apiservice';


// ─── Typewriter ──────────────────────────────────────────────────────────────
const Typewriter = ({ texts }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === texts[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 1500);
      return;
    }
    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % texts.length);
      return;
    }
    const timeout = setTimeout(
      () => setSubIndex((prev) => prev + (reverse ? -1 : 1)),
      reverse ? 75 : 150
    );
    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, texts]);

  return (
    <span className="text-[#800000]">
      {texts[index].substring(0, subIndex)}
      <span className="animate-pulse">|</span>
    </span>
  );
};

// ─── Animation presets ────────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

// ─── Main Component ───────────────────────────────────────────────────────────
const WisePlayerHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getApiMessageKey = (msg = '') => {
    const normalized = msg.toLowerCase();

    if (normalized.includes('device not found')) return 'home.api.device_not_found';
    if (normalized.includes('invalid device')) return 'home.api.invalid_device';
    if (normalized.includes('payment')) return 'home.api.payment_failed';
    if (normalized.includes('plan')) return 'home.api.plans_error';

    return 'home.api.something_wrong';
  };

  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [mac, setMac] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isActiveDevice, setIsActiveDevice] = useState(null);
  const [plans, setPlans] = useState([]);
  const planRef = useRef('ANNUAL');

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await fetchPublicPlans();
        setPlans(data);
      } catch (err) {
        console.error('ERROR:', err);

        const apiMsg = err.response?.data?.message;

        showToast(
          t(getApiMessageKey(apiMsg || 'plans_error')),
          'error'
        );
      }
    };
    loadPlans();
  }, []);

  const handleSubmit = async () => {
    if (!mac) { showToast(t('home.enter_mac'), 'warning'); return; }
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$/;
    if (!macRegex.test(mac)) { showToast(t('home.invalid_mac'), 'warning'); return; }
    try {
      const res = await validateDevice(mac);
      if (res.success && res.data?.allowed) {
        setStatusMsg(t('home.status_active'));
        setIsActiveDevice(true);
      } else {
        setStatusMsg(t('home.status_inactive'));
        setIsActiveDevice(false);
      }
    } catch (err) {
      console.error(err);
      const apiMsg = err.response?.data?.message;
      showToast(t(getApiMessageKey(apiMsg)), 'error');
    }
  };

  const handleProceed = async () => {
    if (isActiveDevice) {
      try {
        const successUrl = `${window.location.origin}/invoice?paymentStatus=success`;
        const cancelUrl = `${window.location.origin}/home?paymentStatus=cancel`;
        const res = await checkoutPayment({ deviceId: mac, planName: planRef.current, successUrl, cancelUrl });
        if (res.success && res.data?.checkoutUrl) {
          window.location.href = res.data.checkoutUrl;
        } else {
          showToast(t(getApiMessageKey(res.message)), 'error');
        }
      } catch (err) {
        const apiMsg = err.response?.data?.message;
        showToast(t(getApiMessageKey(apiMsg)), 'error');
      }
    } else {
      navigate('/activation');
    }
  };

  const resetModal = () => {
    setStatusMsg('');
    setIsActiveDevice(null);
    setMac('');
  };

  // ─── Features data ──────────────────────────────────────────────────────────
  const features = [
    {
      icon: <Zap size={36} />,
      title: t('home.features.0.title'),
      desc: t('home.features.0.desc')
    },
    {
      icon: <ShieldCheck size={36} />,
      title: t('home.features.1.title'),
      desc: t('home.features.1.desc')
    },
    {
      icon: <Monitor size={36} />,
      title: t('home.features.2.title'),
      desc: t('home.features.2.desc')
    }
  ];

  return (
    <div className="bg-[#f4f4f7] text-[#1a1a1a] overflow-x-hidden min-h-screen font-sans">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="py-8 sm:py-10 md:py-14 bg-[#f4f4f7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12">

            {/* Left */}
            <motion.div
              className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left"
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              variants={{ whileInView: { transition: { staggerChildren: 0.12 } } }}
            >

              {/* Badge */}
              <motion.div variants={fadeUp} className="mb-4">
                <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white border border-black/10 text-[11px] sm:text-sm font-bold tracking-widest text-[#1a1a1a] shadow-sm">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#800000] animate-pulse" />
                  {t('home.system_online')}
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={fadeUp}
                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight uppercase mb-4"
              >
                {t('home.futureIs')}
                <br className="hidden sm:block" />
                <span className="block mt-2">
                  <Typewriter
                    texts={[
                      t('home.type_ultra_fast'),
                      t('home.type_crystal_clear'),
                      t('home.type_wise_player')
                    ]}
                  />
                </span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                variants={fadeUp}
                className="text-gray-500 text-sm sm:text-base md:text-lg mb-6 sm:mb-7 max-w-md"
              >
                {t('home.headExperienceText')}
              </motion.p>

              {/* Buttons */}
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row w-full sm:w-auto gap-3"
              >
                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base text-white bg-[#800000] hover:bg-[#6a0000] active:scale-95 transition-all duration-200 shadow-sm">
                  {t('home.headFreeTrial')}
                </button>

                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base border-2 border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white active:scale-95 transition-all duration-200">
                  {t('home.headTutorial')}
                </button>
              </motion.div>
            </motion.div>

            {/* Right — TV mockup */}
            <motion.div
              className="w-full lg:w-[45%] flex justify-center"
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
            >
              <div className="w-full max-w-sm sm:max-w-md lg:max-w-full">

                {/* Frame */}
                <div className="bg-[#111] p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl">
                  <div className="relative bg-gray-900 rounded-lg sm:rounded-xl overflow-hidden aspect-video flex items-center justify-center">

                    <img
                      src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=2070&auto=format&fit=crop"
                      alt="WisePlayer UI"
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />

                    <div className="relative z-10 text-center text-white drop-shadow-lg px-3">
                      <Flame
                        size={40}
                        className="mx-auto mb-2 text-[#800000] sm:w-[52px] sm:h-[52px]"
                        fill="#800000"
                      />
                      <p className="font-black tracking-[3px] sm:tracking-[4px] text-xs sm:text-base uppercase">
                        {t('home.brand_name')}
                      </p>
                      <p className="text-[11px] sm:text-sm opacity-50 mt-1">
                        {t('home.ready_to_stream')}
                      </p>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Stand */}
                <div className="w-20 sm:w-24 h-2 bg-[#111] mx-auto rounded-b-xl" />
                <div className="w-12 sm:w-16 h-1 bg-[#1a1a1a] mx-auto rounded-full mt-0.5 opacity-30" />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DISCLAIMER
      ══════════════════════════════════════════ */}
      <section className="py-6 md:py-8 bg-[#f4f4f7]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...fadeUp} className="text-center text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide mb-8">
            {t('home.disclaimerHeading')}
          </motion.h2>

          <motion.div
            {...fadeUp}
            className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6 md:p-8"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left text */}
              <p className="w-full lg:w-5/12 text-sm sm:text-base text-gray-500 leading-relaxed">
                {t('home.disclaimerText1')}
              </p>

              {/* Right list */}
              <ul className="w-full lg:w-7/12 space-y-2.5">
                {[1, 2, 3, 4].map((n) => (
                  <li
                    key={n}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <span className="text-[#800000] mt-0.5 text-xs shrink-0">➤</span>
                    <span className="leading-relaxed">{t(`home.disclaimerPoint${n}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section className="py-8 md:py-10 bg-[#f4f4f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-8">
            <p className="text-[#800000] font-bold tracking-[3px] text-xs uppercase mb-2">
              {t('home.featureHeadingParent')}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a]">
              {t('home.featureHeadingChild')}
            </h2>
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="group bg-white border border-black/[0.06] rounded-2xl p-7 text-center shadow-sm hover:shadow-md hover:-translate-y-1.5 hover:border-[#800000]/30 transition-all duration-300"
              >
                <div className="mb-4 flex justify-center text-[#800000] group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h5 className="font-bold text-[#1a1a1a] text-lg mb-2">{item.title}</h5>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            whileHover={{ scale: 1.015 }}
            className="relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-10 rounded-2xl border border-[#800000]/10 bg-gradient-to-r from-[#fff5f5] via-white to-[#fff0f6] shadow-sm cursor-pointer"
          >
            {/* Glow blob */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#800000] opacity-[0.06] blur-3xl pointer-events-none" />

            {/* Text */}
            <div className="text-center md:text-left z-10">
              <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a] mb-1">{t('home.cta_dive_in')}</h2>
              <h4 className="text-lg md:text-xl font-bold text-[#800000]">{t('home.cta_trial_text')}</h4>
            </div>

            {/* Brand mark */}
            <div className="flex items-center gap-3 z-10 shrink-0">
              <Flame size={40} className="text-[#800000]" fill="#800000" />
              <div className="leading-tight">
                <span className="block text-sm font-light text-gray-400 tracking-widest">{t('home.brand_small')}</span>
                <span className="block text-2xl font-extrabold text-[#1a1a1a] tracking-tight">{t('home.brand_big')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════ */}
      <section className="py-8 bg-[#eaebee]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[#800000] font-bold tracking-[3px] text-xs uppercase mb-2">{t('home.plans')}</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a]">{t('home.choose_access')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const isLifetime = plan.name === 'LIFETIME';
              return (
                <motion.div
                  key={plan.id}
                  {...fadeUp}
                  className={`
                    h-full flex flex-col items-center text-center p-7 md:p-8 rounded-2xl border transition-all duration-300
                    hover:shadow-lg hover:-translate-y-1.5
                    ${isLifetime
                      ? 'bg-[#111] text-white border-white/10'
                      : 'bg-white text-[#1a1a1a] border-black/[0.06]'
                    }
                  `}
                >
                  {/* Lifetime badge */}
                  {isLifetime && (
                    <span className="self-start mb-3 px-3 py-1 text-xs font-bold rounded-full bg-[#800000] text-white tracking-wider">
                      {t('price_lifetime_badge')}
                    </span>
                  )}

                  <h5 className={`font-extrabold uppercase tracking-widest text-sm mb-1 ${isLifetime ? 'text-gray-300' : 'text-gray-500'}`}>
                    {plan.name}
                  </h5>

                  <h2 className="text-4xl font-black my-4">
                    €{plan.price?.toFixed(2)}
                  </h2>

                  <p className={`text-sm mb-5 leading-relaxed ${isLifetime ? 'text-gray-400' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>

                  <ul className="space-y-2.5 mb-8 flex-1 w-full">
                    <li className="flex items-center justify-center gap-2.5 text-sm">
                      <CheckCircle size={16} className="text-[#800000] shrink-0" />
                      <span>{plan.durationDays} {t('home.days_access')}</span>
                    </li>
                    <li className="flex items-center justify-center gap-2.5 text-sm">
                      <CheckCircle size={16} className="text-[#800000] shrink-0" />
                      <span>{t('home.instant_activation')}</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => { planRef.current = plan.name; setShowModal(true); }}
                    className={`
                      w-full py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-200 active:scale-95
                      ${isLifetime
                        ? 'bg-[#800000] hover:bg-[#6a0000] text-white'
                        : 'border-2 border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white'
                      }
                    `}
                  >
                    {t('home.check_status')}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="py-8 md:py-10 bg-[#f4f4f7]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-extrabold text-2xl sm:text-3xl text-[#1a1a1a] mb-10">
            {t('home.faq_title')}
          </h2>

          <div className="space-y-3">
            {[
              { title: t('home.faq_mac_title'), answer: t('home.faq_mac_answer') },
              { title: t('home.faq_transfer_title'), answer: t('home.faq_transfer_answer') },
            ].map((faq, i) => (
              <FaqItem key={i} title={faq.title} answer={faq.answer} />
            ))}
          </div>

          {/* Still have questions */}
          <motion.div
            {...fadeUp}
            className="mt-10 p-7 rounded-2xl border border-black/[0.06] bg-white shadow-sm"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="text-center sm:text-left">
                <h4 className="font-bold text-lg text-[#1a1a1a] mb-1">{t('home.still_questions')}</h4>
                <p className="text-sm text-gray-500">
                  {t('home.still_questions_desc')}
                </p>
              </div>
              <button className="shrink-0 px-6 py-3 rounded-xl font-bold text-sm bg-[#800000] text-white hover:bg-[#6a0000] active:scale-95 transition-all duration-200">
                {t('home.contact_support')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="py-14 bg-white border-t border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-extrabold text-lg tracking-wide mb-4">
                <Flame size={26} className="text-[#800000]" fill="#800000" />
                {t('home.brand_upper')}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                {t('home.footerBrandText')}
              </p>
            </div>

            {/* Support */}
            <div>
              {/* <h6 className="font-bold mb-5 uppercase text-[10px] tracking-[3px] text-gray-400">
                {t('home.support')}
              </h6> */}
              <div className="space-y-4">
                {/* Reseller */}
                {/* <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {t('home.reseller')}
                  </span>
                  <a
                    href="https://wa.me/212676076001"
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-[#1a1a1a] hover:text-[#800000] transition-colors"
                  >
                    <Phone size={14} className="text-green-500" />
                    +212 676-076001
                  </a>
                </div> */}
                {/* Customer */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {t('home.customerSupport')}
                  </span>
                  <a
                    href="https://wa.me/212777754774"
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-[#1a1a1a] hover:text-[#800000] transition-colors"
                  >
                    <Phone size={14} className="text-green-500" />
                    +212 777-754774
                  </a>
                </div>
                {/* Policies */}
                <div className="flex gap-5 pt-1">
                  <Link
                    to="/privacy-policy"
                    className="text-sm font-semibold text-gray-500 transition-colors hover:text-[#800000]"
                  >
                    {t("home.privacyPolicy")}
                  </Link>
                  <Link to="/contact" 
                    className="text-sm text-gray-500 font-semibold hover:text-[#800000] transition-colors">
                    {t('home.contactUs')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="lg:text-right">
              <h6 className="font-bold mb-5 uppercase text-[10px] tracking-[3px] text-gray-400">
                {t('home.socialMedia')}
              </h6>
              <div className="flex gap-3 lg:justify-end">
                {[
                  { Icon: Instagram, label: t('home.instagram') },
                  { Icon: Twitter, label: t('home.twitter') },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#f4f4f7] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white hover:-translate-y-1 transition-all duration-200"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Divider + copyright */}
          <div className="mt-10 pt-6 border-t border-black/[0.06] text-center text-xs font-bold tracking-[2px] text-gray-400 uppercase">
            © 2026 WISEPLAYER — {t('home.beyondTheScreen')}
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════
          DEVICE ACTIVATION MODAL
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Red top bar */}
              <div className="h-1.5 bg-[#800000] w-full" />

              <div className="p-8 sm:p-10">
                {/* Icon + title */}
                <div className="text-center mb-7">
                  <div className="w-14 h-14 rounded-full bg-[#800000]/10 flex items-center justify-center mx-auto mb-4">
                    <Smartphone size={28} className="text-[#800000]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#1a1a1a] tracking-wide mb-1">
                    {t('home.device_activation')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {t('home.enter_mac_desc')}
                  </p>
                </div>

                {/* MAC input */}
                <input
                  type="text"
                  value={mac}
                  onChange={(e) => setMac(e.target.value.toUpperCase())}
                  placeholder={t('home.mac_placeholder')}
                  className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 text-center font-bold text-base tracking-[3px] uppercase outline-none transition-colors duration-200 focus:border-[#800000] mb-5"
                />

                {/* Status result */}
                <AnimatePresence>
                  {statusMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-5"
                    >
                      <div className={`
                        flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border
                        ${isActiveDevice
                          ? 'bg-green-50 text-green-800 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                        }
                      `}>
                        {isActiveDevice
                          ? <CheckCircle size={18} className="shrink-0" />
                          : <AlertTriangle size={18} className="shrink-0" />
                        }
                        {statusMsg}
                      </div>

                      <button
                        onClick={handleProceed}
                        className="mt-3 w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#1a1a1a] hover:bg-[#111] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {isActiveDevice ? t('home.proceed_payment') : t('home.activate_now')}
                        <ArrowRight size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="flex gap-3">
                  {!statusMsg && (
                    <button
                      onClick={handleSubmit}
                      className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-[#1a1a1a] hover:bg-[#111] active:scale-[0.98] transition-all duration-200"
                    >
                      {t('home.check_status')}
                    </button>
                  )}
                  <button
                    onClick={() => statusMsg ? resetModal() : setShowModal(false)}
                    className="flex-1 py-3.5 rounded-xl font-bold text-sm text-gray-500 hover:text-[#800000] hover:bg-gray-50 border border-gray-200 transition-all duration-200"
                  >
                    {statusMsg ? t('home.try_another_mac') : t('home.cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          TOAST
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {toast && (
          <div className="fixed top-5 left-0 right-0 z-[99999] flex justify-center items-start px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className={`
                pointer-events-auto px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg
                ${toast.type === 'error' ? 'bg-red-600' : 'bg-amber-500'}
              `}
            >
              {toast.msg}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// ─── FAQ Accordion Item (self-contained, no Bootstrap) ────────────────────────
const FaqItem = ({ title, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 font-bold text-[#1a1a1a] text-left hover:bg-gray-50 transition-colors duration-150"
      >
        <span>{title}</span>
        <span className={`text-[#800000] text-lg transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WisePlayerHome;