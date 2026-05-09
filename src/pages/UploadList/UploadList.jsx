import { useState, useEffect } from 'react';
import { ChevronRight, Tv, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { validateDevice } from '../../auth/apiservice';
import './UploadList.css'; // ✅ ADD THIS
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const WiseplayerUpload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [uploadMac, setUploadMac] = useState('');
  const [statusError, setStatusError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const mac = query.get("mac");
    if (mac) {
      setUploadMac(mac);
    }
  }, [location]);
  const handleUploadChange = (e) => setUploadMac(e.target.value);

  const handleConfigure = async () => {
    setIsLoading(true);
    setStatusError('');

    try {
      const res = await validateDevice(uploadMac);

      if (!res.success || !res.data) {
        setStatusError("Device is not registered.");
        return;
      }

      const { status, allowed, message } = res.data;

      if (!allowed) {
        setStatusError(message || "Your Subscription expired. Please renew.");
      }

      if (status === "ACTIVE") {
        navigate('/upload-playlist', { state: { mac: uploadMac } });

      } else if (status === "INACTIVE") {
        setStatusError("Device is registered but status is Inactive.");
      } else {
        setStatusError("Device is not registered.");
      }

    } catch {
      setStatusError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">

      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">
            <Tv size={22} />
          </div>
          <span className="logo-text">
            WISE<span>PLAYER</span>
          </span>
        </div>
      </nav>

      <main className="main-container">
        <div className="card">

          <div className="card-header">
            <div className="icon-box">
              <ShieldCheck size={24} />
            </div>
            <h2>{t('upload_playlist_title')}</h2>
          </div>

          <label>{t('device_id_label')}</label>

          <input
            type="text"
            placeholder={t('mac_placeholder')}
            value={uploadMac}
            onChange={(e) => {
              handleUploadChange(e);
              if (statusError) setStatusError('');
            }}
            className={statusError ? 'input error' : 'input'}
          />

          {statusError && <p className="error-text">{statusError}</p>}

          <button
            onClick={handleConfigure}
            disabled={isLoading}
            className={uploadMac.length === 17 && !isLoading ? 'btn active' : 'btn'}
          >
            {isLoading ? t('checking_status') : t('validate_btn')}
            {!isLoading && <ChevronRight size={20} />}
          </button>

        </div>
      </main>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} {t('footer_copyright')}
        </p>
        <div className="footer-links">
          <a href="#">{t('footer_privacy')}</a>
          <a href="#">{t('footer_terms')}</a>
          <a href="#">{t('footer_helpdesk')}</a>
        </div>
      </footer>

    </div>
  );
};

export default WiseplayerUpload;