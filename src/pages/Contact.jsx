import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Upload, FileText, Globe, Send, Mail, ShieldCheck, Headphones, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { submitSupportTicket } from '../auth/apiservice';

const ContactUs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    macAddress: '',
    inquiryType: 'TECHNICAL_ISSUE',
    message: '',
    attachment: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await submitSupportTicket(formData);

    if (result.success) {
      setIsSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        macAddress: '',
        inquiryType: 'TECHNICAL_ISSUE',
        message: '',
        attachment: null
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    } else {
      alert(result.message || "Error submitting ticket");
    }
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-100/50 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-50/50 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center z-10 mb-12"
      >
        <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border border-red-100">
          {t('contact_Page.contact_support_center')}
        </span>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mt-4 text-slate-900">
          {t('contact_Page.contact_header_1')}{" "}
          <span className="text-red-600">
            {t('contact_Page.contact_header_2')}
          </span>
        </h1>

        <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
          {t('contact_Page.contact_sub')}
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-4 space-y-4">
          {[
            {
              icon: <Headphones className="text-red-600" />,
              title: t('contact_Page.contact_247_title'),
              desc: t('contact_Page.contact_247_desc'),
              link: "/twentyfoursvn"
            },
            {
              icon: <ShieldCheck className="text-red-600" />,
              title: t('contact_Page.contact_secure_title'),
              desc: t('contact_Page.contact_secure_desc'),
              link: "/security"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 10 }}
              onClick={() => item.link && navigate(item.link)}
              className="bg-white p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex items-start gap-4 cursor-pointer"
            >
              <div className="p-3 bg-red-50 rounded-xl">{item.icon}</div>

              <div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            </motion.div>
          ))}

          <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 rounded-3xl shadow-xl shadow-red-200 mt-6 relative overflow-hidden group">
            <Globe
              className="absolute -right-10 -bottom-10 text-white/10 group-hover:rotate-12 transition-transform duration-700"
              size={200}
            />

            <h3 className="text-white text-2xl font-bold relative z-10 italic">
              WisePlayer
            </h3>

            <p className="text-red-50 relative z-10 mt-2 text-sm">
              {t('contact_Page.contact_brand_msg')}
            </p>

            <button className="relative z-10 mt-6 bg-white text-red-600 px-6 py-2 rounded-full text-xs font-bold uppercase hover:bg-red-50 transition-colors">
              {t('contact_Page.contact_visit_site')}
            </button>
          </div>
        </div>

        <motion.div className="lg:col-span-8 bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  {t('contact_Page.contact_fname')}
                </label>

                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Steve"
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-red-400 focus:ring-4 focus:ring-red-400/10 rounded-2xl p-4 outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  {t('contact_Page.contact_lname')}
                </label>

                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Jobs"
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-red-400 focus:ring-4 focus:ring-red-400/10 rounded-2xl p-4 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                {t('contact_Page.contact_email')}
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />

                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="hello@example.com"
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-red-400 focus:ring-4 focus:ring-red-400/10 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  {t('contact_Page.contact_mac')}
                </label>

                <input
                  type="text"
                  name="macAddress"
                  value={formData.macAddress}
                  onChange={handleInputChange}
                  placeholder="00:00:00:00:00"
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-red-400 rounded-2xl p-4 outline-none transition-all font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  {t('contact_Page.contact_inquiry')}
                </label>

                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-red-400 rounded-2xl p-4 outline-none appearance-none transition-all cursor-pointer"
                >
                  <option value="TECHNICAL_ISSUE">
                    {t('contact_Page.contact_tech_issue')}
                  </option>

                  <option value="BILLING_REFUND">
                    {t('contact_Page.contact_billing')}
                  </option>

                  <option value="GENERAL_QUESTION">
                    {t('contact_Page.contact_general')}
                  </option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                {t('contact_Page.contact_message')}
              </label>

              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleInputChange}
                rows="3"
                placeholder={t('contact_Page.contact_msg_placeholder')}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-red-400 rounded-2xl p-4 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                {t('contact_Page.contact_attachments')}
              </label>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                onClick={handleUploadClick}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-all group"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="text-slate-400 group-hover:text-red-500" size={18} />
                </div>

                <p className="mt-1 text-sm font-medium text-slate-600">
                  {formData.attachment ? (
                    formData.attachment.name
                  ) : (
                    <>
                      {t('contact_Page.contact_upload_text')}{" "}
                      <span className="text-red-600">
                        {t('contact_Page.contact_browse')}
                      </span>
                    </>
                  )}
                </p>

                <p className="text-[10px] text-slate-400 mt-1 uppercase">
                  {t('contact_Page.contact_upload_hint')}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full bg-slate-900 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 tracking-widest uppercase text-sm disabled:opacity-70"
            >
              {loading ? "..." : t('contact_Page.contact_btn_submit')}
              <Send size={18} />
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-20 w-full max-w-6xl flex flex-col md:flex-row justify-between items-center text-[11px] text-slate-400 gap-6 border-t border-slate-100 pt-8 mb-8"
      >
        <p className="font-semibold tracking-tighter uppercase">
          © 2021-2026 WisePlayer Media Group. All rights reserved.
        </p>

        <div className="flex gap-8">
          <a href="#" className="hover:text-red-500 flex items-center gap-2 transition-colors uppercase font-bold">
            <FileText size={14} /> {t('footer_terms')}
          </a>

          <a href="#" className="hover:text-red-500 flex items-center gap-2 transition-colors uppercase font-bold">
            <Globe size={14} /> {t('footer_privacy')}
          </a>
        </div>
      </motion.footer>

      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 z-50 bg-white border border-slate-100 shadow-2xl p-6 rounded-3xl flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 size={28} />
            </div>

            <div>
              <h4 className="font-bold text-slate-900">
                {t('contact_Page.contact_success_title')}
              </h4>

              <p className="text-sm text-slate-500">
                {t('contact_Page.contact_success_msg')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactUs;