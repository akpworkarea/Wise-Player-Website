import { useState, useEffect } from 'react';
import { ChevronRight, Flame } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateDevice } from '../auth/apiservice';
import { useTranslation } from 'react-i18next';
import Footer from '../component/Footer';

// ── MAC auto-formatter ──────────────────────────────────────────
const formatMac = (raw) => {
  const hex = raw.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 12);
  return hex.match(/.{1,2}/g)?.join(':') ?? '';
};

// FIXED - was checking against a UUID-style pattern (8-4-4-4-12 hex groups
// separated by hyphens), which a colon-separated MAC address like
// AA:BB:CC:DD:EE:FF can never match. That mismatch kept isMacComplete
// permanently false, so the Validate button was always disabled even with
// a complete MAC and valid PIN entered.
const isMacComplete = (mac) =>
  /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(mac);

// NEW - PIN validation helper
const isPinValid = (p) => /^\d{4}$/.test(p);

const WiseplayerUpload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [uploadMac, setUploadMac] = useState('');
  const [pin, setPin] = useState(''); // NEW - PIN state
  const [statusError, setStatusError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const mac = query.get('mac');
    if (mac) setUploadMac(formatMac(mac));
  }, [location]);

 const handleMacChange = (e) => {
  if (statusError) setStatusError('');
  setUploadMac(e.target.value);
};

  // NEW - PIN change handler
  const handlePinChange = (e) => {
    if (statusError) setStatusError('');
    const onlyNums = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(onlyNums);
  };

  const handleConfigure = async () => {
    if (!isMacComplete(uploadMac) || !isPinValid(pin)) return; // NEW - safety gate, API call yahi rukega

    setIsLoading(true);
    setStatusError('');
    try {
      const res = await validateDevice(uploadMac, pin); // CHANGED - pin bhi pass kiya

      // CHANGED - naye API response shape { success, data: [playlists] } ke hisaab se check
      if (!res.success || !res.data?.success) {
        setStatusError('Invalid PIN or Device ID.');
        return;
      }

      navigate('/upload-playlist', { state: { mac: uploadMac, playlists: res.data.data } });
    } catch {
      setStatusError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = isMacComplete(uploadMac) && isPinValid(pin) && !isLoading; // CHANGED - pin check merge kiya

  return (
    <div className="fixed inset-0 bg-[#f4f4f7] flex flex-col items-center justify-center px-4 pt-[85px] pb-[72px]">

      {/* ── CARD ─────────────────────────────────────────── */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6 sm:p-8">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">

          {/* Brand logo */}
          <div className="w-14 h-14 rounded-2xl bg-[#800000]/[0.08] flex items-center justify-center mb-3">
            <Flame size={28} fill="#800000" color="#800000" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] tracking-tight">
            {t("activation.appName")}
            <span className="text-[#800000]"> {t("activation.appName2")}</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 tracking-wide">
            {t("activation.tagline")}
          </p>

          {/* Divider */}
          <div className="w-full h-px bg-black/[0.06] my-3" />

          {/* Page title */}
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1a1a1a] tracking-tight">
            {t('uploadlist.upload_playlist_title')}
          </h2>
          <p className="text-sm text-gray-500 mt-1.5">
            {t('uploadlist.enter_device_mac')}
          </p>
        </div>

        {/* Label */}
        <label className="block text-xs font-bold text-[#1a1a1a] tracking-wide uppercase text-center mb-2">
          {t('uploadlist.device_id_label')}
        </label>

        {/* Input */}
        <input
          type="text"
          inputMode="text"
          placeholder="AA:BB:CC:DD:EE:FF"
          value={uploadMac}
          onChange={handleMacChange}
          maxLength={36}
          className={`
            w-full h-12 px-4 rounded-xl border-2 text-center
            font-bold text-lg tracking-[4px] uppercase outline-none
            transition-colors duration-200 shadow-none bg-white
            ${statusError
              ? 'border-red-400 bg-red-50 text-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : uploadMac
                ? 'border-[#800000] bg-[#800000]/[0.04] text-[#800000] focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15'
                : 'border-gray-200 text-[#1a1a1a] focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15'
            }
          `}
        />

        {/* NEW - PIN Label */}
        <label className="block text-xs font-bold text-[#1a1a1a] tracking-wide uppercase text-center mb-2 mt-4">
          Enter PIN
        </label>

        {/* NEW - PIN Input */}
        <input
          type="text"
          inputMode="numeric"
         placeholder="Enter PIN"
          value={pin}
          onChange={handlePinChange}
          maxLength={4}
          className={`
            w-full h-12 px-4 rounded-xl border-2 text-center
            font-bold text-lg tracking-[4px] outline-none
            transition-colors duration-200 shadow-none bg-white
            ${pin && !isPinValid(pin)
              ? 'border-red-400 bg-red-50 text-red-700'
              : pin
                ? 'border-[#800000] bg-[#800000]/[0.04] text-[#800000]'
                : 'border-gray-200 text-[#1a1a1a] focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15'
            }
          `}
        />
        {/* NEW - PIN inline error */}
        {pin.length > 0 && !isPinValid(pin) && (
          <p className="text-sm font-semibold text-red-600 text-center mt-2">
            PIN must be 4 digits
          </p>
        )}

        {/* Error */}
        {statusError && (
          <p className="text-sm font-semibold text-red-600 text-center mt-2.5">
            {statusError}
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleConfigure}
          disabled={!isValid}
          className={`
            w-full py-3 sm:py-3.5 rounded-xl font-bold text-sm mt-5
            flex items-center justify-center gap-2
            transition-all duration-200 active:scale-[0.98] border-0
            ${isValid
              ? 'bg-[#800000] hover:bg-[#6a0000] text-white shadow-sm hover:shadow-md cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {t('uploadlist.checking_status')}
            </>
          ) : (
            <>
              {t('uploadlist.validate_btn')}
              <ChevronRight size={18} />
            </>
          )}
        </button>

      </div>

      {/* ── FOOTER — fixed to bottom ──────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.06] py-3 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 max-w-md mx-auto">
         <Footer />
        </div>
      </div>

    </div>
  );
};

export default WiseplayerUpload;