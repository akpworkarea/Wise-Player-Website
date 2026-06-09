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

// ── MAC formatter — same as UploadList ───────────────────────
const formatMac = (raw) => {
  const hex = raw.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 12);
  return hex.match(/.{1,2}/g)?.join(':') ?? '';
};
const isMacComplete = (mac) => /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(mac);

// ── Reusable label ────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
    {children}
  </label>
);

// ── Input base classes ────────────────────────────────────────
const inputCls = `
  w-full h-11 px-4 rounded-xl border-2 border-gray-200 bg-white
  text-sm text-[#1a1a1a] outline-none
  focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15
  transition-colors duration-200 placeholder:text-gray-300
`;

// ─────────────────────────────────────────────────────────────
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

  const macValid = isMacComplete(formData.macAddress);
  const macTouched = formData.macAddress.length > 0;

  const infoCards = [
    {
      icon: <Headphones size={20} className="text-[#800000]" />,
      title: t('contact_Page.contact_247_title'),
      desc:  t('contact_Page.contact_247_desc'),
      link:  '/twentyfoursvn',
    },
    {
      icon: <ShieldCheck size={20} className="text-[#800000]" />,
      title: t('contact_Page.contact_secure_title'),
      desc:  t('contact_Page.contact_secure_desc'),
      link:  '/security',
    },
    {
      icon: <Phone size={20} className="text-[#800000]" />,
      title: 'WhatsApp Support',
      desc:  'Chat with us directly on WhatsApp',
      link:  'https://wa.me/212676076001',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f7] px-4 py-10 sm:py-12 pb-[72px]">

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-center mb-10 max-w-2xl mx-auto"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-sm text-xs font-bold text-[#800000] uppercase tracking-widest mb-4">
          <Flame size={12} fill="#800000" color="#800000" />
          {t('contact_Page.contact_support_center')}
        </span>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1a1a1a] tracking-tight leading-tight">
          {t('contact_Page.contact_header_1')}{' '}
          <span className="text-[#800000]">{t('contact_Page.contact_header_2')}</span>
        </h1>

        <p className="text-gray-500 mt-3 text-base sm:text-lg max-w-xl mx-auto">
          {t('contact_Page.contact_sub')}
        </p>
      </motion.div>

      {/* ── MAIN GRID ────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── LEFT SIDEBAR ─────────────────────────────── */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Info cards */}
          {infoCards.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ x: 6 }}
              onClick={() => item.link && navigate(item.link)}
              className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-5 flex items-start gap-4 cursor-pointer transition-shadow hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-[#800000]/[0.08] flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] text-sm mb-0.5">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}

          {/* Brand card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="bg-[#1a1a1a] rounded-2xl p-7 relative overflow-hidden mt-1"
          >
            {/* Glow */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-40 h-40 rounded-full bg-[#800000]/20 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={22} fill="#800000" color="#800000" />
                <span className="text-xl font-black text-white tracking-tight">
                  Wise<span className="text-[#800000]">Player</span>
                </span>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                {t('contact_Page.contact_brand_msg')}
              </p>

              <button
                onClick={() => navigate('/home')}
                className="px-5 py-2 rounded-full bg-white text-[#1a1a1a] text-xs font-bold uppercase tracking-wide hover:bg-[#f4f4f7] transition-colors duration-200 border-0"
              >
                {t('contact_Page.contact_visit_site')}
              </button>
            </div>

            {/* Corner fold */}
            <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-b-[50px] border-r-[50px] border-b-[#f4f4f7] border-r-transparent border-t-transparent border-l-transparent" />
          </motion.div>
        </div>

        {/* ── RIGHT FORM ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-8 bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* First + Last name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            <div>
              <FieldLabel>{t('contact_Page.contact_email')}</FieldLabel>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="hello@example.com"
                  className={`${inputCls} pl-10`}
                />
              </div>
            </div>

            {/* MAC + Inquiry type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* MAC with auto-colon + validation */}
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
                    ${inputCls} text-center font-mono tracking-[3px] uppercase
                    ${macTouched
                      ? macValid
                        ? 'border-[#800000] bg-[#800000]/[0.03] text-[#800000]'
                        : 'border-red-300 bg-red-50 text-red-600'
                      : ''
                    }
                  `}
                />
                {macTouched && (
                  <p className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${macValid ? 'text-green-600' : 'text-red-500'}`}>
                    {macValid
                      ? <><CheckCircle2 size={10} /> Valid MAC address</>
                      : <>{formData.macAddress.length}/17 — complete all 6 pairs</>
                    }
                  </p>
                )}
              </div>

              {/* Inquiry type */}
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

            {/* Message */}
            <div>
              <FieldLabel>{t('contact_Page.contact_message')}</FieldLabel>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                placeholder={t('contact_Page.contact_msg_placeholder')}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-[#1a1a1a] outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15 transition-colors duration-200 placeholder:text-gray-300 resize-none"
              />
            </div>

            {/* Attachment */}
            <div>
              <FieldLabel>{t('contact_Page.contact_attachments')}</FieldLabel>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              <motion.div
                whileHover={{ borderColor: '#80000050' }}
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-[#800000]/[0.02] transition-colors duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#800000]/[0.08] flex items-center justify-center transition-colors duration-200 mb-2">
                  <Upload size={18} className="text-gray-400 group-hover:text-[#800000] transition-colors duration-200" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  {formData.attachment ? (
                    <span className="text-[#800000] font-bold">{formData.attachment.name}</span>
                  ) : (
                    <>
                      {t('contact_Page.contact_upload_text')}{' '}
                      <span className="text-[#800000] font-bold">{t('contact_Page.contact_browse')}</span>
                    </>
                  )}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
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
                w-full py-3.5 rounded-xl font-bold text-sm border-0
                flex items-center justify-center gap-2
                transition-all duration-200 tracking-wide uppercase
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

      {/* ── FOOTER — fixed to bottom ──────────────────────── */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.06] py-3 px-4 z-50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 max-w-6xl mx-auto">
          <Footer />
        </div>
      </div>
       */}

      {/* ── SUCCESS TOAST ────────────────────────────────── */}
      <AnimatePresence>
        {isSubmitted && (
          <div className="fixed bottom-[72px] left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{   opacity: 0, scale: 0.9,  y: 10 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-auto bg-white border border-black/[0.06] shadow-xl rounded-2xl p-5 flex items-center gap-4 max-w-sm w-full"
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