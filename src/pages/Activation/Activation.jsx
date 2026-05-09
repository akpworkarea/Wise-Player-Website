import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, ChevronRight, Cpu, ShieldCheck, CheckCircle2,
  ExternalLink, Zap, HelpCircle, Lock, Shield
} from 'lucide-react';
import { generateDeviceKey, activateDeviceApi } from '../../auth/apiservice';
import './Activation.css';
import { useTranslation } from 'react-i18next';
const WisePlayerActivation = () => {
  const { t } = useTranslation();
  const [macAddress, setMacAddress] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isKeyGenerated, setIsKeyGenerated] = useState(false);
  const [isKeyLoading, setIsKeyLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');

  const isMacValid = macAddress.length === 12;
  const canActivate = isMacValid && isKeyGenerated && isAgreed;

  const handleMacChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (value.length <= 12) { setMacAddress(value); setIsKeyGenerated(false); }
  };

  const formatMac = (val) => val.match(/.{1,2}/g)?.join(':') || val;

  const handleGenerateKey = async () => {
    if (!isMacValid) return;
    setIsKeyLoading(true);
    const result = await generateDeviceKey(formatMac(macAddress));
    if (result.success) { setGeneratedKey(result.data.activationKey); setIsKeyGenerated(true); }
    else alert(result.message || 'Failed to generate key');
    setIsKeyLoading(false);
  };

  const handleActivate = async () => {
    if (!canActivate) return;
    setIsLoading(true);
    const result = await activateDeviceApi(formatMac(macAddress), generatedKey);
    if (result.success) setIsSuccess(true);
    else alert(result.message || 'Activation Failed');
    setIsLoading(false);
  };

  const containerVars = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, staggerChildren: 0.1, ease: [0.22, 1, 0.36, 1] } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
  };


  const steps = [t('act_step1'), t('act_step2'), t('act_step3')];

  return (
    <div className="wp-root">
      {/* Background blobs */}
      <div className="wp-blob wp-blob--red" />
      <div className="wp-blob wp-blob--blue" />
      <div className="wp-blob wp-blob--purple" />
      <div className="wp-grid" />

      <motion.div variants={containerVars} initial="hidden" animate="visible" className="wp-wrapper">

        {/* ── Logo ── */}
        <motion.div variants={itemVars} className="wp-logo-section">
          <motion.div
            className="wp-logo-icon"
            whileHover={{ scale: 1.07, rotate: -5 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          >
            <Cpu size={38} color="#fff" />
            <div className="wp-logo-ring" />
          </motion.div>

          <h1 className="wp-logo-title">WISE<span className="wp-logo-red">PLAYER</span></h1>
          <p className="wp-logo-sub">Fast · Secure · Premium Activation</p>


        </motion.div>

        {/* ── Main Card ── */}
        <motion.div variants={itemVars} className="wp-card">
          <div className="wp-card-topline" />

          {/* Warning banner */}
          <div className="wp-banner">
            <div className="wp-banner-icon"><AlertCircle size={13} /></div>
            <p className="wp-banner-text">{t('act_banner')}</p>          </div>

          <div className="wp-card-body">
            <AnimatePresence mode="wait">

              {/* ═══ FORM ═══ */}
              {!isSuccess && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>

                  {/* Section head */}
                  <div className="wp-sec-head">
                    <div className="wp-sec-icon"><Zap size={18} color="#2563eb" /></div>
                    <div>
                      <h2 className="wp-sec-title">{t('act_title')}</h2>
                      <p className="wp-sec-sub">{t('act_subtitle')}</p>                    </div>
                  </div>

                  {/* Step tracker */}
                  <div className="wp-steps">
                    {steps.map((step, i) => {
                      const done = (i === 0 && isMacValid) || (i === 1 && isKeyGenerated) || (i === 2 && isSuccess);
                      const active = (i === 0 && !isMacValid) || (i === 1 && isMacValid && !isKeyGenerated) || (i === 2 && isKeyGenerated && !isSuccess);
                      return (
                        <React.Fragment key={step}>
                          <div className={`wp-step ${done ? 'wp-step--done' : active ? 'wp-step--active' : 'wp-step--idle'}`}>
                            <div className="wp-step-dot">
                              {done ? <CheckCircle2 size={10} /> : <span>{i + 1}</span>}
                            </div>
                            <span className="wp-step-label">{step}</span>
                          </div>
                          {i < 2 && <div className={`wp-step-line ${done ? 'wp-step-line--done' : ''}`} />}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* MAC input */}
                  <div className="wp-field">
                    <label className="wp-label">{t('act_mac_label')}</label>
                    <div className="wp-input-wrap">
                      <input
                        type="text"
                        placeholder="00:00:00:00:00:00"
                        value={formatMac(macAddress)}
                        onChange={handleMacChange}
                        className={`wp-input ${isMacValid ? 'wp-input--valid' : macAddress.length > 0 ? 'wp-input--typing' : ''}`}
                      />
                      <div className="wp-input-badge-area">
                        <AnimatePresence>
                          {isMacValid ? (
                            <motion.div key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="wp-badge-valid">
                              <CheckCircle2 size={11} /> Valid
                            </motion.div>
                          ) : (
                            <span key="cnt" className="wp-badge-count">{macAddress.length}/12</span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <p className="wp-hint">{t('act_mac_hint')}</p>
                  </div>

                  {/* Generate key row */}
                  <div className="wp-genkey-row">
                    <button
                      onClick={handleGenerateKey}
                      disabled={!isMacValid || isKeyLoading}
                      className={`wp-btn-gen ${isMacValid && !isKeyLoading ? 'wp-btn-gen--on' : 'wp-btn-gen--off'}`}
                    >
                      {isKeyLoading ? t('act_generating') : isKeyGenerated ? t('act_key_generated') : t('act_generate_key')}

                    </button>

                    <AnimatePresence>
                      {isKeyGenerated ? (
                        <motion.div key="ready" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }} className="wp-key-ready">
                          <div className="wp-key-dot" /><span>Ready</span>
                        </motion.div>
                      ) : (
                        <div key="locked" className="wp-key-locked"><Lock size={12} /><span>Locked</span></div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Agreement */}
                  <motion.label
                    whileHover={isKeyGenerated ? { x: 4 } : {}}
                    transition={{ type: 'spring', stiffness: 400 }}
                    className={`wp-agree ${isKeyGenerated ? 'wp-agree--on' : 'wp-agree--off'} ${isAgreed ? 'wp-agree--checked' : ''}`}
                  >
                    <div className="wp-checkbox-shell">
                      <input
                        type="checkbox"
                        disabled={!isKeyGenerated}
                        checked={isAgreed}
                        onChange={() => setIsAgreed(!isAgreed)}
                        className="wp-checkbox"
                      />
                      <CheckCircle2 size={13} className="wp-checkbox-check" />
                    </div>
                    <span className="wp-agree-text">
                      {t('act_agree_text')}{' '}
                      <strong className="wp-agree-strong">Wise Player lifetime license.</strong>
                    </span>
                  </motion.label>

                  {/* Activate button */}
                  <div className="wp-activate-wrap">
                    <motion.button
                      whileHover={canActivate ? { scale: 1.025, y: -2 } : {}}
                      whileTap={canActivate ? { scale: 0.975 } : {}}
                      onClick={handleActivate}
                      disabled={!canActivate || isLoading}
                      className={`wp-btn-activate ${canActivate ? 'wp-btn-activate--on' : 'wp-btn-activate--off'}`}
                    >
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.span key="ld" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="wp-btn-inner">
                            <div className="wp-spinner" /> Verifying...
                          </motion.span>
                        ) : (
                          <motion.span key="tx" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="wp-btn-inner">
                            Activate Device <ChevronRight size={18} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ═══ SUCCESS ═══ */}
              {isSuccess && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 16 }} className="wp-success">
                  <div className="wp-success-icon-wrap">
                    <div className="wp-success-pulse" />
                    <div className="wp-success-circle">
                      <ShieldCheck size={46} strokeWidth={2} color="#16a34a" />
                    </div>
                    {/* Confetti dots */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`wp-confetti wp-confetti--${i % 3}`}
                        initial={{ opacity: 0, y: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0], y: -50 - i * 8, x: (i % 2 === 0 ? -1 : 1) * (14 + i * 7), scale: [0, 1.2, 0] }}
                        transition={{ delay: 0.15 + i * 0.07, duration: 0.85, ease: 'easeOut' }}
                      />
                    ))}
                  </div>

                  <h2 className="wp-success-title">Verified &amp; Active!</h2>
                  <p className="wp-success-sub">Your device is now premium licensed.</p>

                  <div className="wp-success-device-box">
                    <span className="wp-success-device-lbl">Activated Device</span>
                    <span className="wp-success-device-mac">{formatMac(macAddress)}</span>
                  </div>

                  <div className="wp-success-tags">
                    <span className="wp-success-tag wp-success-tag--green"><CheckCircle2 size={11} /> Lifetime Access</span>
                    <span className="wp-success-tag wp-success-tag--blue"><Shield size={11} /> Secured</span>
                  </div>

                  <button
                    className="wp-btn-another"
                    onClick={() => { setIsSuccess(false); setMacAddress(''); setIsKeyGenerated(false); setIsAgreed(false); setGeneratedKey(''); }}
                  >
                    t('act_another')
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Card footer */}
          <div className="wp-card-footer">
            {['Secure SSL', '24/7 Support', 'Instant Activation'].map((t, i) => (
              <React.Fragment key={t}>
                {i > 0 && <div className="wp-footer-sep" />}
                <div className="wp-footer-badge"><CheckCircle2 size={12} color="#22c55e" /><span>{t}</span></div>
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Bottom links */}
        <motion.div variants={itemVars} className="wp-bottom">
          <div className="wp-bottom-links">
            <a href="#" className="wp-link">{t('act_support')}</a>
            <a href="#" className="wp-link">{t('act_license')}</a>
          </div>
          <p className="wp-copyright">© 2024 <strong>WISE PLAYER TECHNOLOGY</strong></p>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default WisePlayerActivation;
