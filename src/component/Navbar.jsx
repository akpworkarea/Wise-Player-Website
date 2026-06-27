import React, { useState, useEffect } from 'react';
import { Mail, Home, CloudDownload, Tag, Menu, X, ChevronRight, UserPlus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WisePlayerLogo from './WisePlayerLogo';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(
    (i18n.language || 'en').toUpperCase()
  );

  const availableLanguages = [
    { code: 'en', short: '🇺🇸', name: 'English',    flag: '🇺🇸', image: 'https://flagcdn.com/w40/us.png' },
    { code: 'fr', short: '🇫🇷', name: 'Français',   flag: '🇫🇷', image: 'https://flagcdn.com/w40/fr.png' },
    { code: 'es', short: '🇪🇸', name: 'Español',    flag: '🇪🇸', image: 'https://flagcdn.com/w40/es.png' },
    { code: 'de', short: '🇩🇪', name: 'Deutsch',    flag: '🇩🇪', image: 'https://flagcdn.com/w40/de.png' },
    { code: 'it', short: '🇮🇹', name: 'Italiano',   flag: '🇮🇹', image: 'https://flagcdn.com/w40/it.png' },
    { code: 'pt', short: '🇵🇹', name: 'Português',  flag: '🇵🇹', image: 'https://flagcdn.com/w40/pt.png' },
    { code: 'nl', short: '🇳🇱', name: 'Nederlands', flag: '🇳🇱', image: 'https://flagcdn.com/w40/nl.png' },
    { code: 'ar', short: '🇸🇦', name: 'العربية',    flag: '🇸🇦', image: 'https://flagcdn.com/w40/sa.png' },
  ];

  const navLinks = [
    { name: t('navbar.nav_home'),        path: '/home',        icon: <Home         size={17} /> },
    { name: t('navbar.nav_upload_list'), path: '/upload-list', icon: <CloudDownload size={17} /> },
    { name: t('navbar.nav_activation'),  path: '/activation',  icon: <Tag          size={17} /> },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCurrentLang((i18n.language || 'en').slice(0, 2).toUpperCase());
  }, [i18n.language]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#lang-dropdown')) setIsLanguageDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <header
        className={`
          fixed top-0 left-0 w-full z-[1000] transition-all duration-300
          ${isScrolled
            ? 'h-[70px] bg-white/90 backdrop-blur-md border-b border-black/[0.06] shadow-sm'
            : 'h-[85px] bg-white/98 backdrop-blur-sm border-b border-transparent'
          }
          flex items-center
        `}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* ── LOGO ──────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <WisePlayerLogo
              size={48}
              animate
              bg="#ffffff"
              className="group-hover:scale-105 transition-transform duration-200 shrink-0"
            />
            <div className="leading-none">
              <span className="block text-xl font-black text-[#1a1a1a] tracking-tight">
                {t('navbar.logo.title')}
              </span>
              <span className="block text-[10px] font-bold text-[#800000] tracking-[2.5px] mt-0.5 uppercase">
                {t('navbar.logo.subtitle')}
              </span>
            </div>
          </Link>

          {/* ── CENTER NAV (desktop) ───────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                    transition-all duration-200 no-underline
                    ${isActive
                      ? 'text-[#800000] bg-[#800000]/[0.08]'
                      : 'text-gray-500 hover:text-[#800000] hover:bg-[#800000]/[0.05]'
                    }
                  `}
                >
                  <span className={isActive ? 'text-[#800000]' : 'text-gray-400'}>
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* ── RIGHT ACTIONS ──────────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Reseller — desktop */}
            <Link
              to="/reseller"
              className="
                hidden md:flex items-center gap-2
                px-5 py-2 rounded-full
                text-sm font-bold text-white bg-[#1a1a1a]
                hover:bg-black hover:-translate-y-0.5 hover:shadow-md
                transition-all duration-200 no-underline
              "
            >
              <UserPlus size={15} />
              {t('navbar.nav_reseller')}
            </Link>

            {/* Contact CTA */}
            <Link
              to="/contact"
              className="
                flex items-center gap-2
                px-4 sm:px-5 py-2.5 rounded-full
                text-sm font-bold text-white
                bg-gradient-to-r from-[#800000] to-[#690a72]
                hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#800000]/20
                transition-all duration-200 no-underline
              "
            >
              <Mail size={16} />
              <span className="hidden sm:inline">{t('navbar.nav_contact')}</span>
              <ChevronRight size={14} />
            </Link>

            {/* Language picker */}
            <div id="lang-dropdown" className="relative z-[3000] isolate">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="
                  flex items-center gap-2 h-[38px] px-3.5 rounded-full
                  border border-gray-200 bg-white
                  text-[13px] font-semibold text-gray-800 shadow-sm
                  transition-all duration-200 hover:shadow-md
                  focus:outline-none focus:ring-2 focus:ring-[#800000]/20
                "
                type="button"
              >
                <span className="text-[16px] leading-none">🌐</span>
                <span className="leading-none">
                  {availableLanguages.find((lang) => lang.code === i18n.language)?.short}
                </span>
              </button>

              {isLanguageDropdownOpen && (
                <div className="
                  absolute right-0 top-[115%] w-[180px] overflow-hidden
                  rounded-2xl border border-gray-200 bg-white shadow-2xl z-[99999] isolate
                ">
                  {availableLanguages.map((lang, index) => {
                    const active = i18n.language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          localStorage.setItem('lang', lang.code);
                          setIsLanguageDropdownOpen(false);
                        }}
                        className={`
                          w-full flex items-center justify-between px-3.5 py-2.5
                          transition-all duration-200 cursor-pointer text-left
                          ${active ? 'bg-[#f9f5f5]' : 'bg-white hover:bg-gray-50'}
                          ${index !== availableLanguages.length - 1 ? 'border-b border-gray-100' : ''}
                          appearance-none outline-none focus:bg-gray-50
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={lang.image} alt={lang.name}
                            className="w-5 h-5 rounded-full object-cover shrink-0" draggable={false} />
                          <div className="flex flex-col leading-none min-w-0">
                            <span className="text-[13px] font-bold text-gray-900 truncate">{lang.short}</span>
                            <span className="mt-1 text-[11px] text-gray-500 truncate">{lang.name}</span>
                          </div>
                        </div>
                        {active && (
                          <div className="w-2 h-2 rounded-full bg-[#800000] shadow-[0_0_0_3px_rgba(128,0,0,0.12)] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="
                md:hidden flex items-center justify-center
                w-10 h-10 rounded-xl text-[#1a1a1a]
                hover:bg-gray-100 transition-colors duration-200
              "
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ── MOBILE DROPDOWN ────────────────────────────────── */}
        {isMenuOpen && (
          <div className="
            md:hidden absolute top-[calc(100%+8px)] left-[4%] w-[92%]
            bg-white rounded-2xl border border-black/[0.06]
            shadow-xl shadow-black/10 p-5 flex flex-col gap-4 z-[1001]
          ">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    text-base font-semibold no-underline transition-colors duration-150
                    ${isActive
                      ? 'text-[#800000] bg-[#800000]/[0.06]'
                      : 'text-gray-600 hover:text-[#800000] hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="text-[#800000]">{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}
            <div className="h-px bg-gray-100" />
            <Link
              to="/reseller"
              onClick={() => setIsMenuOpen(false)}
              className="
                flex items-center justify-center gap-2.5
                px-4 py-3.5 rounded-xl text-base font-bold
                text-white bg-[#1a1a1a] hover:bg-black
                active:scale-[0.98] transition-all duration-200 no-underline
              "
            >
              <UserPlus size={18} />
              {t('navbar.nav_reseller')}
            </Link>
          </div>
        )}
      </header>

      {/* ── SPACER ──────────────────────────────────────────── */}
      <div className={`transition-all duration-300 ${isScrolled ? 'h-[70px]' : 'h-[85px]'}`} />
    </>
  );
};

export default Navbar;