import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerReseller } from "../../auth/apiservice";
import "./Ragister.css";
import logo from "../../assets/logo.png";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t ,i18n} = useTranslation();
  const navigate = useNavigate();
      const [isLangOpen, setIsLangOpen] = useState(false);
  

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validations = {
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasNumber: /\d/.test(password),
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    isLengthValid: password.length >= 8,
    usernameLength: username.length >= 1 && username.length <= 30,
    usernameAllowedChars: /^[a-zA-Z0-9._]*$/.test(username),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !validations.hasSpecial ||
      !validations.hasNumber ||
      !validations.hasLower ||
      !validations.hasUpper ||
      !validations.isLengthValid
    ) {
      setError(t("reg_err_pass_req"));
      return;
    }
    if (!validations.usernameLength || !validations.usernameAllowedChars) {
      setError(t("reg_err_user_format"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("reg_err_mismatch"));
      return;
    }
    if (!agree) {
      setError(t("reg_err_terms"));
      return;
    }

    const formData = { fullName, username, password };
    const result = await registerReseller(formData);

    if (result.success) {
      navigate("/register-success");
    } else {
      setError(result.message);
    }
  };
  const availableLanguages = [
    {
      code: "en",
      short: "🇺🇸",
      name: "English",
      flag: "🇺🇸",
      image: "https://flagcdn.com/w40/us.png",
    },
    {
      code: "fr",
      short: "🇫🇷",
      name: "Français",
      flag: "🇫🇷",
      image: "https://flagcdn.com/w40/fr.png",
    },
    {
      code: "es",
      short: "🇪🇸",
      name: "Español",
      flag: "🇪🇸",
      image: "https://flagcdn.com/w40/es.png",
    },
    {
      code: "de",
      short: "🇩🇪",
      name: "Deutsch",
      flag: "🇩🇪",
      image: "https://flagcdn.com/w40/de.png",
    },
    {
      code: "it",
      short: "🇮🇹",
      name: "Italiano",
      flag: "🇮🇹",
      image: "https://flagcdn.com/w40/it.png",
    },
    {
      code: "pt",
      short: "🇵🇹",
      name: "Português",
      flag: "🇵🇹",
      image: "https://flagcdn.com/w40/pt.png",
    },
    {
      code: "nl",
      short: "🇳🇱",
      name: "Nederlands",
      flag: "🇳🇱",
      image: "https://flagcdn.com/w40/nl.png",
    },
    {
      code: "ar",
      short: "🇸🇦",
      name: "العربية",
      flag: "🇸🇦",
      image: "https://flagcdn.com/w40/sa.png",
    },
  ];


  return (
    <div className="main-page-wrapper">
      {/* LEFT BRAND */}
      <div className="branding-panel">
        <div className="branding-content">
          <p className="welcome-text">
            {t("reg_hello")}
            <br />
            <span>{t("reg_welcome")}</span>
          </p>

          <div className="logo-circle">
            <img src={logo} alt="logo" />
          </div>

          <h1 className="brand-name">wiseplayer</h1>

          <div className="branding-footer">
            CREATOR <span className="white-text">HERE</span> | DIRECTOR{" "}
            <span className="white-text">HERE</span>
          </div>
        </div>
        <div className="corner-fold"></div>
      </div>

      {/* RIGHT FORM */}
      <div className="register-container">
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 3000,
          }}
        >
          {/* SELECT BUTTON */}
          <div
            onClick={() => setIsLangOpen(!isLangOpen)}
            style={{
              minWidth: "62px",
              height: "42px",
              padding: "0 14px",
              borderRadius: "30px",
              border: "1px solid rgba(255,255,255,0.6)",
              background: "transparent",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "700",
              color: "#111827",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              transition: "all 0.25s ease",
              userSelect: "none",
            }}
          >
            <span style={{ fontSize: "16px" }}>🌐</span>

            <span>
              {
                availableLanguages.find(
                  (lang) => lang.code === i18n.language
                )?.short
              }
            </span>
          </div>

          {/* DROPDOWN */}
          {isLangOpen && (
            <div
              style={{
                position: "absolute",
                top: "52px",
                right: 0,
                width: "210px",
                background: "#ffffff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                border: "1px solid #f1f5f9",
                animation: "fadeIn 0.2s ease",
              }}
            >
              {availableLanguages.map((lang) => {
                const active = i18n.language === lang.code;

                return (
                  <div
                    key={lang.code}
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      localStorage.setItem("lang", lang.code);
                      setIsLangOpen(false);
                    }}
                    style={{
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      background: active ? "#f9fafb" : "#fff",
                      borderBottom: "1px solid #f8fafc",
                      transition: "0.2s",
                    }}
                  >
                    {/* LEFT */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <img
                        src={lang.image}
                        alt={lang.name}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          boxShadow: "0 0 0 1px #e5e7eb",
                        }}
                      />

                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#111827",
                          }}
                        >
                          {lang.short}
                        </div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                          }}
                        >
                          {lang.name}
                        </div>
                      </div>
                    </div>

                    {/* ACTIVE DOT */}
                    {active && (
                      <div
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: "#800000",
                          boxShadow: "0 0 0 4px rgba(128,0,0,0.10)",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className={`content-wrapper ${isVisible ? "visible" : ""}`}>
          <div className="header-section">
            <h1 className="logo-text">
              Wise <span className="logo-bold">IPTV</span>
            </h1>
          </div>

          <div className="glass-card">
            <div className="reseller-badge">{t("reg_signup_badge")}</div>

            <form onSubmit={handleSubmit} className="form-content">
              <div className="input-row">
                <div className="input-group">
                  <label className="custom-label">{t("reg_fullname")}</label>
                  <input
                    className="modern-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="custom-label">{t("reg_username")}</label>
                  <input
                    className="modern-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="custom-label">{t("reg_password")}</label>

                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="modern-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "🔒"}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="custom-label">
                  {t("reg_confirm_password")}
                </label>

                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="modern-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "🔒"}
                  </button>
                </div>
              </div>

              {error && <div className="error-alert">{error}</div>}

              <div className="terms-row" onClick={() => setAgree(!agree)}>
                <div className={`custom-checkbox ${agree ? "checked" : ""}`}>
                  {agree && "✓"}
                </div>
                <span className="terms-txt">
                  {t("reg_agree")}{" "}
                  <span className="highlight">{t("reg_terms")}</span>
                </span>
              </div>

              <button type="submit" className="main-signup-btn">
                {t("reg_create_btn")}
              </button>

              <div className="footer-login">
                <span>{t("reg_already_member")}</span>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-btn"
                >
                  {t("reg_login_now")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
