import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, User, Lock, ArrowRight, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { loginReseller } from '../auth/apiservice';
import { useDashboard } from '../context/dashboardContext';
import { useTranslation } from "react-i18next";
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [isLangOpen, setIsLangOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { refetchDashboard } = useDashboard();
    const { setUserRole } = useAuth();

    const [view, setView] = useState('login');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const showToast = (msg, type = "info") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
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

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await loginReseller({ username, password });
        setLoading(false);

        if (result.success) {
            showToast('Success! Redirecting...', 'success');
            localStorage.setItem("user", JSON.stringify(result.data));
            setUserRole(result?.data?.role);
            localStorage.setItem('userName', username);
            await refetchDashboard();
            navigate('/dashboard');
        } else {
            showToast(result.message || 'Invalid credentials', 'error');
        }
    };

    const handleForgot = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showToast('Reset link sent!', 'success');
        }, 1500);
    };

    return (
        <div className="auth-wrapper">
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

            <Container className="h-100 d-flex flex-column justify-content-between">

                <div className="flex-grow-1 d-flex align-items-center">
                    <Row className="justify-content-center w-100">
                        <Col xs={11} sm={8} md={6} lg={4}>

                            {/* LOGO */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-center mb-4"
                            >
                                <div className="logo-box">
                                    <Flame size={28} color="#ff5a5f" />
                                </div>

                                <h2 className="fw-bold mt-3">
                                    WISE <span className="brand">PLAYER</span>
                                </h2>

                                <div className="badge bg-dark mt-2 small">
                                    {t('reseller_portal')}
                                </div>
                            </motion.div>

                            {/* CARD */}
                            <motion.div className="auth-card">

                                <AnimatePresence mode="wait">

                                    {view === 'login' ? (
                                        <motion.div key="login">

                                            <h5 className="fw-bold mb-1">{t('sign_in_title')}</h5>

                                            {/* ✅ FIX 1: ADDED SPACE BELOW SUBTITLE */}
                                            <p className="text-muted small mb-4">
                                                {t('sign_in_subtitle')}
                                            </p>

                                            <Form onSubmit={handleLogin}>

                                                <Form.Group className="mb-3">
                                                    <InputGroup>
                                                        <InputGroup.Text><User size={15} /></InputGroup.Text>
                                                        <Form.Control
                                                            value={username}
                                                            onChange={(e) => setUsername(e.target.value)}
                                                            required
                                                        />
                                                    </InputGroup>
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <InputGroup>
                                                        <InputGroup.Text><Lock size={15} /></InputGroup.Text>
                                                        <Form.Control
                                                            type={showPassword ? "text" : "password"}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            required
                                                        />

                                                        {/* ✅ FIX 2: CLEAN EYE ICON ALIGNMENT */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="eye-btn"
                                                        >
                                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>

                                                    </InputGroup>
                                                </Form.Group>

                                                <div className="text-end mb-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setView('forgot')}
                                                        className="auth-link border-0 bg-transparent"
                                                    >
                                                        {t('forgot_password')}
                                                    </button>
                                                </div>

                                                <Button type="submit" disabled={loading} className="w-100 premium-btn">
                                                    {loading ? (
                                                        <Spinner size="sm" />
                                                    ) : (
                                                        <span className="d-flex align-items-center justify-content-center gap-2">
                                                            {t('Sign_in')}<ArrowRight size={16} />
                                                        </span>
                                                    )}
                                                </Button>
                                            </Form>

                                            <div className="text-center mt-3 small">
                                                Don’t have an account?{" "}
                                                <span className="auth-link" onClick={() => navigate('/register')}>
                                                    {t('Register')}
                                                </span>
                                            </div>

                                        </motion.div>
                                    ) : (

                                        <motion.div key="forgot">

                                            <button
                                                onClick={() => setView('login')}
                                                className="auth-link d-flex align-items-center mb-3"
                                            >
                                                <ArrowLeft size={14} className="me-1" />
                                                {t('back_to_signin')}
                                            </button>

                                            <h5>{t('recover_password')}</h5>
                                            <p className="text-muted small">{t('recover_subtitle')}</p>

                                            <Form onSubmit={handleForgot}>
                                                <Form.Group className="mb-3">
                                                    <InputGroup>
                                                        <InputGroup.Text><User size={15} /></InputGroup.Text>
                                                        <Form.Control
                                                            value={username}
                                                            onChange={(e) => setUsername(e.target.value)}
                                                            required
                                                        />
                                                    </InputGroup>
                                                </Form.Group>

                                                <Button type="submit" disabled={loading} className="w-100 premium-btn">
                                                    {loading ? <Spinner size="sm" /> : t('btn_send_recovery')}
                                                </Button>
                                            </Form>

                                        </motion.div>
                                    )}

                                </AnimatePresence>

                            </motion.div>

                        </Col>
                    </Row>
                </div>

                {/* FOOTER */}
                <div className="footer-sec d-flex align-items-center justify-content-center gap-1 pb-3">
                    <Shield size={16} className="text-success" />
                    <span className="small fw-semibold footer-text">
                        Authorized Access Only
                    </span>
                </div>

            </Container>

            {toast && (
                <div className={`toast-custom ${toast.type}`}>
                    {toast.msg}
                </div>
            )}

            {/* FIXED STYLES ONLY */}
            <style>{`
                .auth-wrapper {
                    height: 100vh;
                    background: linear-gradient(135deg, #f8fafc, #fff1f2, #eef6ff);
                }

                .logo-box {
                    display: inline-block;
                    padding: 12px;
                    border-radius: 14px;
                    background: #111;
                }

                .brand { color: #ff5a5f; }

                .auth-card {
                    background: #fff;
                    padding: 24px;
                    border-radius: 18px;
                    box-shadow: 0 15px 40px rgba(0,0,0,0.08);
                }

                .premium-btn {
                    background: #000;
                    border: none;
                    padding: 11px;
                    font-weight: 600;
                    border-radius: 10px;
                }

                /* ✅ FIXED EYE ICON */
                .eye-btn {
                    border: none;
                    background: #f3f4f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 12px;
                    cursor: pointer;
                    border-left: 1px solid #e5e7eb;
                }

                .eye-btn:hover {
                    background: #e5e7eb;
                }

                .auth-link {
                    font-size: 13px;
                    font-weight: 600;
                    color: #555;
                    cursor: pointer;
                }

                .auth-link:hover {
                    color: #000;
                    text-decoration: underline;
                }

                .footer-sec {
                    padding-bottom: 12px;
                }

                .toast-custom {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 10px 18px;
                    border-radius: 10px;
                    color: #fff;
                }

                .toast-custom.success { background: #16a34a; }
                .toast-custom.error { background: #dc2626; }
            `}</style>

        </div>
    );
};

export default LoginPage;