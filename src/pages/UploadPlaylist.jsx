import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Check, Pencil, ListMusic,
  CheckCircle2, XCircle, Info, X,
} from 'lucide-react';
import { getPlaylists, saveM3uPlaylist, updatePlaylist, deletePlaylist } from '../auth/playlistApi';
import { useTranslation } from 'react-i18next';
import Footer from '../component/Footer';
import WisePlayerLogo from '../component/WisePlayerLogo';

// ── Animation variants ────────────────────────────────────────
const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 16 } },
};

const slideDown = {
  hidden:  { opacity: 0, y: -12, height: 0 },
  visible: { opacity: 1, y: 0,  height: 'auto', transition: { type: 'spring', stiffness: 200, damping: 22 } },
  exit:    { opacity: 0, y: -8, height: 0, transition: { duration: 0.18 } },
};

const rowAnim = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
  exit:    { opacity: 0, x: 40, transition: { duration: 0.16 } },
};

/*
 * ── BRAND TOAST ──────────────────────────────────────────────
 * Same component pattern used in SubresellerDashboard — centered,
 * maroon/red/grey, no external toast library. Keeps the whole app
 * consistent instead of mixing react-toastify here and a custom
 * toast elsewhere.
 */
const BrandToast = ({ toasts }) => (
  <div className="fixed top-5 inset-x-0 z-[99999] flex flex-col items-center gap-2 pointer-events-none px-4">
    <AnimatePresence>
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError   = t.type === 'error';
        const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : Info;
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,   scale: 1     }}
            exit={{   opacity: 0, y: -12,  scale: 0.96  }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl
              text-sm font-bold text-white max-w-sm w-full
              ${isSuccess ? 'bg-[#800000]' : isError ? 'bg-red-600' : 'bg-gray-800'}`}
          >
            <Icon size={17} className="shrink-0" />
            <span className="flex-1 leading-snug">{t.msg}</span>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

// ─────────────────────────────────────────────────────────────
const PlaylistManager = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const [macAddress, setMacAddress]       = useState('');
  const [playlists, setPlaylists]         = useState([]);
  const [loadingList, setLoadingList]     = useState(false);

  // Add form state
  const [showAddForm, setShowAddForm]     = useState(false);
  const [newUrl, setNewUrl]               = useState('');
  const [newName, setNewName]             = useState('');
  const [isSaving, setIsSaving]           = useState(false);

  // Edit state — which playlistId is being edited
  const [editingId, setEditingId]         = useState(null);
  const [editUrl, setEditUrl]             = useState('');
  const [editName, setEditName]           = useState('');
  const [isUpdating, setIsUpdating]       = useState(false);

  // Delete loading
  const [deletingId, setDeletingId]       = useState(null);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget]   = useState(null);

  // Brand toasts
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3500);
  }, []);

  // ── Load MAC + playlists on mount ──────────────────────────
  useEffect(() => {
    const macFromState = location.state?.mac;
    const savedMac     = localStorage.getItem('macAddress');
    const mac = macFromState || savedMac || '';
    if (macFromState) localStorage.setItem('macAddress', macFromState);
    setMacAddress(mac);
    if (mac) loadPlaylists(mac);
  }, [location.state]);

  const loadPlaylists = async (mac) => {
    setLoadingList(true);
    const res = await getPlaylists(mac);
    setLoadingList(false);
    if (res.success && Array.isArray(res.data)) {
      setPlaylists([...res.data].reverse());
    }
  };

  // ── ADD new playlist ───────────────────────────────────────
  const handleAdd = async () => {
    if (!macAddress) { showToast(t('playlist.mac_not_found') || 'MAC address not found', 'error'); return; }
    if (!newUrl.trim() || !newName.trim()) {
      showToast(t('playlist.enter_name_link') || 'Enter a name and link', 'error');
      return;
    }
    setIsSaving(true);
    const res = await saveM3uPlaylist(macAddress, { name: newName, m3uUrl: newUrl });
    setIsSaving(false);
    if (res.success) {
      showToast(res.message || t('playlist.saved') || 'Playlist saved', 'success');
      setNewUrl('');
      setNewName('');
      setShowAddForm(false);
      loadPlaylists(macAddress);
    } else {
      showToast(res.message, 'error');
    }
  };

  // ── START editing a row — same Name + Link fields for every type ──
  const startEdit = (p) => {
    setEditingId(p.id);
    setEditName(p.name || '');
    setEditUrl(p.m3uUrl || p.url || p.serverUrl || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditUrl('');
    setEditName('');
  };

  /*
   * ── UPDATE (PUT) — same simple payload for every type ───────
   * PUT /api/playlist/public/{macAddress}/{playlistId}
   * body: { name, m3uUrl }
   */
  const handleUpdate = async (p) => {
    if (!editUrl.trim() || !editName.trim()) {
      showToast(t('playlist.enter_name_link') || 'Enter a name and link', 'error');
      return;
    }
    setIsUpdating(true);
    const res = await updatePlaylist(macAddress, p.id, { name: editName, m3uUrl: editUrl });
    setIsUpdating(false);
    if (res.success) {
      showToast(res.message || 'Playlist updated', 'success');
      cancelEdit();
      loadPlaylists(macAddress);
    } else {
      showToast(res.message || 'Failed to update playlist', 'error');
    }
  };

  // ── DELETE — confirmation modal first ───────────────────────
  const requestDelete = (p) => setDeleteTarget(p);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeletingId(id);
    const res = await deletePlaylist(macAddress, id);
    setDeletingId(null);
    setDeleteTarget(null);
    if (res.success) {
      showToast(res.message || 'Playlist deleted', 'success');
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    } else {
      showToast(res.message || 'Failed to delete playlist', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f7] px-4 py-8 sm:py-10 pb-[72px]">
      <motion.div
        className="max-w-3xl mx-auto space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* ── PAGE HEADER ──────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-black/[0.06] shadow-sm px-5 py-4
                     flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Brand logo replaces Flame — small, static (no animate, calm in a list header) */}
            <div className="w-9 h-9 rounded-xl bg-[#800000]/[0.08] flex items-center justify-center shrink-0">
              <WisePlayerLogo size={22} bg="#ffffff" />
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-[#1a1a1a] text-base sm:text-lg tracking-tight truncate">
                {t('playlist.upload_playlist') || 'Playlists'}
              </h4>
              <p className="text-xs text-gray-400 tracking-wide mt-0.5 truncate">
                {t('activation.tagline') || 'Manage your streaming sources'}
              </p>
            </div>
          </div>

          {/* MAC address pill */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center px-3 py-1.5 rounded-xl bg-[#800000]/[0.06] border border-[#800000]/20">
              <span className="font-mono font-bold text-[#800000] text-xs tracking-widest">
                {macAddress || '—'}
              </span>
            </div>

            {/* Add button — brand maroon, not black, to tie to primary action colour */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowAddForm((v) => !v)}
              className="w-10 h-10 rounded-xl bg-[#800000] hover:bg-[#6a0000] text-white
                         flex items-center justify-center border-0 shadow-sm
                         transition-colors duration-200"
            >
              <motion.div animate={{ rotate: showAddForm ? 45 : 0 }} transition={{ duration: 0.2 }}>
                <Plus size={20} />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>

        {/* ── ADD FORM — slides down ──────────────────────────── */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              key="add-form"
              variants={slideDown}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl border-2 border-[#800000]/30 shadow-sm p-5 sm:p-6 space-y-4">
                <p className="text-xs font-bold text-[#800000] uppercase tracking-widest">
                  New Playlist
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {t('playlist.name') || 'Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={t('playlist.name') || 'Playlist name'}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 bg-white text-sm text-[#1a1a1a]
                                 outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15
                                 transition-colors duration-200 placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {t('playlist.link') || 'M3U Link'}
                    </label>
                    <input
                      type="text"
                      placeholder={t('playlist.put_link') || 'https://...'}
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 bg-white text-sm text-[#1a1a1a]
                                 outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15
                                 transition-colors duration-200 placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => { setShowAddForm(false); setNewName(''); setNewUrl(''); }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-[#1a1a1a]
                               bg-gray-100 hover:bg-gray-200 transition-colors duration-150 border-0"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={!isSaving ? { scale: 1.03 } : {}}
                    whileTap={!isSaving ? { scale: 0.97 } : {}}
                    onClick={handleAdd}
                    disabled={isSaving || !newName.trim() || !newUrl.trim()}
                    className={`
                      flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold border-0 transition-all duration-200
                      ${isSaving || !newName.trim() || !newUrl.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm cursor-pointer'
                      }
                    `}
                  >
                    {isSaving ? (
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : <Check size={14} />}
                    {isSaving ? 'Saving...' : (t('playlist.save_playlist') || 'Save Playlist')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PLAYLIST LIST ─────────────────────────────────── */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">

          <div className="px-5 py-3.5 border-b border-black/[0.06] flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {t('playlist.mac_address') || 'Your Playlists'}
            </span>
            <span className="text-xs font-bold text-gray-400">
              {playlists.length > 0 ? `${playlists.length} playlist${playlists.length > 1 ? 's' : ''}` : ''}
            </span>
          </div>

          {/* Loading */}
          {loadingList && (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-sm font-semibold">Loading playlists...</span>
            </div>
          )}

          {/* Empty */}
          {!loadingList && playlists.length === 0 && (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#800000]/[0.06] flex items-center justify-center mx-auto mb-3">
                <ListMusic size={22} className="text-[#800000]/40" />
              </div>
              <p className="text-sm font-semibold text-gray-400">No playlists yet</p>
              <p className="text-xs text-gray-300 mt-1">Tap + to add your first playlist</p>
            </div>
          )}

          {/* Rows */}
          {!loadingList && playlists.length > 0 && (
            <AnimatePresence initial={false}>
              {playlists.map((p, index) => {
                const isEditing  = editingId === p.id;
                const isDeleting = deletingId === p.id;
                const isXtream   = p.type === 'XTREAM';
                const isLast     = index === playlists.length - 1;

                return (
                  <motion.div
                    key={p.id}
                    variants={rowAnim}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className={`px-5 py-4 ${!isLast ? 'border-b border-black/[0.04]' : ''}
                               transition-colors duration-150 hover:bg-gray-50/50`}
                  >
                    {isEditing ? (
                      /* ── EDIT MODE — same two fields as Add form: Name + Link ── */
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                              {t('playlist.name') || 'Name'}
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              autoFocus
                              className="w-full h-10 px-3 rounded-xl border-2 border-[#800000]/40 bg-white text-sm text-[#1a1a1a]
                                         outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15
                                         transition-colors duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                              {t('playlist.link') || 'Link'}
                            </label>
                            <input
                              type="text"
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              className="w-full h-10 px-3 rounded-xl border-2 border-[#800000]/40 bg-white text-sm text-[#1a1a1a]
                                         outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15
                                         transition-colors duration-200"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={cancelEdit}
                            disabled={isUpdating}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 bg-gray-100
                                       hover:bg-gray-200 transition-colors border-0 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          {/* SAVE → calls updatePlaylist (PUT) */}
                          <motion.button
                            whileHover={!isUpdating ? { scale: 1.04 } : {}}
                            whileTap={!isUpdating ? { scale: 0.96 } : {}}
                            onClick={() => handleUpdate(p)}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                                       text-white bg-[#800000] hover:bg-[#6a0000] border-0 transition-colors
                                       disabled:opacity-60"
                          >
                            {isUpdating ? (
                              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                            ) : <Check size={12} />}
                            {isUpdating ? 'Saving...' : 'Save'}
                          </motion.button>
                        </div>
                      </div>

                    ) : (
                      /* ── VIEW MODE ─────────────────────────── */
                      <div className="flex items-center gap-3">
                        {/* Type badge — brand maroon for both types, no blue */}
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded shrink-0 ${
                          isXtream
                            ? 'bg-[#6e1216]/10 text-[#6e1216]'
                            : 'bg-[#800000]/10 text-[#800000]'
                        }`}>
                          {p.type || 'M3U'}
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#1a1a1a] truncate">{p.name}</p>
                          <p className="text-xs text-gray-400 font-mono truncate mt-0.5">
                            {isXtream
                              ? `${p.serverUrl} • ${p.username}`
                              : (p.m3uUrl || '—')
                            }
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Edit — opens PUT update form, now available for ALL types */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => startEdit(p)}
                            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center
                                       text-gray-400 hover:text-[#800000] hover:border-[#800000]/40
                                       transition-colors duration-150"
                          >
                            <Pencil size={13} />
                          </motion.button>

                          {/* Delete — opens confirmation modal */}
                          <motion.button
                            whileHover={!isDeleting ? { scale: 1.1 } : {}}
                            whileTap={!isDeleting ? { scale: 0.9 } : {}}
                            onClick={() => requestDelete(p)}
                            disabled={isDeleting}
                            className="w-8 h-8 rounded-lg border border-red-200 bg-white flex items-center justify-center
                                       text-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white
                                       transition-colors duration-150"
                          >
                            {isDeleting ? (
                              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                            ) : <Trash2 size={13} />}
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>

      </motion.div>

      {/* ── DELETE CONFIRMATION MODAL — brand consistent ───────── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-[#800000] px-6 pt-6 pb-5 flex flex-col items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <Trash2 size={20} className="text-white" />
                </motion.div>
                <h5 className="text-base font-extrabold text-white text-center">
                  Delete Playlist
                </h5>
              </div>
              <div className="px-6 pt-5 pb-6 flex flex-col items-center gap-5">
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  Are you sure you want to delete{' '}
                  <span className="font-bold text-[#800000]">{deleteTarget.name}</span>?
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={deletingId !== null}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-200
                               hover:bg-gray-50 transition active:scale-95 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deletingId !== null}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700
                               transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {deletingId !== null ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : <><Trash2 size={14} />Delete</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.06] py-3 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 max-w-3xl mx-auto">
          <Footer />
        </div>
      </div>

      {/* ── BRAND TOAST ──────────────────────────────────────── */}
      <BrandToast toasts={toasts} />
    </div>
  );
};

export default PlaylistManager;