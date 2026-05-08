import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaChevronLeft, FaChevronRight, FaExclamationCircle } from 'react-icons/fa';
import { saveM3uPlaylist } from '../auth/apiservice';
import { useTranslation } from 'react-i18next';
const PlaylistManager = () => {
  const location = useLocation();
  const uploadMac = location.state?.uploadMac;
  const [macAddress, setMacAddress] = useState("");
  const { t } = useTranslation();
  useEffect(() => {
    // Priority 1: Navigation state se MAC lo
    const macFromState = location.state?.mac;
    // Priority 2: LocalStorage se lo (agar page refresh ho jaye)
    const savedMac = localStorage.getItem("macAddress");

    if (macFromState) {
      setMacAddress(macFromState);
      localStorage.setItem("macAddress", macFromState); // Isse refresh par data nahi jayega
      setDeleteMac(macFromState);
    } else if (savedMac) {
      setMacAddress(savedMac);
      setDeleteMac(savedMac);
    }
  }, [location.state]);
  const [deleteMac, setDeleteMac] = useState("");
  const [links, setLinks] = useState([{ id: 1, source: 'Link', url: '', name: '' }]);

  // Row add karne ke liye function
  const addRow = () => {
    setLinks([...links, { id: Date.now(), source: 'Link', url: '', name: '' }]);
  };

  // Row delete karne ke liye function
  const removeRow = (id) => {
    if (links.length > 1) {
      setLinks(links.filter(link => link.id !== id));
    }
  };

  // --- Animation Variants ---

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Ek ek karke sections aayenge
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    },
    exit: {
      opacity: 0,
      x: 50,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  const buttonHover = {
    hover: { scale: 1.05, filter: "brightness(1.1)" },
    tap: { scale: 0.95 }
  };


  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffe5e5, #f0eff7, #f5f0f0)',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'black',
      fontFamily: "'Segoe UI', Roboto, sans-serif'"
    }}>
      <motion.div
        className="container"
        style={{ maxWidth: '900px' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white text-dark p-3 rounded-3 mb-4 shadow-lg border-0"
        >
          <h4 className="m-0 fw-bold" style={{ letterSpacing: '-0.5px' }}>{t('playlist.upload_playlist')}</h4>

        </motion.div>

        {/* Upload Form Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white text-dark p-4 rounded-3 mb-4 shadow-lg position-relative border-0"
        >
          <div className="mb-4">
            <label className="fw-bold mb-2 small text-uppercase text-muted" style={{ letterSpacing: '1px' }}>{t('playlist.mac_address')}</label>
            <div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ background: 'linear-gradient(135deg, #90caf9, #2196f3)', display: 'inline-block', padding: '10px 25px', borderRadius: '10px', fontWeight: '800', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(255, 213, 79, 0.3)' }}
                className="d-block d-sm-inline-block text-center"
              >
                {macAddress}
              </motion.div>
            </div>
          </div>

          <motion.button
            variants={buttonHover}
            whileHover="hover"
            whileTap="tap"
            onClick={addRow}
            className="btn position-absolute d-flex align-items-center justify-content-center"
            style={{ top: '25px', right: '25px', background: 'linear-gradient(135deg, #0d47a1, #1976d2)', border: 'none', width: '45px', height: '45px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, ease: "easeOut" }} key={links.length}>
              <FaPlus size={20} />
            </motion.div>
          </motion.button>

          <div style={{ marginTop: '30px' }}>
            <AnimatePresence mode='popLayout'>
              {links.map((link, index) => (
                <motion.div
                  key={link.id}
                  layout
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="row g-3 mb-3 align-items-end"
                >
                  <div className="col-md-2">
                    <label className="small fw-bold text-muted d-block mb-1">{t('playlist.source')}</label>
                    <select className="form-select border-0 bg-light shadow-sm" style={{ height: '45px' }}>
                      <option>{t('playlist.link')}</option>
                      <option>{t('playlist.file')}</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted d-block mb-1">{t('playlist.link')}</label>
                    <input
                      type="text"
                      className="form-control border-0 bg-light shadow-sm"
                      placeholder={t('playlist.put_link')}
                      style={{ height: '45px' }}
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...links];
                        newLinks[index].url = e.target.value;
                        setLinks(newLinks);
                      }}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="small fw-bold text-muted d-block mb-1">{t('playlist.name')}</label>
                    <input
                      type="text"
                      className="form-control border-0 bg-light shadow-sm"
                      placeholder={t('playlist.name')}
                      style={{ height: '45px' }}
                      value={link.name}
                      onChange={(e) => {
                        const newLinks = [...links];
                        newLinks[index].name = e.target.value;
                        setLinks(newLinks);
                      }}
                    />
                  </div>
                  <div className="col-md-1">
                    <motion.button
                      variants={buttonHover}
                      whileHover={{ scale: 1.1, backgroundColor: '#ffebee' }}
                      whileTap="tap"
                      onClick={() => removeRow(link.id)}
                      className="btn btn-light border-0 shadow-sm w-100 d-flex align-items-center justify-content-center"
                      style={{ height: '45px', color: '#dc3545' }}
                    >
                      <FaTrash size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="d-flex justify-content-end mt-5 gap-3">
            <motion.button
              variants={buttonHover}
              whileHover="hover"
              whileTap="tap"
              className="btn px-4 py-2 d-flex align-items-center border-0"
              style={{ backgroundColor: '#1B2631', color: 'white', borderRadius: '10px' }}
              onClick={async () => {
                const firstLink = links[0];

                if (!macAddress) {
                  toast.error(t('playlist.mac_not_found'));
                  return;
                }

                if (!firstLink.url || !firstLink.name) {
                  toast.error(t('playlist.enter_name_link'));
                  return;
                }

                const result = await saveM3uPlaylist(macAddress, {
                  name: firstLink.name,
                  m3uUrl: firstLink.url
                });

                if (result.success) {
                  toast.success(result.message || t('playlist.saved'));
                } else {
                  toast.error(result.message);
                }
              }}
            >
              {t('playlist.save_playlist')}
            </motion.button>
          </div>
        </motion.div>

        {/* Delete Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white text-dark p-4 rounded-3 shadow-lg border-0"
        >
          <h5 className="fw-bold mb-4">{t('playlist.delete_playlist')}</h5>
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-1">
              <label className="small fw-bold text-muted">{t('playlist.your_mac')}</label>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-danger small fw-bold"
              >
                {t('playlist.required')}
              </motion.span>
            </div>
            <div className="position-relative">
              <input
                type="text"
                className="form-control border-2 border-danger shadow-sm"
                value={deleteMac}
                onChange={(e) => setDeleteMac(e.target.value)}
                style={{ paddingRight: '45px', height: '50px', borderRadius: '10px', backgroundColor: '#fff5f5' }}
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="position-absolute text-danger"
                style={{ right: '15px', top: '15px' }}
              >
                <FaExclamationCircle size={20} />
              </motion.div>
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <motion.button
              variants={buttonHover} whileHover="hover" whileTap="tap"
              className="btn px-4 py-1 fw-bold border-0"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '10px' }}
            >
              {t('playlist.delete')} <FaChevronRight className="ms-2" size={12} />
            </motion.button>
          </div>
        </motion.div>

      </motion.div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        toastStyle={{ fontSize: '12px', padding: '5px 12px', minHeight: 'auto' }}
      />
      <style jsx>{`
    .form-control:focus, .form-select:focus {
      box-shadow: 0 0 0 3px rgba(255, 213, 79, 0.25) !important;
      border-color: #FFD54F !important;
      outline: none;
    }
    input::placeholder {
      color: #adb5bd !important;
      font-size: 0.9rem;
    }
  `}</style>
    </div>
  );
};

export default PlaylistManager;