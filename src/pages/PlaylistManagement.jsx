// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//   Radio, Tv2, Link2, Server, User as UserIcon, Lock, Eye, EyeOff,
//   Plus, Pencil, Trash2, Search, X, Pin, PinOff, Smartphone,
//   AlertTriangle, CheckCircle2, XCircle, Info, Copy, Link,
//   ChevronDown, ListFilter, Loader2, Star,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { MdClose } from "react-icons/md";
// import { useAuth } from "../context/AuthContext";
// import {
//   getPlaylists, createM3uPlaylist, createXtreamPlaylist,
//   updatePlaylist, deletePlaylist, assignPlaylist,
//   unassignPlaylist, togglePinPlaylist,
// } from "../auth/api/playlistApi";
// import { getUserDevices } from "../auth/api/userManagement";

// // ─── Brand Toast ────────────────────────────────────────────────────────
// const BrandToast = ({ toasts }) => (
//   <div className="fixed top-5 inset-x-0 z-[99999] flex flex-col items-center gap-2 pointer-events-none px-4">
//     <AnimatePresence>
//       {toasts.map((t) => {
//         const isSuccess = t.type === "success";
//         const isError = t.type === "error";
//         const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : Info;
//         return (
//           <motion.div
//             key={t.id}
//             initial={{ opacity: 0, y: -16, scale: 0.96 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: -12, scale: 0.96 }}
//             transition={{ type: "spring", stiffness: 400, damping: 28 }}
//             className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl
//               text-sm font-bold text-white max-w-sm w-full
//               ${isSuccess ? "bg-[#800000]" : isError ? "bg-red-600" : "bg-gray-800"}`}
//           >
//             <Icon size={17} className="shrink-0" />
//             <span className="flex-1 leading-snug">{t.msg}</span>
//           </motion.div>
//         );
//       })}
//     </AnimatePresence>
//   </div>
// );

// function useDebounce(value, delay) {
//   const [d, setD] = useState(value);
//   useEffect(() => {
//     const id = setTimeout(() => setD(value), delay);
//     return () => clearTimeout(id);
//   }, [value, delay]);
//   return d;
// }

// // ─── TypeBadge ──────────────────────────────────────────────────────────
// const TypeBadge = ({ type }) => {
//   const isXtream = type === "XTREAM";
//   return (
//     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide shrink-0
//       ${isXtream ? "bg-indigo-100 text-indigo-700" : "bg-[#800000]/10 text-[#800000]"}`}>
//       {isXtream ? <Tv2 size={11} /> : <Radio size={11} />}
//       {isXtream ? "Xtream" : "M3U"}
//     </span>
//   );
// };

// // ─── LockBadge — NEW: shows isLocked (PIN-protected), distinct from "pinned" ──
// const LockBadge = ({ locked }) =>
//   locked ? (
//     <span title="PIN protected" className="inline-flex items-center justify-center text-gray-400 shrink-0">
//       <Lock size={11} />
//     </span>
//   ) : null;

// // ─── PinButton ──────────────────────────────────────────────────────────
// const PinButton = ({ pinned, onClick, busy }) => (
//   <button
//     onClick={onClick}
//     disabled={busy}
//     title={pinned ? "Unpin playlist" : "Pin playlist"}
//     className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border transition active:scale-90 disabled:opacity-50
//       ${pinned
//         ? "bg-amber-50 border-amber-300 text-amber-500"
//         : "bg-white border-gray-200 text-gray-300 hover:border-amber-300 hover:text-amber-400"}`}
//   >
//     {busy
//       ? <Loader2 size={15} className="animate-spin" />
//       : (
//         <motion.span
//           animate={pinned ? { rotate: [0, -15, 15, -8, 0], scale: [1, 1.25, 1] } : { rotate: 0, scale: 1 }}
//           transition={{ duration: 0.4 }}
//         >
//           <Star size={15} fill={pinned ? "currentColor" : "none"} />
//         </motion.span>
//       )}
//   </button>
// );

// const CopyButton = ({ value, copiedId, onCopy }) => {
//   const isThis = copiedId === value;
//   return (
//     <button onClick={() => onCopy(value)}
//       className="shrink-0 text-gray-400 hover:text-[#800000] transition p-1 rounded-md hover:bg-red-50"
//       title="Copy URL">
//       {isThis ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
//     </button>
//   );
// };

// const EmptyState = ({ hasFilters, onClear, onCreate }) => (
//   <div className="flex flex-col items-center gap-2 py-14 text-gray-400">
//     <div className="w-14 h-14 rounded-2xl bg-[#800000]/5 flex items-center justify-center mb-1">
//       <Radio size={24} className="text-[#800000]/40" />
//     </div>
//     <p className="font-semibold text-sm text-center">
//       {hasFilters ? "No playlists match your filters" : "No playlists yet"}
//     </p>
//     {hasFilters ? (
//       <button onClick={onClear} className="text-xs text-[#800000] font-bold hover:underline">Clear filters</button>
//     ) : (
//       <button onClick={onCreate}
//         className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#800000] hover:bg-[#6a0000] px-4 py-2 rounded-xl transition active:scale-95">
//         <Plus size={13} /> Create your first playlist
//       </button>
//     )}
//   </div>
// );

// const SkeletonCard = () => (
//   <div className="bg-white rounded-xl shadow border border-gray-200 p-4 animate-pulse space-y-3">
//     <div className="flex justify-between">
//       <div className="h-4 bg-gray-200 rounded w-2/5" />
//       <div className="h-5 bg-gray-200 rounded-full w-16" />
//     </div>
//     <div className="h-3 bg-gray-200 rounded w-3/4" />
//     <div className="flex gap-2 pt-1">
//       <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
//       <div className="w-9 h-9 bg-gray-200 rounded-xl" />
//       <div className="w-9 h-9 bg-gray-200 rounded-xl" />
//       <div className="w-9 h-9 bg-gray-200 rounded-xl" />
//     </div>
//   </div>
// );

// const FormField = ({ label, icon: Icon, required, children }) => (
//   <div className="space-y-1.5">
//     <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
//       <Icon size={11} className="text-[#800000]" />
//       {label}
//       {required && <span className="text-[#800000] text-sm leading-none">*</span>}
//     </label>
//     {children}
//   </div>
// );

// const inputCls = "w-full px-4 py-3 bg-[#f4f4f7] border-2 border-transparent rounded-xl focus:border-[#800000] focus:bg-white focus:outline-none transition-all duration-200 text-sm font-semibold text-gray-800 placeholder:font-normal placeholder:text-gray-400";

// // ─── PlaylistCard — mobile/tablet ───────────────────────────────────────
// const PlaylistCard = ({
//   playlist, copiedId, onCopy, onEdit, onDelete, onAssign, onTogglePin, pinBusyId,
// }) => (
//   <motion.div
//     layout
//     initial={{ opacity: 0, y: 8 }}
//     animate={{ opacity: 1, y: 0 }}
//     exit={{ opacity: 0, scale: 0.96 }}
//     className={`bg-white p-4 rounded-xl shadow border space-y-3 transition-colors
//       ${playlist.pinned ? "border-amber-300 ring-1 ring-amber-200" : "border-gray-200"}`}
//   >
//     <div className="flex items-start justify-between gap-2">
//       <div className="min-w-0">
//         <p className="font-bold text-sm text-gray-800 truncate flex items-center gap-1.5">
//           {playlist.name}
//           <LockBadge locked={playlist.isLocked} />
//         </p>
//         <div className="mt-1"><TypeBadge type={playlist.type} /></div>
//       </div>
//       <PinButton pinned={playlist.pinned} busy={pinBusyId === playlist.id} onClick={() => onTogglePin(playlist)} />
//     </div>

//     <div className="flex items-center gap-1.5 bg-[#f4f4f7] rounded-lg px-2.5 py-2 min-w-0">
//       <Link2 size={12} className="text-gray-400 shrink-0" />
//       <span className="text-[11px] text-gray-600 font-medium truncate flex-1">
//         {playlist.m3uUrl || playlist.serverUrl || "—"}
//       </span>
//       <CopyButton value={playlist.m3uUrl || playlist.serverUrl} copiedId={copiedId} onCopy={onCopy} />
//     </div>

//     <div className="flex gap-2 pt-1">
//       <button onClick={() => onAssign(playlist)}
//         className="flex-1 py-2.5 rounded-xl bg-[#800000] text-white text-sm font-bold hover:bg-[#6a0000] transition active:scale-95 flex items-center justify-center gap-1.5">
//         <Smartphone size={14} /> Assign
//       </button>
//       <button onClick={() => onEdit(playlist)} title="Edit"
//         className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-[#800000] hover:text-[#800000] hover:bg-red-50 transition active:scale-95">
//         <Pencil size={15} />
//       </button>
//       <button onClick={() => onDelete(playlist)} title="Delete"
//         className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white transition active:scale-95">
//         <Trash2 size={15} />
//       </button>
//     </div>
//   </motion.div>
// );

// // ═════════════════════════════════════════════════════════════════════════
// const PlaylistManagement = () => {
//   const { userRole } = useAuth();

//   const [playlists,   setPlaylists]   = useState([]);
//   const [loading,      setLoading]      = useState(true);
//   const [search,        setSearch]        = useState("");
//   const debouncedSearch                   = useDebounce(search, 350);
//   const [typeFilter,   setTypeFilter]   = useState("");
//   const [pinnedOnly,   setPinnedOnly]   = useState(false);
//   const [showFilter,   setShowFilter]   = useState(false);

//   const [copiedId, setCopiedId] = useState(null);
//   const [pinBusyId, setPinBusyId] = useState(null);

//   const [toasts, setToasts] = useState([]);
//   const showToast = useCallback((msg, type = "success") => {
//     const id = Date.now();
//     setToasts((p) => [...p, { id, msg, type }]);
//     setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
//   }, []);

//   // ── Create modal ────────────────────────────────────────────────────
//   const [createModal, setCreateModal] = useState(false);
//   const [createType,  setCreateType]  = useState("M3U");
//   const [creating,    setCreating]    = useState(false);
//   const [createError, setCreateError] = useState("");
//   // NEW: pin added to both form shapes
//   const [m3uForm,     setM3uForm]     = useState({ name: "", m3uUrl: "", pin: "" });
//   const [xtreamForm,  setXtreamForm]  = useState({ name: "", serverUrl: "", username: "", password: "", pin: "" });
//   const [showXtreamPwd, setShowXtreamPwd] = useState(false);
//   const [showCreatePin, setShowCreatePin] = useState(false);

//   // Helper so one PIN field can serve whichever tab is active
//   const activeForm    = createType === "M3U" ? m3uForm : xtreamForm;
//   const setActivePin  = (v) => {
//     const digits = v.replace(/\D/g, "").slice(0, 4);
//     createType === "M3U"
//       ? setM3uForm((p) => ({ ...p, pin: digits }))
//       : setXtreamForm((p) => ({ ...p, pin: digits }));
//   };

//   // ── Edit modal ───────────────────────────────────────────────────────
//   const [editModal, setEditModal] = useState(false);
//   const [editTarget, setEditTarget] = useState(null);
//   const [editForm,   setEditForm]   = useState({});
//   const [saving,     setSaving]     = useState(false);
//   const [editError,  setEditError]  = useState("");
//   const [showEditPwd, setShowEditPwd] = useState(false);
//   const [showEditPin, setShowEditPin] = useState(false);

//   // ── Delete modal ─────────────────────────────────────────────────────
//   const [deleteModal, setDeleteModal] = useState(false);
//   const [deleteTarget, setDeleteTarget] = useState(null);
//   const [deleting, setDeleting] = useState(false);

//   // ── Assign modal ─────────────────────────────────────────────────────
//   const [assignModal,  setAssignModal]  = useState(false);
//   const [assignTarget, setAssignTarget] = useState(null);
//   const [deviceSearch, setDeviceSearch] = useState("");
//   const debouncedDeviceSearch = useDebounce(deviceSearch, 350);
//   const [devices,       setDevices]       = useState([]);
//   const [devicesLoading, setDevicesLoading] = useState(false);
//   const [selectedDevice, setSelectedDevice] = useState(null);
//   const [assigning,      setAssigning]      = useState(false);

//   const filterRef = useRef(null);
//   useEffect(() => {
//     const h = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false); };
//     document.addEventListener("mousedown", h);
//     return () => document.removeEventListener("mousedown", h);
//   }, []);

//   const fetchPlaylists = useCallback(async () => {
//     if (!userRole) return;
//     setLoading(true);
//     const res = await getPlaylists(userRole);
//     if (res.success) setPlaylists(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
//     else showToast(res.message || "Failed to load playlists", "error");
//     setLoading(false);
//   }, [userRole, showToast]);

//   useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);

//   useEffect(() => {
//     if (!assignModal || !userRole) return;
//     let active = true;
//     setDevicesLoading(true);
//     getUserDevices(userRole, 0, 20, debouncedDeviceSearch).then((res) => {
//       if (!active) return;
//       if (res.success) setDevices(res.data?.content ?? res.data ?? []);
//       setDevicesLoading(false);
//     });
//     return () => { active = false; };
//   }, [assignModal, userRole, debouncedDeviceSearch]);

//   const filtered = playlists.filter((p) => {
//     const matchesSearch = !debouncedSearch ||
//       p.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//       p.m3uUrl?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//       p.serverUrl?.toLowerCase().includes(debouncedSearch.toLowerCase());
//     const matchesType = !typeFilter || p.type === typeFilter;
//     const matchesPinned = !pinnedOnly || p.pinned;
//     return matchesSearch && matchesType && matchesPinned;
//   }).sort((a, b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1));

//   const hasFilters = !!(debouncedSearch || typeFilter || pinnedOnly);
//   const clearFilters = () => { setSearch(""); setTypeFilter(""); setPinnedOnly(false); setShowFilter(false); };

//   const onCopy = (text) => {
//     if (!text) return;
//     navigator.clipboard.writeText(text);
//     setCopiedId(text);
//     setTimeout(() => setCopiedId(null), 1500);
//   };

//   const handleTogglePin = async (playlist) => {
//     setPinBusyId(playlist.id);
//     const res = await togglePinPlaylist(userRole, playlist.id);
//     setPinBusyId(null);
//     if (res.success) {
//       setPlaylists((prev) => prev.map((p) => (p.id === playlist.id ? { ...p, pinned: res.data?.pinned ?? !p.pinned } : p)));
//       showToast(res.message || (playlist.pinned ? "Playlist unpinned" : "Playlist pinned"), "success");
//     } else {
//       showToast(res.message || "Failed to update pin", "error");
//     }
//   };

//   // ── Create ──────────────────────────────────────────────────────────
//   const openCreate = () => {
//     setCreateType("M3U"); setCreateError(""); setShowCreatePin(false);
//     setM3uForm({ name: "", m3uUrl: "", pin: "" });
//     setXtreamForm({ name: "", serverUrl: "", username: "", password: "", pin: "" });
//     setCreateModal(true);
//   };

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     if (activeForm.pin.length !== 4) {
//       setCreateError("Security PIN must be exactly 4 digits");
//       return;
//     }
//     setCreating(true); setCreateError("");
//     const res = createType === "M3U"
//       ? await createM3uPlaylist(userRole, m3uForm)
//       : await createXtreamPlaylist(userRole, xtreamForm);
//     setCreating(false);
//     if (res.success) {
//       setCreateModal(false);
//       fetchPlaylists();
//       showToast("Playlist created successfully", "success");
//     } else {
//       setCreateError(res.message);
//       showToast(res.message || "Failed to create playlist", "error");
//     }
//   };

//   // ── Edit ────────────────────────────────────────────────────────────
//   const openEdit = (playlist) => {
//     setEditTarget(playlist);
//     setEditError(""); setShowEditPwd(false); setShowEditPin(false);
//     setEditForm(
//       playlist.type === "XTREAM"
//         ? { name: playlist.name, serverUrl: playlist.serverUrl || "", username: playlist.username || "", password: "", pin: "" }
//         : { name: playlist.name, m3uUrl: playlist.m3uUrl || "", pin: "" }
//     );
//     setEditModal(true);
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     setSaving(true); setEditError("");
//     const payload = { ...editForm };
//     if (editTarget.type === "XTREAM" && !payload.password) delete payload.password;
//     if (!payload.pin) delete payload.pin; // only send pin if the user actually typed a new one
//     const res = await updatePlaylist(userRole, editTarget.id, payload);
//     setSaving(false);
//     if (res.success) {
//       setEditModal(false);
//       fetchPlaylists();
//       showToast(res.message || "Playlist updated successfully", "success");
//     } else {
//       setEditError(res.message);
//       showToast(res.message || "Failed to update playlist", "error");
//     }
//   };

//   // ── Delete ──────────────────────────────────────────────────────────
//   const openDelete = (playlist) => { setDeleteTarget(playlist); setDeleteModal(true); };

//   const handleDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleting(true);
//     const res = await deletePlaylist(userRole, deleteTarget.id);
//     setDeleting(false);
//     if (res.success) {
//       showToast(`"${deleteTarget.name}" deleted successfully`, "success");
//       setDeleteModal(false); setDeleteTarget(null);
//       setPlaylists((prev) => prev.filter((p) => p.id !== deleteTarget.id));
//     } else {
//       showToast(res.message || "Failed to delete playlist", "error");
//     }
//   };

//   // ── Assign ──────────────────────────────────────────────────────────
//   const openAssign = (playlist) => {
//     setAssignTarget(playlist);
//     setDeviceSearch(""); setSelectedDevice(null); setDevices([]);
//     setAssignModal(true);
//   };

//   const handleAssign = async () => {
//     if (!assignTarget || !selectedDevice) return;
//     setAssigning(true);
//     const res = await assignPlaylist(userRole, assignTarget.id, selectedDevice.deviceId || selectedDevice.id);
//     setAssigning(false);
//     if (res.success) {
//       showToast(res.message || "Playlist assigned successfully", "success");
//       setAssignModal(false);
//     } else {
//       showToast(res.message || "Failed to assign playlist", "error");
//     }
//   };

//   const activeFilterCount = [typeFilter, pinnedOnly].filter(Boolean).length;

//   return (
//     <div className="h-full flex flex-col bg-[#f4f4f7] overflow-hidden">

//       {/* ══ STICKY HEADER ══════════════════════════════════════════════ */}
//       <div className="shrink-0 sticky top-0 bg-[#f4f4f7] px-4 pt-4 pb-3 space-y-3 z-30">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
//           <div className="shrink-0">
//             <h3 className="font-bold text-[#800000] text-lg leading-tight flex items-center gap-2">
//               <Radio size={18} /> Playlist Management
//             </h3>
//             <p className="text-gray-500 text-xs mt-0.5">Manage M3U and Xtream playlists and assign them to devices</p>
//           </div>

//           <div className="flex items-center gap-2 w-full lg:w-auto min-w-0">
//             <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm
//                             flex-1 min-w-0 lg:flex-none lg:w-[220px] min-[1400px]:w-[280px]">
//               <div className="relative w-full">
//                 <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//                 <input
//                   type="text"
//                   placeholder="Search playlists…"
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="w-full pl-8 pr-7 py-2.5 text-sm text-gray-700 bg-white focus:outline-none placeholder-gray-400"
//                 />
//                 {search && (
//                   <button onClick={() => setSearch("")}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
//                     <X size={13} />
//                   </button>
//                 )}
//               </div>
//             </div>

//             <div className="relative shrink-0" ref={filterRef}>
//               <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowFilter((v) => !v)}
//                 className={`flex items-center justify-center gap-1.5 w-10 min-[1400px]:w-auto min-[1400px]:px-4 h-10 rounded-xl border text-sm font-semibold transition
//                   ${activeFilterCount > 0 ? "bg-[#800000] text-white border-[#800000] shadow-md" : "bg-white text-gray-700 border-gray-200 hover:border-[#800000] hover:text-[#800000] shadow-sm"}`}>
//                 <ListFilter size={15} />
//                 <span className="hidden min-[1400px]:inline">Filters</span>
//                 {activeFilterCount > 0 && (
//                   <span className="hidden min-[1400px]:flex bg-white text-[#800000] text-[10px] font-black w-4 h-4 rounded-full items-center justify-center">
//                     {activeFilterCount}
//                   </span>
//                 )}
//                 <ChevronDown size={12} className={`hidden min-[1400px]:block transition-transform ${showFilter ? "rotate-180" : ""}`} />
//               </motion.button>

//               <AnimatePresence>
//                 {showFilter && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 8, scale: 0.97 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: 8, scale: 0.97 }}
//                     transition={{ type: "spring", stiffness: 400, damping: 30 }}
//                     className="absolute right-0 top-full mt-2 z-[60] bg-white border border-gray-200 rounded-2xl shadow-2xl w-64 p-5 space-y-4"
//                   >
//                     <div>
//                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</span>
//                       <div className="flex gap-2 mt-2">
//                         {[{ v: "", label: "All" }, { v: "M3U", label: "M3U" }, { v: "XTREAM", label: "Xtream" }].map((o) => (
//                           <button key={o.v || "all"} onClick={() => setTypeFilter(o.v)}
//                             className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition
//                               ${typeFilter === o.v ? "bg-[#800000] text-white border-[#800000]" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#800000] hover:text-[#800000]"}`}>
//                             {o.label}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                     <label className="flex items-center gap-2.5 cursor-pointer select-none">
//                       <div onClick={() => setPinnedOnly((v) => !v)}
//                         className={`w-10 h-5 rounded-full relative shrink-0 transition-colors ${pinnedOnly ? "bg-[#800000]" : "bg-gray-200"}`}>
//                         <motion.div animate={{ x: pinnedOnly ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                           className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
//                       </div>
//                       <span className="text-xs font-bold text-gray-700 flex items-center gap-1"><Star size={12} className="text-amber-400" /> Pinned only</span>
//                     </label>
//                     {activeFilterCount > 0 && (
//                       <button onClick={clearFilters} className="w-full py-2 text-xs font-bold text-[#800000] hover:bg-red-50 rounded-xl transition">
//                         Clear filters
//                       </button>
//                     )}
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

//             <motion.button whileTap={{ scale: 0.95 }} onClick={openCreate}
//               className="flex items-center justify-center gap-1.5 w-10 min-[1400px]:w-auto min-[1400px]:px-4 h-10
//                          bg-[#800000] text-white rounded-xl text-sm font-semibold hover:bg-[#6a0000] transition shadow-sm shrink-0">
//               <Plus size={15} />
//               <span className="hidden min-[1400px]:inline">New Playlist</span>
//             </motion.button>
//           </div>
//         </div>
//       </div>

//       {/* ══ CONTENT ═══════════════════════════════════════════════════ */}
//       <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

//         <div className="hidden lg:block bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
//           <table className="w-full text-sm">
//             <colgroup>
//               <col style={{ width: "30%" }} /><col style={{ width: "12%" }} />
//               <col style={{ width: "34%" }} /><col style={{ width: "8%" }} /><col style={{ width: "16%" }} />
//             </colgroup>
//             <thead className="bg-gray-100 border-b border-gray-200">
//               <tr>
//                 {["Name", "Type", "Source", "Pin", "Actions"].map((c) => (
//                   <th key={c} className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 first:text-left">{c}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {loading ? (
//                 [...Array(4)].map((_, i) => (
//                   <tr key={i} className="animate-pulse border-t">
//                     {[30, 12, 34, 8, 16].map((w, j) => (
//                       <td key={j} className="px-4 py-4"><div className="h-3 bg-gray-200 rounded mx-auto" style={{ width: `${w * 2}%` }} /></td>
//                     ))}
//                   </tr>
//                 ))
//               ) : filtered.length > 0 ? (
//                 filtered.map((p, idx) => (
//                   <tr key={p.id} className={`transition-colors hover:bg-red-50/30 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"} ${p.pinned ? "bg-amber-50/40" : ""}`}>
//                     <td className="px-4 py-3.5 text-left">
//                       <span className="font-bold text-gray-800 text-sm truncate flex items-center gap-1.5">
//                         {p.pinned && <Star size={12} fill="currentColor" className="text-amber-400 shrink-0" />}
//                         {p.name}
//                         <LockBadge locked={p.isLocked} />
//                       </span>
//                     </td>
//                     <td className="px-4 py-3.5 text-center"><TypeBadge type={p.type} /></td>
//                     <td className="px-4 py-3.5">
//                       <div className="flex items-center gap-1.5 justify-center min-w-0">
//                         <Link2 size={12} className="text-gray-400 shrink-0" />
//                         <span className="text-xs text-gray-500 font-medium truncate max-w-[260px]">{p.m3uUrl || p.serverUrl || "—"}</span>
//                         <CopyButton value={p.m3uUrl || p.serverUrl} copiedId={copiedId} onCopy={onCopy} />
//                       </div>
//                     </td>
//                     <td className="px-4 py-3.5 text-center">
//                       <div className="flex justify-center"><PinButton pinned={p.pinned} busy={pinBusyId === p.id} onClick={() => handleTogglePin(p)} /></div>
//                     </td>
//                     <td className="px-4 py-3.5">
//                       <div className="flex justify-center gap-2">
//                         <button onClick={() => openAssign(p)} className="px-3 py-1.5 rounded-lg bg-[#800000] text-white hover:bg-[#6a0000] text-xs font-bold transition active:scale-95 shadow-sm flex items-center gap-1">
//                           <Smartphone size={12} /> Assign
//                         </button>
//                         <button onClick={() => openEdit(p)} title="Edit" className="p-1.5 rounded-lg border border-gray-200 hover:border-[#800000] hover:text-[#800000] hover:bg-red-50 text-gray-500 transition active:scale-95"><Pencil size={13} /></button>
//                         <button onClick={() => openDelete(p)} title="Delete" className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white transition active:scale-95"><Trash2 size={13} /></button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr><td colSpan="5" className="py-12"><EmptyState hasFilters={hasFilters} onClear={clearFilters} onCreate={openCreate} /></td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
//           {loading ? (
//             [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
//           ) : filtered.length > 0 ? (
//             <AnimatePresence>
//               {filtered.map((p) => (
//                 <PlaylistCard key={p.id} playlist={p} copiedId={copiedId} onCopy={onCopy}
//                   onEdit={openEdit} onDelete={openDelete} onAssign={openAssign}
//                   onTogglePin={handleTogglePin} pinBusyId={pinBusyId} />
//               ))}
//             </AnimatePresence>
//           ) : (
//             <div className="md:col-span-2"><EmptyState hasFilters={hasFilters} onClear={clearFilters} onCreate={openCreate} /></div>
//           )}
//         </div>
//       </div>

//       {/* ══ CREATE MODAL ══════════════════════════════════════════════ */}
//       <AnimatePresence>
//         {createModal && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4">
//             <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
//               className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
//               <div className="bg-[#800000] px-6 pt-6 pb-5 relative">
//                 <button onClick={() => setCreateModal(false)}
//                   className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition">
//                   <MdClose size={20} />
//                 </button>
//                 <div className="flex items-center gap-3">
//                   <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
//                     <Plus size={20} className="text-white" />
//                   </div>
//                   <div>
//                     <h5 className="text-white font-extrabold text-base leading-tight">New Playlist</h5>
//                     <p className="text-white/60 text-xs mt-0.5">Add an M3U link or an Xtream account</p>
//                   </div>
//                 </div>

//                 <div className="flex bg-white/10 rounded-xl p-1 mt-4">
//                   {[{ v: "M3U", label: "M3U", icon: Radio }, { v: "XTREAM", label: "Xtream", icon: Tv2 }].map((tab) => (
//                     <button key={tab.v} type="button" onClick={() => { setCreateType(tab.v); setCreateError(""); }}
//                       className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition
//                         ${createType === tab.v ? "bg-white text-[#800000]" : "text-white/70 hover:text-white"}`}>
//                       <tab.icon size={13} /> {tab.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <form onSubmit={handleCreate} className="p-6 space-y-4">
//                 {createError && (
//                   <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
//                     className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
//                     <AlertTriangle size={15} className="shrink-0" />
//                     <span className="font-semibold">{createError}</span>
//                   </motion.div>
//                 )}

//                 <AnimatePresence mode="wait">
//                   {createType === "M3U" ? (
//                     <motion.div key="m3u" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-4">
//                       <FormField label="Playlist Name" icon={Radio} required>
//                         <input className={inputCls} placeholder="e.g. My M3U Playlist" value={m3uForm.name}
//                           onChange={(e) => setM3uForm({ ...m3uForm, name: e.target.value })} required />
//                       </FormField>
//                       <FormField label="M3U URL" icon={Link2} required>
//                         <input className={inputCls} placeholder="http://example.com/playlist.m3u" value={m3uForm.m3uUrl}
//                           onChange={(e) => setM3uForm({ ...m3uForm, m3uUrl: e.target.value })} required />
//                       </FormField>
//                     </motion.div>
//                   ) : (
//                     <motion.div key="xtream" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-4">
//                       <FormField label="Playlist Name" icon={Tv2} required>
//                         <input className={inputCls} placeholder="e.g. My Xtream Playlist" value={xtreamForm.name}
//                           onChange={(e) => setXtreamForm({ ...xtreamForm, name: e.target.value })} required />
//                       </FormField>
//                       <FormField label="Server URL" icon={Server} required>
//                         <input className={inputCls} placeholder="http://xtream-server.com" value={xtreamForm.serverUrl}
//                           onChange={(e) => setXtreamForm({ ...xtreamForm, serverUrl: e.target.value })} required />
//                       </FormField>
//                       <FormField label="Username" icon={UserIcon} required>
//                         <input className={inputCls} placeholder="xtream_user" value={xtreamForm.username}
//                           onChange={(e) => setXtreamForm({ ...xtreamForm, username: e.target.value })} required />
//                       </FormField>
//                       <FormField label="Password" icon={Lock} required>
//                         <div className="relative">
//                           <input type={showXtreamPwd ? "text" : "password"} className={`${inputCls} pr-11`} placeholder="xtream_pass"
//                             value={xtreamForm.password} onChange={(e) => setXtreamForm({ ...xtreamForm, password: e.target.value })} required />
//                           <button type="button" tabIndex={-1} onClick={() => setShowXtreamPwd((v) => !v)}
//                             className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
//                             {showXtreamPwd ? <EyeOff size={16} /> : <Eye size={16} />}
//                           </button>
//                         </div>
//                       </FormField>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* NEW — Security PIN, shared across both tabs */}
//                 <FormField label="Security PIN (4 digits)" icon={Lock} required>
//                   <div className="relative">
//                     <input
//                       type={showCreatePin ? "text" : "password"}
//                       inputMode="numeric"
//                       maxLength={4}
//                       className={`${inputCls} pr-11 tracking-[6px] font-mono`}
//                       placeholder="5678"
//                       value={activeForm.pin}
//                       onChange={(e) => setActivePin(e.target.value)}
//                       required
//                     />
//                     <button type="button" tabIndex={-1} onClick={() => setShowCreatePin((v) => !v)}
//                       className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
//                       {showCreatePin ? <EyeOff size={16} /> : <Eye size={16} />}
//                     </button>
//                   </div>
//                   <p className="text-[10px] text-gray-400 mt-1">Used to lock this playlist's credentials from prying eyes.</p>
//                 </FormField>

//                 <motion.button type="submit" disabled={creating}
//                   whileHover={!creating ? { scale: 1.01 } : {}} whileTap={!creating ? { scale: 0.98 } : {}}
//                   className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200
//                     ${creating ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm"}`}>
//                   {creating ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={15} /> Create Playlist</>}
//                 </motion.button>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ══ EDIT MODAL ════════════════════════════════════════════════ */}
//       <AnimatePresence>
//         {editModal && editTarget && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4">
//             <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
//               className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
//               <div className="bg-[#800000] px-6 pt-6 pb-5 relative">
//                 <button onClick={() => setEditModal(false)}
//                   className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition">
//                   <MdClose size={20} />
//                 </button>
//                 <div className="flex items-center gap-3">
//                   <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
//                     <Pencil size={18} className="text-white" />
//                   </div>
//                   <div className="min-w-0">
//                     <h5 className="text-white font-extrabold text-base leading-tight truncate">Edit Playlist</h5>
//                     <p className="text-white/60 text-xs mt-0.5 truncate">{editTarget.name}</p>
//                   </div>
//                 </div>
//               </div>
//               <form onSubmit={handleUpdate} className="p-6 space-y-4">
//                 {editError && (
//                   <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
//                     <AlertTriangle size={15} className="shrink-0" />
//                     <span className="font-semibold">{editError}</span>
//                   </div>
//                 )}
//                 <FormField label="Playlist Name" icon={editTarget.type === "XTREAM" ? Tv2 : Radio} required>
//                   <input className={inputCls} value={editForm.name || ""}
//                     onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
//                 </FormField>

//                 {editTarget.type === "XTREAM" ? (
//                   <>
//                     <FormField label="Server URL" icon={Server}>
//                       <input className={inputCls} value={editForm.serverUrl || ""}
//                         onChange={(e) => setEditForm({ ...editForm, serverUrl: e.target.value })} />
//                     </FormField>
//                     <FormField label="Username" icon={UserIcon}>
//                       <input className={inputCls} value={editForm.username || ""}
//                         onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
//                     </FormField>
//                     <FormField label="New Password" icon={Lock}>
//                       <div className="relative">
//                         <input type={showEditPwd ? "text" : "password"} className={`${inputCls} pr-11`}
//                           placeholder="Leave blank to keep current" value={editForm.password || ""}
//                           onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
//                         <button type="button" tabIndex={-1} onClick={() => setShowEditPwd((v) => !v)}
//                           className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
//                           {showEditPwd ? <EyeOff size={16} /> : <Eye size={16} />}
//                         </button>
//                       </div>
//                     </FormField>
//                   </>
//                 ) : (
//                   <FormField label="M3U URL" icon={Link2}>
//                     <input className={inputCls} value={editForm.m3uUrl || ""}
//                       onChange={(e) => setEditForm({ ...editForm, m3uUrl: e.target.value })} />
//                   </FormField>
//                 )}

//                 {/* NEW — optional PIN update */}
//                 <FormField label="New Security PIN" icon={Lock}>
//                   <div className="relative">
//                     <input
//                       type={showEditPin ? "text" : "password"}
//                       inputMode="numeric"
//                       maxLength={4}
//                       className={`${inputCls} pr-11 tracking-[6px] font-mono`}
//                       placeholder="Leave blank to keep current"
//                       value={editForm.pin || ""}
//                       onChange={(e) => setEditForm({ ...editForm, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
//                     />
//                     <button type="button" tabIndex={-1} onClick={() => setShowEditPin((v) => !v)}
//                       className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
//                       {showEditPin ? <EyeOff size={16} /> : <Eye size={16} />}
//                     </button>
//                   </div>
//                 </FormField>

//                 <button type="submit" disabled={saving}
//                   className="w-full h-12 bg-[#800000] text-white font-bold rounded-xl hover:bg-[#6a0000] transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60">
//                   {saving ? <Loader2 size={16} className="animate-spin" /> : <><Pencil size={14} /> Save Changes</>}
//                 </button>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ══ DELETE MODAL ══════════════════════════════════════════════ */}
//       <AnimatePresence>
//         {deleteModal && deleteTarget && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4">
//             <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
//               className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
//               <div className="bg-[#800000] px-6 pt-6 pb-5 flex flex-col items-center gap-3">
//                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}
//                   className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
//                   <AlertTriangle size={22} className="text-white" />
//                 </motion.div>
//                 <h5 className="text-base font-extrabold text-white text-center">Delete Playlist</h5>
//               </div>
//               <div className="px-6 pt-5 pb-6 flex flex-col items-center gap-5">
//                 <p className="text-sm text-gray-600 text-center leading-relaxed">
//                   Are you sure you want to delete <span className="font-bold text-[#800000]">{deleteTarget.name}</span>? This action cannot be undone.
//                 </p>
//                 <div className="flex gap-3 w-full">
//                   <button onClick={() => { setDeleteModal(false); setDeleteTarget(null); }} disabled={deleting}
//                     className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition active:scale-95 disabled:opacity-50">
//                     Cancel
//                   </button>
//                   <button onClick={handleDelete} disabled={deleting}
//                     className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
//                     {deleting ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={14} /> Delete</>}
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ══ ASSIGN MODAL ══════════════════════════════════════════════ */}
//       <AnimatePresence>
//         {assignModal && assignTarget && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4">
//             <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
//               className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[85vh] flex flex-col">
//               <div className="bg-[#800000] px-6 pt-6 pb-5 relative shrink-0">
//                 <button onClick={() => setAssignModal(false)}
//                   className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition">
//                   <MdClose size={20} />
//                 </button>
//                 <div className="flex items-center gap-3">
//                   <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
//                     <Smartphone size={20} className="text-white" />
//                   </div>
//                   <div className="min-w-0">
//                     <h5 className="text-white font-extrabold text-base leading-tight truncate">Assign Playlist</h5>
//                     <p className="text-white/60 text-xs mt-0.5 truncate">{assignTarget.name}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-6 space-y-3 flex-1 min-h-0 flex flex-col">
//                 <div className="relative shrink-0">
//                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                   <input
//                     className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-gray-700 font-semibold placeholder-gray-400"
//                     placeholder="Search device by MAC address…"
//                     value={deviceSearch}
//                     onChange={(e) => setDeviceSearch(e.target.value)}
//                   />
//                 </div>

//                 <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
//                   {devicesLoading ? (
//                     [...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)
//                   ) : devices.length > 0 ? (
//                     devices.map((d) => {
//                       const id = d.deviceId || d.id;
//                       // NEW — surface the MAC address instead of the raw internal ID
//                       const mac = d.macAddress || d.mac || id;
//                       const isSelected = (selectedDevice?.deviceId || selectedDevice?.id) === id;
//                       return (
//                         <button key={id} onClick={() => setSelectedDevice(d)}
//                           className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition
//                             ${isSelected ? "bg-[#800000]/5 border-[#800000]" : "bg-white border-gray-200 hover:border-[#800000]/40"}`}>
//                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#800000] text-white" : "bg-gray-100 text-gray-400"}`}>
//                             <Smartphone size={14} />
//                           </div>
//                           <div className="min-w-0 flex-1">
//                             <p className="text-xs font-bold text-gray-800 truncate font-mono tracking-wider uppercase">{mac}</p>
//                             {d.subscriptionType && <p className="text-[10px] text-gray-400">{d.subscriptionType}</p>}
//                           </div>
//                           {isSelected && <CheckCircle2 size={16} className="text-[#800000] shrink-0" />}
//                         </button>
//                       );
//                     })
//                   ) : (
//                     <p className="text-center text-xs text-gray-400 font-semibold py-8">No devices found</p>
//                   )}
//                 </div>

//                 <motion.button onClick={handleAssign} disabled={!selectedDevice || assigning}
//                   whileHover={selectedDevice && !assigning ? { scale: 1.01 } : {}} whileTap={selectedDevice && !assigning ? { scale: 0.98 } : {}}
//                   className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shrink-0
//                     ${!selectedDevice || assigning ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm"}`}>
//                   {assigning ? <Loader2 size={16} className="animate-spin" /> : <><Link size={15} /> Assign to Device</>}
//                 </motion.button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <BrandToast toasts={toasts} />
//     </div>
//   );
// };

// export default PlaylistManagement;


import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Radio, Tv2, Link2, Server, User as UserIcon, Lock, Eye, EyeOff,
  Plus, Pencil, Trash2, Search, X, Pin, PinOff, Smartphone,
  AlertTriangle, CheckCircle2, XCircle, Info, Copy, Link,
  ChevronDown, ListFilter, Loader2, Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  getPlaylists, createM3uPlaylist, createXtreamPlaylist,
  updatePlaylist, deletePlaylist, assignPlaylist,
  unassignPlaylist, togglePinPlaylist,
} from "../auth/api/playlistApi";
import { getUserDevices } from "../auth/api/userManagement";

// ─── Brand Toast ────────────────────────────────────────────────────────
const BrandToast = ({ toasts }) => (
  <div className="fixed top-5 inset-x-0 z-[99999] flex flex-col items-center gap-2 pointer-events-none px-4">
    <AnimatePresence>
      {toasts.map((t) => {
        const isSuccess = t.type === "success";
        const isError = t.type === "error";
        const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : Info;
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl
              text-sm font-bold text-white max-w-sm w-full
              ${isSuccess ? "bg-[#800000]" : isError ? "bg-red-600" : "bg-gray-800"}`}
          >
            <Icon size={17} className="shrink-0" />
            <span className="flex-1 leading-snug">{t.msg}</span>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

function useDebounce(value, delay) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setD(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return d;
}

// ─── TypeBadge ──────────────────────────────────────────────────────────
const TypeBadge = ({ type, t }) => {
  const isXtream = type === "XTREAM";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide shrink-0
      ${isXtream ? "bg-indigo-100 text-indigo-700" : "bg-[#800000]/10 text-[#800000]"}`}>
      {isXtream ? <Tv2 size={11} /> : <Radio size={11} />}
      {isXtream ? t("playlistMgmt.type_xtream") : t("playlistMgmt.type_m3u")}
    </span>
  );
};

// ─── LockBadge — shows isLocked (PIN-protected), distinct from "pinned" ──
const LockBadge = ({ locked, t }) =>
  locked ? (
    <span title={t("playlistMgmt.pin_protected")} className="inline-flex items-center justify-center text-gray-400 shrink-0">
      <Lock size={11} />
    </span>
  ) : null;

// ─── PinButton ──────────────────────────────────────────────────────────
const PinButton = ({ pinned, onClick, busy, t }) => (
  <button
    onClick={onClick}
    disabled={busy}
    title={pinned ? t("playlistMgmt.unpin_playlist") : t("playlistMgmt.pin_playlist")}
    className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border transition active:scale-90 disabled:opacity-50
      ${pinned
        ? "bg-amber-50 border-amber-300 text-amber-500"
        : "bg-white border-gray-200 text-gray-300 hover:border-amber-300 hover:text-amber-400"}`}
  >
    {busy
      ? <Loader2 size={15} className="animate-spin" />
      : (
        <motion.span
          animate={pinned ? { rotate: [0, -15, 15, -8, 0], scale: [1, 1.25, 1] } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Star size={15} fill={pinned ? "currentColor" : "none"} />
        </motion.span>
      )}
  </button>
);

const CopyButton = ({ value, copiedId, onCopy, t }) => {
  const isThis = copiedId === value;
  return (
    <button onClick={() => onCopy(value)}
      className="shrink-0 text-gray-400 hover:text-[#800000] transition p-1 rounded-md hover:bg-red-50"
      title={t("playlistMgmt.copy_url")}>
      {isThis ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  );
};

const EmptyState = ({ hasFilters, onClear, onCreate, t }) => (
  <div className="flex flex-col items-center gap-2 py-14 text-gray-400">
    <div className="w-14 h-14 rounded-2xl bg-[#800000]/5 flex items-center justify-center mb-1">
      <Radio size={24} className="text-[#800000]/40" />
    </div>
    <p className="font-semibold text-sm text-center">
      {hasFilters ? t("playlistMgmt.no_match_filters") : t("playlistMgmt.no_playlists_yet")}
    </p>
    {hasFilters ? (
      <button onClick={onClear} className="text-xs text-[#800000] font-bold hover:underline">{t("playlistMgmt.clear_filters")}</button>
    ) : (
      <button onClick={onCreate}
        className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#800000] hover:bg-[#6a0000] px-4 py-2 rounded-xl transition active:scale-95">
        <Plus size={13} /> {t("playlistMgmt.create_first")}
      </button>
    )}
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow border border-gray-200 p-4 animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-2/5" />
      <div className="h-5 bg-gray-200 rounded-full w-16" />
    </div>
    <div className="h-3 bg-gray-200 rounded w-3/4" />
    <div className="flex gap-2 pt-1">
      <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
      <div className="w-9 h-9 bg-gray-200 rounded-xl" />
      <div className="w-9 h-9 bg-gray-200 rounded-xl" />
      <div className="w-9 h-9 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

const FormField = ({ label, icon: Icon, required, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
      <Icon size={11} className="text-[#800000]" />
      {label}
      {required && <span className="text-[#800000] text-sm leading-none">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-3 bg-[#f4f4f7] border-2 border-transparent rounded-xl focus:border-[#800000] focus:bg-white focus:outline-none transition-all duration-200 text-sm font-semibold text-gray-800 placeholder:font-normal placeholder:text-gray-400";

// ─── PlaylistCard — mobile/tablet ───────────────────────────────────────
const PlaylistCard = ({
  playlist, copiedId, onCopy, onEdit, onDelete, onAssign, onTogglePin, pinBusyId, t,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.96 }}
    className={`bg-white p-4 rounded-xl shadow border space-y-3 transition-colors
      ${playlist.pinned ? "border-amber-300 ring-1 ring-amber-200" : "border-gray-200"}`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="font-bold text-sm text-gray-800 truncate flex items-center gap-1.5">
          {playlist.name}
          <LockBadge locked={playlist.isLocked} t={t} />
        </p>
        <div className="mt-1"><TypeBadge type={playlist.type} t={t} /></div>
      </div>
      <PinButton pinned={playlist.pinned} busy={pinBusyId === playlist.id} onClick={() => onTogglePin(playlist)} t={t} />
    </div>

    <div className="flex items-center gap-1.5 bg-[#f4f4f7] rounded-lg px-2.5 py-2 min-w-0">
      <Link2 size={12} className="text-gray-400 shrink-0" />
      <span className="text-[11px] text-gray-600 font-medium truncate flex-1">
        {playlist.m3uUrl || playlist.serverUrl || "—"}
      </span>
      <CopyButton value={playlist.m3uUrl || playlist.serverUrl} copiedId={copiedId} onCopy={onCopy} t={t} />
    </div>

    <div className="flex gap-2 pt-1">
      <button onClick={() => onAssign(playlist)}
        className="flex-1 py-2.5 rounded-xl bg-[#800000] text-white text-sm font-bold hover:bg-[#6a0000] transition active:scale-95 flex items-center justify-center gap-1.5">
        <Smartphone size={14} /> {t("playlistMgmt.assign")}
      </button>
      <button onClick={() => onEdit(playlist)} title={t("playlistMgmt.edit")}
        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-[#800000] hover:text-[#800000] hover:bg-red-50 transition active:scale-95">
        <Pencil size={15} />
      </button>
      <button onClick={() => onDelete(playlist)} title={t("playlistMgmt.delete")}
        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white transition active:scale-95">
        <Trash2 size={15} />
      </button>
    </div>
  </motion.div>
);

// ═════════════════════════════════════════════════════════════════════════
const PlaylistManagement = () => {
  const { t } = useTranslation();
  const { userRole } = useAuth();

  const [playlists,   setPlaylists]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,        setSearch]        = useState("");
  const debouncedSearch                   = useDebounce(search, 350);
  const [typeFilter,   setTypeFilter]   = useState("");
  const [pinnedOnly,   setPinnedOnly]   = useState(false);
  const [showFilter,   setShowFilter]   = useState(false);

  const [copiedId, setCopiedId] = useState(null);
  const [pinBusyId, setPinBusyId] = useState(null);

  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Create modal ────────────────────────────────────────────────────
  const [createModal, setCreateModal] = useState(false);
  const [createType,  setCreateType]  = useState("M3U");
  const [creating,    setCreating]    = useState(false);
  const [createError, setCreateError] = useState("");
  // pin added to both form shapes
  const [m3uForm,     setM3uForm]     = useState({ name: "", m3uUrl: "", pin: "" });
  const [xtreamForm,  setXtreamForm]  = useState({ name: "", serverUrl: "", username: "", password: "", pin: "" });
  const [showXtreamPwd, setShowXtreamPwd] = useState(false);
  const [showCreatePin, setShowCreatePin] = useState(false);

  // Helper so one PIN field can serve whichever tab is active
  const activeForm    = createType === "M3U" ? m3uForm : xtreamForm;
  const setActivePin  = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    createType === "M3U"
      ? setM3uForm((p) => ({ ...p, pin: digits }))
      : setXtreamForm((p) => ({ ...p, pin: digits }));
  };

  // ── Edit modal ───────────────────────────────────────────────────────
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm,   setEditForm]   = useState({});
  const [saving,     setSaving]     = useState(false);
  const [editError,  setEditError]  = useState("");
  const [showEditPwd, setShowEditPwd] = useState(false);
  const [showEditPin, setShowEditPin] = useState(false);

  // ── Delete modal ─────────────────────────────────────────────────────
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Assign modal ─────────────────────────────────────────────────────
  const [assignModal,  setAssignModal]  = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [deviceSearch, setDeviceSearch] = useState("");
  const debouncedDeviceSearch = useDebounce(deviceSearch, 350);
  const [devices,       setDevices]       = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [assigning,      setAssigning]      = useState(false);

  const filterRef = useRef(null);
  useEffect(() => {
    const h = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchPlaylists = useCallback(async () => {
    if (!userRole) return;
    setLoading(true);
    const res = await getPlaylists(userRole);
    if (res.success) setPlaylists(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
    else showToast(res.message || t("playlistMgmt.toast_load_failed"), "error");
    setLoading(false);
  }, [userRole, showToast, t]);

  useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);

  useEffect(() => {
    if (!assignModal || !userRole) return;
    let active = true;
    setDevicesLoading(true);
    getUserDevices(userRole, 0, 20, debouncedDeviceSearch).then((res) => {
      if (!active) return;
      if (res.success) setDevices(res.data?.content ?? res.data ?? []);
      setDevicesLoading(false);
    });
    return () => { active = false; };
  }, [assignModal, userRole, debouncedDeviceSearch]);

  const filtered = playlists.filter((p) => {
    const matchesSearch = !debouncedSearch ||
      p.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.m3uUrl?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.serverUrl?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesType = !typeFilter || p.type === typeFilter;
    const matchesPinned = !pinnedOnly || p.pinned;
    return matchesSearch && matchesType && matchesPinned;
  }).sort((a, b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1));

  const hasFilters = !!(debouncedSearch || typeFilter || pinnedOnly);
  const clearFilters = () => { setSearch(""); setTypeFilter(""); setPinnedOnly(false); setShowFilter(false); };

  const onCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleTogglePin = async (playlist) => {
    setPinBusyId(playlist.id);
    const res = await togglePinPlaylist(userRole, playlist.id);
    setPinBusyId(null);
    if (res.success) {
      setPlaylists((prev) => prev.map((p) => (p.id === playlist.id ? { ...p, pinned: res.data?.pinned ?? !p.pinned } : p)));
      showToast(res.message || (playlist.pinned ? t("playlistMgmt.toast_unpinned") : t("playlistMgmt.toast_pinned")), "success");
    } else {
      showToast(res.message || t("playlistMgmt.toast_pin_failed"), "error");
    }
  };

  // ── Create ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setCreateType("M3U"); setCreateError(""); setShowCreatePin(false);
    setM3uForm({ name: "", m3uUrl: "", pin: "" });
    setXtreamForm({ name: "", serverUrl: "", username: "", password: "", pin: "" });
    setCreateModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (activeForm.pin.length !== 4) {
      setCreateError(t("playlistMgmt.pin_required_error"));
      return;
    }
    setCreating(true); setCreateError("");
    const res = createType === "M3U"
      ? await createM3uPlaylist(userRole, m3uForm)
      : await createXtreamPlaylist(userRole, xtreamForm);
    setCreating(false);
    if (res.success) {
      setCreateModal(false);
      fetchPlaylists();
      showToast(t("playlistMgmt.toast_created"), "success");
    } else {
      setCreateError(res.message);
      showToast(res.message || t("playlistMgmt.toast_create_failed"), "error");
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────
  const openEdit = (playlist) => {
    setEditTarget(playlist);
    setEditError(""); setShowEditPwd(false); setShowEditPin(false);
    setEditForm(
      playlist.type === "XTREAM"
        ? { name: playlist.name, serverUrl: playlist.serverUrl || "", username: playlist.username || "", password: "", pin: "" }
        : { name: playlist.name, m3uUrl: playlist.m3uUrl || "", pin: "" }
    );
    setEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true); setEditError("");
    const payload = { ...editForm };
    if (editTarget.type === "XTREAM" && !payload.password) delete payload.password;
    if (!payload.pin) delete payload.pin; // only send pin if the user actually typed a new one
    const res = await updatePlaylist(userRole, editTarget.id, payload);
    setSaving(false);
    if (res.success) {
      setEditModal(false);
      fetchPlaylists();
      showToast(res.message || t("playlistMgmt.toast_updated"), "success");
    } else {
      setEditError(res.message);
      showToast(res.message || t("playlistMgmt.toast_update_failed"), "error");
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────
  const openDelete = (playlist) => { setDeleteTarget(playlist); setDeleteModal(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deletePlaylist(userRole, deleteTarget.id);
    setDeleting(false);
    if (res.success) {
      showToast(`"${deleteTarget.name}" ${t("playlistMgmt.toast_deleted")}`, "success");
      setDeleteModal(false); setDeleteTarget(null);
      setPlaylists((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } else {
      showToast(res.message || t("playlistMgmt.toast_delete_failed"), "error");
    }
  };

  // ── Assign ──────────────────────────────────────────────────────────
  const openAssign = (playlist) => {
    setAssignTarget(playlist);
    setDeviceSearch(""); setSelectedDevice(null); setDevices([]);
    setAssignModal(true);
  };

  const handleAssign = async () => {
    if (!assignTarget || !selectedDevice) return;
    setAssigning(true);
    const res = await assignPlaylist(userRole, assignTarget.id, selectedDevice.deviceId || selectedDevice.id);
    setAssigning(false);
    if (res.success) {
      showToast(res.message || t("playlistMgmt.toast_assigned"), "success");
      setAssignModal(false);
    } else {
      showToast(res.message || t("playlistMgmt.toast_assign_failed"), "error");
    }
  };

  const activeFilterCount = [typeFilter, pinnedOnly].filter(Boolean).length;

  return (
    <div className="h-full flex flex-col bg-[#f4f4f7] overflow-hidden">

      {/* ══ STICKY HEADER ══════════════════════════════════════════════ */}
      <div className="shrink-0 sticky top-0 bg-[#f4f4f7] px-4 pt-4 pb-3 space-y-3 z-30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="shrink-0">
            <h3 className="font-bold text-[#800000] text-lg leading-tight flex items-center gap-2">
              <Radio size={18} /> {t("playlistMgmt.title")}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">{t("playlistMgmt.subtitle")}</p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto min-w-0">
            <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm
                            flex-1 min-w-0 lg:flex-none lg:w-[220px] min-[1400px]:w-[280px]">
              <div className="relative w-full">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t("playlistMgmt.search_placeholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-2.5 text-sm text-gray-700 bg-white focus:outline-none placeholder-gray-400"
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="relative shrink-0" ref={filterRef}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowFilter((v) => !v)}
                className={`flex items-center justify-center gap-1.5 w-10 min-[1400px]:w-auto min-[1400px]:px-4 h-10 rounded-xl border text-sm font-semibold transition
                  ${activeFilterCount > 0 ? "bg-[#800000] text-white border-[#800000] shadow-md" : "bg-white text-gray-700 border-gray-200 hover:border-[#800000] hover:text-[#800000] shadow-sm"}`}>
                <ListFilter size={15} />
                <span className="hidden min-[1400px]:inline">{t("playlistMgmt.filters")}</span>
                {activeFilterCount > 0 && (
                  <span className="hidden min-[1400px]:flex bg-white text-[#800000] text-[10px] font-black w-4 h-4 rounded-full items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown size={12} className={`hidden min-[1400px]:block transition-transform ${showFilter ? "rotate-180" : ""}`} />
              </motion.button>

              <AnimatePresence>
                {showFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute right-0 top-full mt-2 z-[60] bg-white border border-gray-200 rounded-2xl shadow-2xl w-64 p-5 space-y-4"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t("playlistMgmt.col_type")}</span>
                      <div className="flex gap-2 mt-2">
                        {[
                          { v: "", label: t("playlistMgmt.type_all") },
                          { v: "M3U", label: t("playlistMgmt.type_m3u") },
                          { v: "XTREAM", label: t("playlistMgmt.type_xtream") },
                        ].map((o) => (
                          <button key={o.v || "all"} onClick={() => setTypeFilter(o.v)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition
                              ${typeFilter === o.v ? "bg-[#800000] text-white border-[#800000]" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#800000] hover:text-[#800000]"}`}>
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <div onClick={() => setPinnedOnly((v) => !v)}
                        className={`w-10 h-5 rounded-full relative shrink-0 transition-colors ${pinnedOnly ? "bg-[#800000]" : "bg-gray-200"}`}>
                        <motion.div animate={{ x: pinnedOnly ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                      <span className="text-xs font-bold text-gray-700 flex items-center gap-1"><Star size={12} className="text-amber-400" /> {t("playlistMgmt.pinned_only")}</span>
                    </label>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="w-full py-2 text-xs font-bold text-[#800000] hover:bg-red-50 rounded-xl transition">
                        {t("playlistMgmt.clear_filters")}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button whileTap={{ scale: 0.95 }} onClick={openCreate}
              className="flex items-center justify-center gap-1.5 w-10 min-[1400px]:w-auto min-[1400px]:px-4 h-10
                         bg-[#800000] text-white rounded-xl text-sm font-semibold hover:bg-[#6a0000] transition shadow-sm shrink-0">
              <Plus size={15} />
              <span className="hidden min-[1400px]:inline">{t("playlistMgmt.new_playlist")}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ═══════════════════════════════════════════════════ */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        <div className="hidden lg:block bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <colgroup>
              <col style={{ width: "30%" }} /><col style={{ width: "12%" }} />
              <col style={{ width: "34%" }} /><col style={{ width: "8%" }} /><col style={{ width: "16%" }} />
            </colgroup>
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                {[
                  t("playlistMgmt.col_name"),
                  t("playlistMgmt.col_type"),
                  t("playlistMgmt.col_source"),
                  t("playlistMgmt.col_pin"),
                  t("playlistMgmt.col_actions"),
                ].map((c) => (
                  <th key={c} className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 first:text-left">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-t">
                    {[30, 12, 34, 8, 16].map((w, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-3 bg-gray-200 rounded mx-auto" style={{ width: `${w * 2}%` }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((p, idx) => (
                  <tr key={p.id} className={`transition-colors hover:bg-red-50/30 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"} ${p.pinned ? "bg-amber-50/40" : ""}`}>
                    <td className="px-4 py-3.5 text-left">
                      <span className="font-bold text-gray-800 text-sm truncate flex items-center gap-1.5">
                        {p.pinned && <Star size={12} fill="currentColor" className="text-amber-400 shrink-0" />}
                        {p.name}
                        <LockBadge locked={p.isLocked} t={t} />
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center"><TypeBadge type={p.type} t={t} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 justify-center min-w-0">
                        <Link2 size={12} className="text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-500 font-medium truncate max-w-[260px]">{p.m3uUrl || p.serverUrl || "—"}</span>
                        <CopyButton value={p.m3uUrl || p.serverUrl} copiedId={copiedId} onCopy={onCopy} t={t} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex justify-center"><PinButton pinned={p.pinned} busy={pinBusyId === p.id} onClick={() => handleTogglePin(p)} t={t} /></div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openAssign(p)} className="px-3 py-1.5 rounded-lg bg-[#800000] text-white hover:bg-[#6a0000] text-xs font-bold transition active:scale-95 shadow-sm flex items-center gap-1">
                          <Smartphone size={12} /> {t("playlistMgmt.assign")}
                        </button>
                        <button onClick={() => openEdit(p)} title={t("playlistMgmt.edit")} className="p-1.5 rounded-lg border border-gray-200 hover:border-[#800000] hover:text-[#800000] hover:bg-red-50 text-gray-500 transition active:scale-95"><Pencil size={13} /></button>
                        <button onClick={() => openDelete(p)} title={t("playlistMgmt.delete")} className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white transition active:scale-95"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="py-12"><EmptyState hasFilters={hasFilters} onClear={clearFilters} onCreate={openCreate} t={t} /></td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
          {loading ? (
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length > 0 ? (
            <AnimatePresence>
              {filtered.map((p) => (
                <PlaylistCard key={p.id} playlist={p} copiedId={copiedId} onCopy={onCopy}
                  onEdit={openEdit} onDelete={openDelete} onAssign={openAssign}
                  onTogglePin={handleTogglePin} pinBusyId={pinBusyId} t={t} />
              ))}
            </AnimatePresence>
          ) : (
            <div className="md:col-span-2"><EmptyState hasFilters={hasFilters} onClear={clearFilters} onCreate={openCreate} t={t} /></div>
          )}
        </div>
      </div>

      {/* ══ CREATE MODAL ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {createModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-[#800000] px-6 pt-6 pb-5 relative">
                <button onClick={() => setCreateModal(false)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <MdClose size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Plus size={20} className="text-white" />
                  </div>
                  <div>
                    <h5 className="text-white font-extrabold text-base leading-tight">{t("playlistMgmt.create_title")}</h5>
                    <p className="text-white/60 text-xs mt-0.5">{t("playlistMgmt.create_subtitle")}</p>
                  </div>
                </div>

                <div className="flex bg-white/10 rounded-xl p-1 mt-4">
                  {[
                    { v: "M3U", label: t("playlistMgmt.type_m3u"), icon: Radio },
                    { v: "XTREAM", label: t("playlistMgmt.type_xtream"), icon: Tv2 },
                  ].map((tab) => (
                    <button key={tab.v} type="button" onClick={() => { setCreateType(tab.v); setCreateError(""); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition
                        ${createType === tab.v ? "bg-white text-[#800000]" : "text-white/70 hover:text-white"}`}>
                      <tab.icon size={13} /> {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {createError && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span className="font-semibold">{createError}</span>
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {createType === "M3U" ? (
                    <motion.div key="m3u" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-4">
                      <FormField label={t("playlistMgmt.playlist_name")} icon={Radio} required>
                        <input className={inputCls} placeholder={t("playlistMgmt.m3u_name_ph")} value={m3uForm.name}
                          onChange={(e) => setM3uForm({ ...m3uForm, name: e.target.value })} required />
                      </FormField>
                      <FormField label={t("playlistMgmt.m3u_url")} icon={Link2} required>
                        <input className={inputCls} placeholder={t("playlistMgmt.m3u_url_ph")} value={m3uForm.m3uUrl}
                          onChange={(e) => setM3uForm({ ...m3uForm, m3uUrl: e.target.value })} required />
                      </FormField>
                    </motion.div>
                  ) : (
                    <motion.div key="xtream" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-4">
                      <FormField label={t("playlistMgmt.playlist_name")} icon={Tv2} required>
                        <input className={inputCls} placeholder={t("playlistMgmt.xtream_name_ph")} value={xtreamForm.name}
                          onChange={(e) => setXtreamForm({ ...xtreamForm, name: e.target.value })} required />
                      </FormField>
                      <FormField label={t("playlistMgmt.server_url")} icon={Server} required>
                        <input className={inputCls} placeholder={t("playlistMgmt.server_url_ph")} value={xtreamForm.serverUrl}
                          onChange={(e) => setXtreamForm({ ...xtreamForm, serverUrl: e.target.value })} required />
                      </FormField>
                      <FormField label={t("playlistMgmt.username")} icon={UserIcon} required>
                        <input className={inputCls} placeholder={t("playlistMgmt.username_ph")} value={xtreamForm.username}
                          onChange={(e) => setXtreamForm({ ...xtreamForm, username: e.target.value })} required />
                      </FormField>
                      <FormField label={t("playlistMgmt.password")} icon={Lock} required>
                        <div className="relative">
                          <input type={showXtreamPwd ? "text" : "password"} className={`${inputCls} pr-11`} placeholder={t("playlistMgmt.password_ph")}
                            value={xtreamForm.password} onChange={(e) => setXtreamForm({ ...xtreamForm, password: e.target.value })} required />
                          <button type="button" tabIndex={-1} onClick={() => setShowXtreamPwd((v) => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
                            {showXtreamPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormField>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Security PIN, shared across both tabs */}
                <FormField label={t("playlistMgmt.security_pin")} icon={Lock} required>
                  <div className="relative">
                    <input
                      type={showCreatePin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      className={`${inputCls} pr-11 tracking-[6px] font-mono`}
                      placeholder="5678"
                      value={activeForm.pin}
                      onChange={(e) => setActivePin(e.target.value)}
                      required
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowCreatePin((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
                      {showCreatePin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{t("playlistMgmt.security_pin_hint")}</p>
                </FormField>

                <motion.button type="submit" disabled={creating}
                  whileHover={!creating ? { scale: 1.01 } : {}} whileTap={!creating ? { scale: 0.98 } : {}}
                  className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200
                    ${creating ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm"}`}>
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={15} /> {t("playlistMgmt.create_playlist_btn")}</>}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ EDIT MODAL ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {editModal && editTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-[#800000] px-6 pt-6 pb-5 relative">
                <button onClick={() => setEditModal(false)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <MdClose size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Pencil size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-white font-extrabold text-base leading-tight truncate">{t("playlistMgmt.edit_title")}</h5>
                    <p className="text-white/60 text-xs mt-0.5 truncate">{editTarget.name}</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                {editError && (
                  <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span className="font-semibold">{editError}</span>
                  </div>
                )}
                <FormField label={t("playlistMgmt.playlist_name")} icon={editTarget.type === "XTREAM" ? Tv2 : Radio} required>
                  <input className={inputCls} value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </FormField>

                {editTarget.type === "XTREAM" ? (
                  <>
                    <FormField label={t("playlistMgmt.server_url")} icon={Server}>
                      <input className={inputCls} value={editForm.serverUrl || ""}
                        onChange={(e) => setEditForm({ ...editForm, serverUrl: e.target.value })} />
                    </FormField>
                    <FormField label={t("playlistMgmt.username")} icon={UserIcon}>
                      <input className={inputCls} value={editForm.username || ""}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
                    </FormField>
                    <FormField label={t("playlistMgmt.new_password")} icon={Lock}>
                      <div className="relative">
                        <input type={showEditPwd ? "text" : "password"} className={`${inputCls} pr-11`}
                          placeholder={t("playlistMgmt.leave_blank")} value={editForm.password || ""}
                          onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                        <button type="button" tabIndex={-1} onClick={() => setShowEditPwd((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
                          {showEditPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormField>
                  </>
                ) : (
                  <FormField label={t("playlistMgmt.m3u_url")} icon={Link2}>
                    <input className={inputCls} value={editForm.m3uUrl || ""}
                      onChange={(e) => setEditForm({ ...editForm, m3uUrl: e.target.value })} />
                  </FormField>
                )}

                {/* Optional PIN update */}
                <FormField label={t("playlistMgmt.new_pin")} icon={Lock}>
                  <div className="relative">
                    <input
                      type={showEditPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      className={`${inputCls} pr-11 tracking-[6px] font-mono`}
                      placeholder={t("playlistMgmt.leave_blank")}
                      value={editForm.pin || ""}
                      onChange={(e) => setEditForm({ ...editForm, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowEditPin((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition">
                      {showEditPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormField>

                <button type="submit" disabled={saving}
                  className="w-full h-12 bg-[#800000] text-white font-bold rounded-xl hover:bg-[#6a0000] transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <><Pencil size={14} /> {t("playlistMgmt.save_changes")}</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ DELETE MODAL ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteModal && deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="bg-[#800000] px-6 pt-6 pb-5 flex flex-col items-center gap-3">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <AlertTriangle size={22} className="text-white" />
                </motion.div>
                <h5 className="text-base font-extrabold text-white text-center">{t("playlistMgmt.delete_title")}</h5>
              </div>
              <div className="px-6 pt-5 pb-6 flex flex-col items-center gap-5">
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  {t("playlistMgmt.delete_confirm")} <span className="font-bold text-[#800000]">{deleteTarget.name}</span>? {t("playlistMgmt.delete_warning")}
                </p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => { setDeleteModal(false); setDeleteTarget(null); }} disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition active:scale-95 disabled:opacity-50">
                    {t("playlistMgmt.cancel")}
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                    {deleting ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={14} /> {t("playlistMgmt.delete")}</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ ASSIGN MODAL ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {assignModal && assignTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 right-0 bottom-0 left-0 md:left-[240px] lg:left-[260px] bg-black/60 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[85vh] flex flex-col">
              <div className="bg-[#800000] px-6 pt-6 pb-5 relative shrink-0">
                <button onClick={() => setAssignModal(false)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <MdClose size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Smartphone size={20} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-white font-extrabold text-base leading-tight truncate">{t("playlistMgmt.assign_title")}</h5>
                    <p className="text-white/60 text-xs mt-0.5 truncate">{assignTarget.name}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3 flex-1 min-h-0 flex flex-col">
                <div className="relative shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#f4f4f7] border border-gray-200 rounded-xl focus:border-[#800000] focus:outline-none transition text-gray-700 font-semibold placeholder-gray-400"
                    placeholder={t("playlistMgmt.search_device_ph")}
                    value={deviceSearch}
                    onChange={(e) => setDeviceSearch(e.target.value)}
                  />
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
                  {devicesLoading ? (
                    [...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)
                  ) : devices.length > 0 ? (
                    devices.map((d) => {
                      const id = d.deviceId || d.id;
                      // Surface the MAC address instead of the raw internal ID
                      const mac = d.macAddress || d.mac || id;
                      const isSelected = (selectedDevice?.deviceId || selectedDevice?.id) === id;
                      return (
                        <button key={id} onClick={() => setSelectedDevice(d)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition
                            ${isSelected ? "bg-[#800000]/5 border-[#800000]" : "bg-white border-gray-200 hover:border-[#800000]/40"}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#800000] text-white" : "bg-gray-100 text-gray-400"}`}>
                            <Smartphone size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-800 truncate font-mono tracking-wider uppercase">{mac}</p>
                            {d.subscriptionType && <p className="text-[10px] text-gray-400">{d.subscriptionType}</p>}
                          </div>
                          {isSelected && <CheckCircle2 size={16} className="text-[#800000] shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-center text-xs text-gray-400 font-semibold py-8">{t("playlistMgmt.no_devices_found")}</p>
                  )}
                </div>

                <motion.button onClick={handleAssign} disabled={!selectedDevice || assigning}
                  whileHover={selectedDevice && !assigning ? { scale: 1.01 } : {}} whileTap={selectedDevice && !assigning ? { scale: 0.98 } : {}}
                  className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shrink-0
                    ${!selectedDevice || assigning ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm"}`}>
                  {assigning ? <Loader2 size={16} className="animate-spin" /> : <><Link size={15} /> {t("playlistMgmt.assign_to_device")}</>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BrandToast toasts={toasts} />
    </div>
  );
};

export default PlaylistManagement;