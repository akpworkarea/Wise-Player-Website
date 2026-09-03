import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Upload, Globe, Send, Mail,
  ShieldCheck, Headphones, CheckCircle2, Flame, Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { submitSupportTicket } from '../auth/apiservice';
import Footer from '../component/Footer';

const formatMac = (raw) => {
  const hex = raw.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 12);
  return hex.match(/.{1,2}/g)?.join(':') ?? '';
};
const isMacComplete = (mac) => /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(mac);

const FieldLabel = ({ children }) => (
  <label className="block text-[9px] sm:text-[10px] md:text-[11px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1 lg:mb-1.5">
    {children}
  </label>
);

const inputCls = `
  w-full h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 px-2.5 sm:px-3.5 lg:px-4 rounded-lg border-2 border-gray-200 bg-white
  text-xs sm:text-sm md:text-[15px] lg:text-base text-[#1a1a1a] outline-none
  focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15
  transition-colors duration-200 placeholder:text-gray-300
`;

const ContactUs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [formData, setFormData]       = useState({
    firstName:   '',
    lastName:    '',
    email:       '',
    macAddress:  '',
    inquiryType: 'TECHNICAL_ISSUE',
    message:     '',
    attachment:  null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMacChange = (e) => {
    setFormData((prev) => ({ ...prev, macAddress: formatMac(e.target.value) }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData((prev) => ({ ...prev, attachment: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMacComplete(formData.macAddress)) return;
    setLoading(true);
    const result = await submitSupportTicket(formData);
    if (result.success) {
      setIsSubmitted(true);
      setFormData({ firstName: '', lastName: '', email: '', macAddress: '', inquiryType: 'TECHNICAL_ISSUE', message: '', attachment: null });
      setTimeout(() => setIsSubmitted(false), 5000);
    } else {
      alert(result.message || 'Error submitting ticket');
    }
    setLoading(false);
  };

  const handleCardClick = (link) => {
    if (!link) return;
    if (link.startsWith('http')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      navigate(link);
    }
  };

  const macValid = isMacComplete(formData.macAddress);
  const macTouched = formData.macAddress.length > 0;

  const infoCards = [
    {
      icon: <Headphones size={18} className="text-[#800000]" />,
      title: t('contact_Page.contact_247_title'),
      desc:  t('contact_Page.contact_247_desc'),
      link:  '/twentyfoursvn',
    },
    {
      icon: <ShieldCheck size={18} className="text-[#800000]" />,
      title: t('contact_Page.contact_secure_title'),
      desc:  t('contact_Page.contact_secure_desc'),
      link:  '/security',
    },
   {
  icon: <Phone size={18} className="text-green-500" />,
  title: t("contact_Page.whatsapp_support"),
  desc: t("contact_Page.whatsapp_support_desc"),
  link: "https://wa.me/212777754774",
},
  ];

  return (
    // Hard-locked to viewport height at EVERY breakpoint — overflow-hidden, no
    // exceptions. Nothing is allowed to make the page itself scroll. The trade-off
    // (see sidebar below) is that non-essential content collapses on small screens
    // instead of stacking, because 3 full cards + a promo block + a 6-field form
    // simply cannot all fit at readable size in ~700px of phone height.
    <div className="h-[100dvh] md:h-[calc(100dvh-64px)] overflow-hidden bg-[#f4f4f7] px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex flex-col">

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-center mb-1.5 sm:mb-3 max-w-2xl mx-auto shrink-0"
      >
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/[0.06] shadow-sm text-[10px] font-bold text-[#800000] uppercase tracking-widest mb-2">
          <Flame size={10} fill="#800000" color="#800000" />
          {t('contact_Page.contact_support_center')}
        </span>

        <h1 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#1a1a1a] tracking-tight leading-tight">
          {t('contact_Page.contact_header_1')}{' '}
          <span className="text-[#800000]">{t('contact_Page.contact_header_2')}</span>
        </h1>

        <p className="hidden sm:block text-gray-500 mt-1 text-xs sm:text-sm lg:text-base max-w-xl mx-auto">
          {t('contact_Page.contact_sub')}
        </p>
      </motion.div>

      {/* ── MOBILE QUICK-LINK STRIP ──────────────────────── */}
      {/* Stand-in for the 3 full info cards below `md`. A single ~40px row
         instead of ~180px of stacked cards is what actually makes "no
         scroll" possible on phone-height screens. */}
      <div className="flex md:hidden gap-1.5 mb-1.5 shrink-0">
        {infoCards.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleCardClick(item.link)}
            className="flex-1 min-w-0 flex items-center justify-center gap-1 bg-white rounded-lg border border-black/[0.06] shadow-sm py-2 px-1 text-[9.5px] font-bold text-[#1a1a1a] active:scale-95 transition-transform"
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="truncate">{item.title}</span>
          </button>
        ))}
      </div>

      {/* ── MAIN GRID ────────────────────────────────────── */}
      {/* Two columns at `md`+, where there's actually room for full cards. */}
      <div className="max-w-6xl xl:max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 lg:gap-4 flex-1 min-h-0 w-full">

        {/* ── LEFT SIDEBAR (full cards) — md and up only ── */}
        <div className="hidden md:flex md:col-span-4 flex-col gap-2 lg:gap-3 min-h-0">

          {infoCards.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ x: 6 }}
              onClick={() => handleCardClick(item.link)}
              className="bg-white rounded-lg border border-black/[0.06] shadow-sm p-2.5 sm:p-3 lg:p-4 flex items-start gap-2.5 lg:gap-3 cursor-pointer transition-shadow hover:shadow-md shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-[#800000]/[0.08] flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[#1a1a1a] text-[12.5px] sm:text-[13.5px] lg:text-sm mb-0.5 truncate">{item.title}</h3>
                <p className="text-[10.5px] sm:text-xs lg:text-[13px] text-gray-500 leading-snug">{item.desc}</p>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="bg-[#1a1a1a] rounded-xl p-4 sm:p-5 lg:p-6 relative overflow-hidden flex-1 flex flex-col justify-center"
          >
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 rounded-full bg-[#800000]/20 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2.5">
                <Flame size={22} fill="#800000" color="#800000" />
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tight">
                  Wise<span className="text-[#800000]">Player</span>
                </span>
              </div>

              <p className="text-gray-400 text-xs sm:text-sm lg:text-[15px] leading-relaxed mb-4">
                {t('contact_Page.contact_brand_msg')}
              </p>

              <button
                onClick={() => navigate('/home')}
                className="px-5 py-2 lg:px-6 lg:py-2.5 rounded-full bg-white text-[#1a1a1a] text-xs lg:text-sm font-bold uppercase tracking-wide hover:bg-[#f4f4f7] transition-colors duration-200 border-0"
              >
                {t('contact_Page.contact_visit_site')}
              </button>
            </div>

            <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-b-[40px] border-r-[40px] border-b-[#f4f4f7] border-r-transparent border-t-transparent border-l-transparent" />
          </motion.div>
        </div>

        {/* ── RIGHT FORM ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-8 bg-white rounded-xl border border-black/[0.06] shadow-sm p-3 sm:p-5 md:p-6 lg:p-8 xl:p-10 overflow-y-auto min-h-0"
        >
          {/* overflow-y-auto above is a safety net only — with the message field
             now set to flex-1 (grows into whatever space is left), content
             should exactly fill the box at every breakpoint and this should
             never actually trigger a scrollbar. */}
          <form onSubmit={handleSubmit} className="h-full flex flex-col gap-2 sm:gap-3 lg:gap-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 shrink-0">
              <div>
                <FieldLabel>{t('contact_Page.contact_fname')}</FieldLabel>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Steve"
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel>{t('contact_Page.contact_lname')}</FieldLabel>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Jobs"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Email */}
            <div className="shrink-0">
              <FieldLabel>{t('contact_Page.contact_email')}</FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="hello@example.com"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>

            {/* MAC + Inquiry type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 shrink-0">
              <div>
                <FieldLabel>
                  {t('contact_Page.contact_mac')}
                  <span className="ml-1 text-[#800000]">*</span>
                </FieldLabel>
                <input
                  type="text"
                  name="macAddress"
                  required
                  value={formData.macAddress}
                  onChange={handleMacChange}
                  maxLength={17}
                  placeholder="AA:BB:CC:DD:EE:FF"
                  className={`
                    ${inputCls} text-center font-mono tracking-[2px] sm:tracking-[3px] uppercase
                    ${macTouched
                      ? macValid
                        ? 'border-[#800000] bg-[#800000]/[0.03] text-[#800000]'
                        : 'border-red-300 bg-red-50 text-red-600'
                      : ''
                    }
                  `}
                />
                {macTouched && (
                  <p className={`text-[9.5px] font-semibold mt-0.5 flex items-center gap-1 ${macValid ? 'text-green-600' : 'text-red-500'}`}>
                    {macValid
                      ? <><CheckCircle2 size={9} /> Valid MAC address</>
                      : <>{formData.macAddress.length}/17 — complete all 6 pairs</>
                    }
                  </p>
                )}
              </div>

              <div>
                <FieldLabel>{t('contact_Page.contact_inquiry')}</FieldLabel>
                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleInputChange}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="TECHNICAL_ISSUE">{t('contact_Page.contact_tech_issue')}</option>
                  <option value="BILLING_REFUND">{t('contact_Page.contact_billing')}</option>
                  <option value="GENERAL_QUESTION">{t('contact_Page.contact_general')}</option>
                </select>
              </div>
            </div>

            {/* Message — grows to fill whatever vertical space is left, so the
               box's height is spent on real content instead of a dead gap
               before the submit button. */}
            <div className="flex-1 min-h-[44px] flex flex-col">
              <FieldLabel>{t('contact_Page.contact_message')}</FieldLabel>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleInputChange}
                placeholder={t('contact_Page.contact_msg_placeholder')}
                className="w-full flex-1 min-h-0 px-2.5 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg border-2 border-gray-200 bg-white text-xs sm:text-sm md:text-[15px] lg:text-base text-[#1a1a1a] outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15 transition-colors duration-200 placeholder:text-gray-300 resize-none"
              />
            </div>

            {/* Attachment */}
            <div className="shrink-0">
              <FieldLabel>{t('contact_Page.contact_attachments')}</FieldLabel>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              <motion.div
                whileHover={{ borderColor: '#80000050' }}
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-200 rounded-lg p-1.5 sm:p-3 lg:p-4 flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0 cursor-pointer hover:bg-[#800000]/[0.02] transition-colors duration-200 group"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg bg-gray-100 group-hover:bg-[#800000]/[0.08] flex items-center justify-center transition-colors duration-200 shrink-0 sm:mb-1">
                  <Upload size={13} className="sm:hidden text-gray-400 group-hover:text-[#800000] transition-colors duration-200" />
                  <Upload size={15} className="hidden sm:block text-gray-400 group-hover:text-[#800000] transition-colors duration-200" />
                </div>
                <p className="text-[11px] sm:text-xs lg:text-sm font-medium text-gray-600 text-center px-2 truncate sm:whitespace-normal">
                  {formData.attachment ? (
                    <span className="text-[#800000] font-bold break-all">{formData.attachment.name}</span>
                  ) : (
                    <>
                      {t('contact_Page.contact_upload_text')}{' '}
                      <span className="text-[#800000] font-bold">{t('contact_Page.contact_browse')}</span>
                    </>
                  )}
                </p>
                <p className="hidden sm:block text-[9px] lg:text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">
                  {t('contact_Page.contact_upload_hint')}
                </p>
              </motion.div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              disabled={loading || !macValid}
              type="submit"
              className={`
                w-full py-2 sm:py-2.5 md:py-3 lg:py-3.5 rounded-lg font-bold text-xs sm:text-sm lg:text-base border-0
                flex items-center justify-center gap-2
                transition-all duration-200 tracking-wide uppercase shrink-0
                ${loading || !macValid
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#1a1a1a] hover:bg-black text-white shadow-sm hover:shadow-md cursor-pointer'
                }
              `}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <>
                  {t('contact_Page.contact_btn_submit')}
                  <Send size={16} />
                </>
              )}
            </motion.button>

          </form>
        </motion.div>
      </div>

      {/* ── SUCCESS TOAST ────────────────────────────────── */}
      <AnimatePresence>
        {isSubmitted && (
          <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{   opacity: 0, scale: 0.9,  y: 10 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-auto bg-white border border-black/[0.06] shadow-xl rounded-2xl p-4 sm:p-5 flex items-center gap-4 max-w-sm w-full"
            >
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#1a1a1a] text-sm">
                  {t('contact_Page.contact_success_title')}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('contact_Page.contact_success_msg')}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ContactUs;