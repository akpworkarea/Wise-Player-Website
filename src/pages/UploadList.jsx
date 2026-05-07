import { useState, useEffect } from 'react';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateDevice } from '../auth/apiservice';
import { useTranslation } from 'react-i18next';

// ── MAC auto-formatter ──────────────────────────────────────────
const formatMac = (raw) => {
  const hex = raw.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 12);
  return hex.match(/.{1,2}/g)?.join(':') ?? '';
};

const isMacComplete = (mac) => /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(mac);

const WiseplayerUpload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [uploadMac, setUploadMac] = useState('');
  const [statusError, setStatusError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const mac = query.get('mac');
    if (mac) setUploadMac(formatMac(mac));
  }, [location]);

  const handleMacChange = (e) => {
    if (statusError) setStatusError('');
    setUploadMac(formatMac(e.target.value));
  };

  const handleConfigure = async () => {
    setIsLoading(true);
    setStatusError('');
    try {
      const res = await validateDevice(uploadMac);
      if (!res.success || !res.data) {
        setStatusError('Device is not registered.');
        return;
      }
      const { status, allowed, message } = res.data;
      if (!allowed) {
        setStatusError(message || 'Your Subscription expired. Please renew.');
      }
      if (status === 'ACTIVE') {
        navigate('/upload-playlist', { state: { mac: uploadMac } });
      } else if (status === 'INACTIVE') {
        setStatusError('Device is registered but status is Inactive.');
      } else {
        setStatusError('Device is not registered.');
      }
    } catch {
      setStatusError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = isMacComplete(uploadMac) && !isLoading;

  return (
    /* outer: fixed full viewport, no scroll */
    <div className="!fixed !inset-0 !bg-[#f4f4f7] flex flex-col items-center justify-center px-4">

      {/* ── CARD ─────────────────────────────────────────── */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl border border-black/[0.06] shadow-sm p-7 sm:p-9 mb-20">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-[#800000]/[0.08] flex items-center justify-center mb-4">
            <ShieldCheck size={28} className="!text-[#800000]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold !text-[#1a1a1a] tracking-tight">
            {t('upload_playlist_title')}
          </h2>
          <p className="text-sm !text-gray-500 mt-1.5">
            Enter your device MAC address to continue
          </p>
        </div>

        {/* Label — centered */}
        <label className="!block !text-sm !font-bold !text-[#1a1a1a] !tracking-wide text-center !mb-2">
          {t('device_id_label')}
        </label>

        {/* Input — use !important to override index.css global input styles */}
        <input
          type="text"
          inputMode="text"
          placeholder="AA:BB:CC:DD:EE:FF"
          value={uploadMac}
          onChange={handleMacChange}
          maxLength={17}
          className={`
            !w-full !box-border !px-4 !py-3.5 !rounded-xl !border-2 text-center
            !font-bold !text-lg !tracking-[4px] !uppercase !outline-none
            !transition-colors !duration-200 !shadow-none
            ${statusError
              ? '!border-red-400 !bg-red-50 !text-red-700 focus:!border-red-500 focus:!ring-0'
              : uploadMac
                ? '!border-[#800000] !bg-white !text-[#1a1a1a] focus:!border-[#800000] focus:!ring-2 focus:!ring-[#800000]/20'
                : '!border-gray-200 !bg-white !text-[#1a1a1a] focus:!border-[#800000] focus:!ring-2 focus:!ring-[#800000]/20'
            }
          `}
        />

        {/* Error */}
        {statusError && (
          <p className="text-sm font-semibold !text-red-600 text-center mt-2.5">
            {statusError}
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleConfigure}
          disabled={!isValid}
          className={`
            w-full py-4 rounded-xl font-bold text-base mt-5
            flex items-center justify-center gap-2
            transition-all duration-200 active:scale-[0.98] border-0
            ${isValid
              ? 'bg-[#800000] hover:bg-[#6a0000] !text-white shadow-sm hover:shadow-md cursor-pointer'
              : '!bg-gray-100 !text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {t('checking_status')}
            </>
          ) : (
            <>
              {t('validate_btn')}
              <ChevronRight size={18} />
            </>
          )}
        </button>

      </div>

      {/* ── FOOTER — fixed to bottom ──────────────────────── */}
     <div className="!fixed !bottom-0 !left-0 !right-0 bg-white border-t border-black/[0.06] pt-4 pb-6 px-4 gap-4 flex flex-col items-center justify-center">

  {/* Copyright first */}
  <p className="text-xs !text-gray-500 font-medium text-center">
    &copy; {new Date().getFullYear()} {t('footer_copyright')}
  </p>

  {/* Footer links below with spacing */}
  <div className="flex flex-row items-center justify-center gap-3 max-w-md mx-auto">
    {[t('footer_privacy'), t('footer_terms'), t('footer_helpdesk')].map((label) => (
      <a
        key={label}
        href="#"
        className="
          text-xs uppercase tracking-wide
          !text-gray-500 font-bold
          hover:!text-[#800000]
          transition-colors duration-150
          no-underline
        "
      >
        {label}
      </a>
    ))}
  </div>

</div>

    </div>
  );
};

export default WiseplayerUpload;