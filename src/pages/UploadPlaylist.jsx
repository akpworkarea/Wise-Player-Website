import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronRight, Flame, CheckCircle2 } from 'lucide-react';
import { saveM3uPlaylist } from '../auth/apiservice';
import { useTranslation } from 'react-i18next';

// ── Animation variants ────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 16 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -30, scale: 0.97 },
  visible: {
    opacity: 1, x: 0, scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
  exit: {
    opacity: 0, x: 40, scale: 0.95,
    transition: { duration: 0.18 },
  },
};

const PlaylistManager = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const [macAddress, setMacAddress] = useState('');
  const [links, setLinks] = useState([{ id: 1, source: 'Link', url: '', name: '' }]);
  const [isSaving, setIsSaving]   = useState(false);
  const [isSaved, setIsSaved]     = useState(false);

  useEffect(() => {
    const macFromState = location.state?.mac;
    const savedMac     = localStorage.getItem('macAddress');
    if (macFromState) {
      setMacAddress(macFromState);
      localStorage.setItem('macAddress', macFromState);
    } else if (savedMac) {
      setMacAddress(savedMac);
    }
  }, [location.state]);

  const addRow = () => {
    setIsSaved(false);
    setLinks([...links, { id: Date.now(), source: 'Link', url: '', name: '' }]);
  };

  const removeRow = (id) => {
    if (links.length > 1) setLinks(links.filter((l) => l.id !== id));
  };

  const updateLink = (index, field, value) => {
    const updated = [...links];
    updated[index][field] = value;
    setLinks(updated);
    if (isSaved) setIsSaved(false);
  };

  // All rows must have both url and name filled
  const allFilled = links.every((l) => l.url.trim() !== '' && l.name.trim() !== '');
  const canSave   = allFilled && macAddress && !isSaving && !isSaved;

  const handleSave = async () => {
    if (!canSave) return;
    const firstLink = links[0];
    if (!macAddress) { toast.error(t('playlist.mac_not_found')); return; }

    setIsSaving(true);
    const result = await saveM3uPlaylist(macAddress, {
      name: firstLink.name,
      m3uUrl: firstLink.url,
    });

    if (result.success) {
      toast.success(result.message || t('playlist.saved'));
      setIsSaved(true);
    } else {
      toast.error(result.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f7] px-4 py-8 sm:py-10 pb-[72px]">

      <motion.div
        className="max-w-3xl mx-auto space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* ── PAGE HEADER ──────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-black/[0.06] shadow-sm px-5 py-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-[#800000]/[0.08] flex items-center justify-center shrink-0">
            <Flame size={20} fill="#800000" color="#800000" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#1a1a1a] text-base sm:text-lg tracking-tight">
              {t('playlist.upload_playlist')}
            </h4>
            <p className="text-xs text-gray-400 tracking-wide mt-0.5">
              {t('activation.tagline')}
            </p>
          </div>
        </motion.div>

        {/* ── UPLOAD FORM ──────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-5 sm:p-6"
        >

          {/* MAC display + Add button */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                {t('playlist.mac_address')}
              </label>
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#800000]/[0.06] border border-[#800000]/20"
              >
                <span className="font-mono font-bold text-[#800000] text-sm sm:text-base tracking-widest">
                  {macAddress || '—'}
                </span>
              </motion.div>
            </div>

            {/* Add row button */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={addRow}
              className="w-11 h-11 rounded-xl bg-[#1a1a1a] hover:bg-black text-white flex items-center justify-center shrink-0 mt-6 border-0 shadow-sm transition-colors duration-200"
            >
              <motion.div
                key={links.length}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <Plus size={20} />
              </motion.div>
            </motion.button>
          </div>

          {/* Link rows */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {links.map((link, index) => {
                const rowFilled = link.url.trim() !== '' && link.name.trim() !== '';
                return (
                  <motion.div
                    key={link.id}
                    layout
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`
                      flex flex-col sm:flex-row gap-2.5 items-end
                      p-3 rounded-xl border-2 transition-colors duration-200
                      ${rowFilled
                        ? 'border-[#800000]/20 bg-[#800000]/[0.02]'
                        : 'border-gray-100 bg-gray-50/50'
                      }
                    `}
                  >
                    {/* Source select */}
                    <div className="w-full sm:w-[110px] shrink-0">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {t('playlist.source')}
                      </label>
                      <select
                        value={link.source}
                        onChange={(e) => updateLink(index, 'source', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold text-[#1a1a1a] outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15 transition-colors duration-200"
                      >
                        <option>{t('playlist.link')}</option>
                        <option>{t('playlist.file')}</option>
                      </select>
                    </div>

                    {/* URL input */}
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {t('playlist.link')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('playlist.put_link')}
                        value={link.url}
                        disabled={isSaved}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        className={`
                          w-full h-11 px-4 rounded-xl border-2 text-sm text-[#1a1a1a] outline-none
                          transition-colors duration-200 placeholder:text-gray-400
                          ${isSaved
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : link.url
                              ? 'border-[#800000]/40 bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15'
                              : 'border-gray-200 bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15'
                          }
                        `}
                      />
                    </div>

                    {/* Name input */}
                    <div className="w-full sm:w-[160px] shrink-0">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {t('playlist.name')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('playlist.name')}
                        value={link.name}
                        disabled={isSaved}
                        onChange={(e) => updateLink(index, 'name', e.target.value)}
                        className={`
                          w-full h-11 px-4 rounded-xl border-2 text-sm text-[#1a1a1a] outline-none
                          transition-colors duration-200 placeholder:text-gray-400
                          ${isSaved
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : link.name
                              ? 'border-[#800000]/40 bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15'
                              : 'border-gray-200 bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15'
                          }
                        `}
                      />
                    </div>

                    {/* Delete row */}
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => removeRow(link.id)}
                      disabled={links.length === 1}
                      className={`
                        w-full sm:w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0
                        transition-colors duration-200
                        ${links.length === 1
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 bg-white text-red-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                        }
                      `}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Save button */}
          <div className="flex justify-end mt-5">
            <AnimatePresence mode="wait">
              {isSaved ? (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-green-700 bg-green-50 border-2 border-green-200"
                >
                  <CheckCircle2 size={16} />
                  {t('playlist.saved')}
                </motion.div>
              ) : (
                <motion.button
                  key="save"
                  whileHover={canSave ? { scale: 1.03 } : {}}
                  whileTap={canSave ? { scale: 0.97 } : {}}
                  onClick={handleSave}
                  disabled={!canSave}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-0
                    transition-all duration-200
                    ${canSave
                      ? 'bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm hover:shadow-md cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {t('playlist.save_playlist')}
                    </>
                  ) : (
                    <>
                      {t('playlist.save_playlist')}
                      <ChevronRight size={16} />
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

        </motion.div>

      </motion.div>

      {/* ── FOOTER — fixed to bottom ──────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.06] py-3 px-4 z-50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 max-w-3xl mx-auto">
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

      {/* Toast */}
      <ToastContainer
        position="top-center"
        autoClose={2500}
        toastStyle={{ fontSize: '13px', borderRadius: '12px' }}
      />
    </div>
  );
};

export default PlaylistManager;