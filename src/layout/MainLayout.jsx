import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../context/dashboardContext'
import {
  Menu, Flame, User, Mail, Shield, ChevronDown, X,
  Pencil, Check, Copy, CheckCircle2, Lock, Eye, EyeOff,
  Camera, KeyRound, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
// import { updateProfile, changePassword } from '../auth/apiservice';

// ── Outside component — stable ────────────────────────────────
const availableLanguages = [
  { code: 'en', name: 'English',    flag: '🇺🇸', image: 'https://flagcdn.com/w40/us.png' },
  { code: 'fr', name: 'Français',   flag: '🇫🇷', image: 'https://flagcdn.com/w40/fr.png' },
  { code: 'es', name: 'Español',    flag: '🇪🇸', image: 'https://flagcdn.com/w40/es.png' },
  { code: 'de', name: 'Deutsch',    flag: '🇩🇪', image: 'https://flagcdn.com/w40/de.png' },
  { code: 'it', name: 'Italiano',   flag: '🇮🇹', image: 'https://flagcdn.com/w40/it.png' },
  { code: 'pt', name: 'Português',  flag: '🇵🇹', image: 'https://flagcdn.com/w40/pt.png' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', image: 'https://flagcdn.com/w40/nl.png' },
  { code: 'ar', name: 'العربية',    flag: '🇸🇦', image: 'https://flagcdn.com/w40/sa.png' },
];

const adminRoutes = [
  '/dashboard', '/users', '/requests', '/subreseller',
  '/purchase-credit', '/transition-history', '/payment-status',
];

const hideNavbarRoutes = [
  '/login', '/register', '/register-success', '/verify-otp', '/reset-password',
];

// ─── ProfileDropdown — Split panel with edit / copy / change-password ─────────
const ProfileDropdown = ({ user, avatarUrl, onClose, onProfileUpdated }) => {
  const roleLabel = user.role === 'SUB_RESELLER' ? 'Sub Reseller'
                  : user.role === 'RESELLER'     ? 'Reseller'
                  : user.role ?? 'User';

  // ── Name edit ─────────────────────────────────────────────────
  const [editingName,  setEditingName]  = useState(false);
  const [nameValue,    setNameValue]    = useState(user.fullName || '');
  const [savingName,   setSavingName]   = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  const handleSaveName = async () => {
    if (!nameValue.trim() || nameValue === user.fullName) {
      setEditingName(false); return;
    }
    setSavingName(true);
    const res = await updateProfile({ fullName: nameValue.trim() });
    setSavingName(false);
    if (res.success) {
      const updated = { ...user, fullName: nameValue.trim() };
      localStorage.setItem('user', JSON.stringify(updated));
      onProfileUpdated?.(updated);
      toast.success('Name updated');
    } else {
      toast.error(res.message || 'Failed to update name');
    }
    setEditingName(false);
  };

  // ── Avatar (local preview only — no upload API yet) ────────────
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
    toast.success('Avatar updated (local preview)');
  };

  // ── Copy email ────────────────────────────────────────────────
  const [emailCopied, setEmailCopied] = useState(false);
  const handleCopyEmail = () => {
    if (!user.email) return;
    navigator.clipboard.writeText(user.email);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 1500);
  };

  // ── Change password ───────────────────────────────────────────
  const [showPwSection,  setShowPwSection]  = useState(false);
  const [currentPw,      setCurrentPw]      = useState('');
  const [newPw,          setNewPw]          = useState('');
  const [confirmPw,      setConfirmPw]      = useState('');
  const [showCurrentPw,  setShowCurrentPw]  = useState(false);
  const [showNewPw,      setShowNewPw]      = useState(false);
  const [showConfirmPw,  setShowConfirmPw]  = useState(false);
  const [savingPw,       setSavingPw]       = useState(false);
  const [pwError,        setPwError]        = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (newPw.length < 8)          { setPwError('Password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw)        { setPwError("Passwords don't match."); return; }
    setSavingPw(true);
    const res = await changePassword(currentPw, newPw);
    setSavingPw(false);
    if (res.success) {
      toast.success('Password changed successfully');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setShowPwSection(false);
    } else {
      setPwError(res.message || 'Failed to change password');
    }
  };

  const displayAvatarUrl = avatarPreview || avatarUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,   scale: 1    }}
      exit={{   opacity: 0, y: -10,  scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="absolute top-14 right-0 w-80 rounded-2xl border border-black/[0.08] shadow-2xl overflow-hidden z-[9999]"
      style={{ background: 'var(--surface-2)' }}
    >
      {/* ── Close button ── */}
      <button onClick={onClose}
        className="absolute top-2.5 right-2.5 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white transition">
        <X size={12} />
      </button>

      {/* ══ SPLIT BODY — dark left | white right ══════════════════ */}
      <div className="flex min-h-[170px]">

        {/* ── LEFT — dark panel ── */}
        <div className="w-[40%] bg-[#1a1a1a] flex flex-col items-center justify-center gap-2.5 px-3 py-5 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-[#800000]/10 pointer-events-none" />

          {/* Avatar with camera overlay */}
          <div className="relative group">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              transition={{ delay: 0.08, type: 'spring', stiffness: 300, damping: 20 }}
              className="w-14 h-14 rounded-2xl border-2 border-[#800000]/60 overflow-hidden bg-[#800000]/20 shrink-0"
            >
              <img src={displayAvatarUrl} alt={user.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = `<span style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff">${(user.fullName?.[0] ?? 'U').toUpperCase()}</span>`;
                }}
              />
            </motion.div>

            {/* Camera overlay — appears on hover */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera size={16} className="text-white" />
            </button>
            <input
              ref={fileInputRef} type="file" accept="image/*"
              onChange={handleAvatarChange} className="hidden"
            />
          </div>

          {/* Role label */}
          <span className="text-[10px] font-black text-white/70 tracking-[2px] uppercase text-center leading-tight">
            {roleLabel}
          </span>
          <div className="w-6 h-0.5 rounded-full bg-[#800000]" />

          {/* Pulsing online dot */}
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"
            />
            <span className="text-[10px] text-green-500 font-semibold">Online</span>
          </div>
        </div>

        {/* ── RIGHT — light panel ── */}
        <div className="flex-1 flex flex-col justify-center px-4 py-4 gap-3 bg-white min-w-0">

          {/* Editable name */}
          <div className="min-w-0">
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={nameInputRef}
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                  className="flex-1 min-w-0 text-sm font-black text-gray-900 bg-[#f4f4f7] border border-[#800000]/30 rounded-lg px-2 py-1 focus:outline-none focus:border-[#800000]"
                />
                <button onClick={handleSaveName} disabled={savingName}
                  className="shrink-0 w-6 h-6 rounded-md bg-[#800000] text-white flex items-center justify-center hover:bg-[#6a0000] transition disabled:opacity-50">
                  {savingName
                    ? <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    : <Check size={11} />}
                </button>
                <button onClick={() => setEditingName(false)}
                  className="shrink-0 w-6 h-6 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition">
                  <X size={11} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group/name">
                <p className="text-sm font-black text-gray-900 truncate leading-tight min-w-0">
                  {nameValue || 'User'}
                </p>
                <button
                  onClick={() => setEditingName(true)}
                  className="shrink-0 opacity-0 group-hover/name:opacity-100 w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-[#800000] hover:bg-[#800000]/10 transition"
                >
                  <Pencil size={11} />
                </button>
              </div>
            )}
            <p className="text-[11px] text-gray-400 font-semibold mt-0.5 truncate">@{user.username}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 w-full" />

          {/* Email row — full, click to copy */}
          <div className="space-y-2 min-w-0">
            <button
              onClick={handleCopyEmail}
              className="w-full flex items-center gap-2 min-w-0 group/email text-left"
              title="Click to copy"
            >
              <div className="w-5 h-5 rounded-md bg-[#800000]/10 flex items-center justify-center shrink-0">
                <Mail size={11} className="text-[#800000]" />
              </div>
              <span className="text-[11px] text-gray-600 font-medium min-w-0 flex-1 break-all leading-relaxed">
                {user.email || '—'}
              </span>
              <span className="shrink-0 ml-1 opacity-0 group-hover/email:opacity-100 transition">
                {emailCopied
                  ? <CheckCircle2 size={12} className="text-green-500" />
                  : <Copy size={12} className="text-gray-400" />}
              </span>
            </button>
            {emailCopied && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-[10px] text-green-600 font-semibold ml-7">
                Copied!
              </motion.p>
            )}

            {/* Role row */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-md bg-[#800000]/10 flex items-center justify-center shrink-0">
                <Shield size={11} className="text-[#800000]" />
              </div>
              <span className="text-[11px] text-gray-600 font-medium truncate min-w-0">{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Change Password section ─────────────────────────────── */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setShowPwSection((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#800000]/5 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#800000]/10 flex items-center justify-center shrink-0">
              <KeyRound size={12} className="text-[#800000]" />
            </div>
            <span className="text-xs font-bold text-gray-700">Change Password</span>
          </div>
          <ChevronRight size={13} className={`text-gray-400 transition-transform duration-200 ${showPwSection ? 'rotate-90' : ''}`} />
        </button>

        <AnimatePresence>
          {showPwSection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleChangePassword} className="px-4 pb-4 space-y-2.5">
                {/* Error */}
                <AnimatePresence>
                  {pwError && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {pwError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Password inputs */}
                {[
                  { label: 'Current password',  value: currentPw,   set: setCurrentPw,   show: showCurrentPw,  setShow: setShowCurrentPw  },
                  { label: 'New password',       value: newPw,       set: setNewPw,       show: showNewPw,      setShow: setShowNewPw      },
                  { label: 'Confirm new',        value: confirmPw,   set: setConfirmPw,   show: showConfirmPw,  setShow: setShowConfirmPw  },
                ].map(({ label, value, set, show, setShow }) => (
                  <div key={label} className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      placeholder={label}
                      value={value}
                      onChange={(e) => { set(e.target.value); setPwError(''); }}
                      required
                      className="w-full pl-3 pr-8 py-2 text-xs bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-gray-800 font-semibold placeholder-gray-400"
                    />
                    <button type="button" onClick={() => setShow((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
                      {show ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                ))}

                <button type="submit" disabled={savingPw}
                  className="w-full py-2 bg-[#800000] text-white text-xs font-bold rounded-xl hover:bg-[#6a0000] transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {savingPw
                    ? <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving…</>
                    : <><Lock size={11} />Update Password</>}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom maroon strip ── */}
      <div className="h-1 w-full bg-[#800000]" />
    </motion.div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const MainLayout = ({ children }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { dashboard } = useDashboard();

  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [isLangOpen,  setIsLangOpen]  = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const langRef    = useRef(null);

  const currentPath = location.pathname.replace(/\/$/, '');
  const isAdmin    = adminRoutes.includes(currentPath);
  const hideNavbar = hideNavbarRoutes.includes(currentPath);

  const currentLang = availableLanguages.find((l) => l.code === i18n.language);

  // Read logged-in user from localStorage (saved on login)
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || {}; }
    catch { return {}; }
  })();

  const avatarSeed = encodeURIComponent(storedUser.username || storedUser.fullName || 'user');
  const avatarUrl  = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${avatarSeed}`;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
      if (langRef.current    && !langRef.current.contains(e.target))    setIsLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f4f7] overflow-x-hidden">

      {/* ── PUBLIC NAVBAR ── */}
      {!hideNavbar && !isAdmin && <Navbar />}

      {isAdmin ? (
        <div className="flex min-h-screen w-full overflow-x-hidden">

          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />

          {/* ── MAIN CONTENT ── */}
          <div className={`
            flex-1 bg-[#f4f4f7] transition-all duration-300
            ml-0 w-full min-w-0 overflow-x-hidden
            ${collapsed ? 'md:ml-[72px]' : 'md:ml-[240px] lg:ml-[260px]'}
          `}>

            {/* ── TOPBAR — fixed, never scrolls ── */}
            <div className={`
              fixed top-0 right-0 left-0 z-[1500] bg-white border-b border-black/[0.06] shadow-sm
              px-4 py-3 flex items-center justify-between transition-all duration-300
              ${collapsed ? 'md:left-[72px]' : 'md:left-[240px] lg:left-[260px]'}
            `}>

              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1a1a1a] transition-colors duration-150 border-0 shrink-0"
                >
                  <Menu size={18} />
                </button>
                <div className="flex items-center gap-2 min-w-0">
                  <Flame size={18} fill="#800000" color="#800000" className="shrink-0" />
                  <h6 className="font-bold text-[#800000] m-0 truncate">
                    {t('navbar.layout.reseller_panel')}
                  </h6>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2 shrink-0">

                {/* Credit badge */}
                <div className="h-9 flex items-center gap-1.5 px-4 rounded-full bg-[#800000] text-white text-xs font-bold border border-[#800000] shadow-sm whitespace-nowrap">
                  💰 {dashboard?.stats?.creditCoin ?? 0}
                </div>

                {/* Language picker */}
                <div className="relative" ref={langRef}>
                  <button
                    onClick={() => { setIsLangOpen((v) => !v); setIsProfileOpen(false); }}
                    className="h-9 flex items-center gap-2 px-3 rounded-full bg-white border border-black/[0.08] shadow-sm text-sm font-bold text-[#1a1a1a] hover:border-[#800000]/40 transition-all duration-200"
                  >
                    <span className="text-base">🌐</span>
                    <span>{currentLang?.flag}</span>
                  </button>

                  <AnimatePresence>
                    {isLangOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0,  scale: 1    }}
                        exit={{   opacity: 0, y: -8,  scale: 0.96 }}
                        transition={{ duration: 0.16 }}
                        className="absolute top-12 right-0 w-[190px] bg-white rounded-2xl border border-black/[0.06] shadow-xl overflow-hidden z-[9999]"
                      >
                        {availableLanguages.map((lang) => {
                          const active = i18n.language === lang.code;
                          return (
                            <button key={lang.code}
                              onClick={() => { i18n.changeLanguage(lang.code); localStorage.setItem('lang', lang.code); setIsLangOpen(false); }}
                              className={`w-full flex items-center justify-between px-4 py-3 border-0 transition-colors duration-150 ${active ? 'bg-[#800000]/[0.04]' : 'bg-white hover:bg-gray-50'}`}
                            >
                              <div className="flex items-center gap-3">
                                <img src={lang.image} alt={lang.name} className="w-5 h-5 rounded-full object-cover border border-gray-100" />
                                <div className="text-left">
                                  <p className="text-xs font-bold text-[#1a1a1a] leading-none">{lang.flag}</p>
                                  <p className="text-[11px] text-gray-400 mt-0.5">{lang.name}</p>
                                </div>
                              </div>
                              {active && <div className="w-2 h-2 rounded-full bg-[#800000] shadow-[0_0_0_3px_rgba(128,0,0,0.12)]" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Profile button + dropdown ── */}
                <div className="relative" ref={profileRef}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setIsProfileOpen((v) => !v); setIsLangOpen(false); }}
                    className={`h-9 flex items-center gap-2 pl-1 pr-3 rounded-full border transition-all duration-200 shadow-sm
                      ${isProfileOpen
                        ? 'bg-[#800000] border-[#800000]'
                        : 'bg-white border-black/[0.08] hover:border-[#800000]/40'}`}
                  >
                    {/* Mini avatar */}
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-[#800000]/10 border border-[#800000]/20 shrink-0">
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = `<span class="w-full h-full flex items-center justify-center text-[10px] font-black text-[#800000]">${(storedUser.fullName?.[0] ?? 'U').toUpperCase()}</span>`;
                        }}
                      />
                    </div>
                    {/* Name — hidden on mobile */}
                    <span className={`hidden sm:block text-xs font-bold truncate max-w-[80px] transition-colors ${isProfileOpen ? 'text-white' : 'text-[#1a1a1a]'}`}>
                      {storedUser.fullName || storedUser.username || 'Profile'}
                    </span>
                    <ChevronDown size={12} className={`shrink-0 transition-all duration-200 ${isProfileOpen ? 'rotate-180 text-white' : 'text-gray-400'}`} />
                  </motion.button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <ProfileDropdown
                        user={storedUser}
                        avatarUrl={avatarUrl}
                        onClose={() => setIsProfileOpen(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>

            {/* ── PAGE CONTENT ── */}
            <div className="p-4 pt-[76px] w-full min-w-0 overflow-x-hidden">
              {children}
            </div>
          </div>
        </div>

      ) : (
        <div>{children}</div>
      )}
    </div>
  );
};

export default MainLayout;