import React, { useState, useEffect } from 'react';
import { Mail, Flame, Home, CloudDownload, Tag, Menu, X, ChevronRight, UserPlus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
  { code: 'en', name: t('navbar.languages.en') },
  { code: 'fr', name: t('navbar.languages.fr') },
  { code: 'es', name: t('navbar.languages.es') },
  { code: 'de', name: t('navbar.languages.de') },
  { code: 'it', name: t('navbar.languages.it') },
  { code: 'pt', name: t('navbar.languages.pt') },
  { code: 'nl', name: t('navbar.languages.nl') },
  { code: 'ar', name: t('navbar.languages.ar') }
];

  const navLinks = [
    { name: t('navbar.nav_home'), path: '/home', icon: <Home size={17} /> },
    { name: t('navbar.nav_upload_list'), path: '/upload-list', icon: <CloudDownload size={17} /> },
    { name: t('navbar.nav_activation'), path: '/activation', icon: <Tag size={17} /> },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCurrentLang((i18n.language || 'en').slice(0, 2).toUpperCase());
  }, [i18n.language]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#lang-dropdown')) {
        setIsLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
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

          {/* ── LOGO ───────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <Flame
              size={32}
              fill="#800000"
              color="#800000"
              className="animate-[flame-pulse_2s_ease-in-out_infinite] group-hover:scale-110 transition-transform duration-200"
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

          {/* ── CENTER NAV (desktop only) ────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 no-underline
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

          {/* ── RIGHT ACTIONS ────────────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Reseller button — desktop only */}
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
            <div id="lang-dropdown" className="relative">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className={`
                  w-10 h-10 rounded-full border-2 bg-white
                  text-[11px] font-black text-[#1a1a1a]
                  flex items-center justify-center
                  transition-all duration-200
                  ${isLanguageDropdownOpen
                    ? 'border-[#800000] shadow-[0_0_0_3px_rgba(128,0,0,0.15)]'
                    : 'border-gray-200 hover:border-[#800000]/40'
                  }
                `}
              >
                {currentLang.slice(0, 2)}
              </button>

              {/* Dropdown */}
              {isLanguageDropdownOpen && (
                <div className="
                  absolute top-[calc(100%+10px)] right-0 z-[1100]
                  bg-white border border-gray-100 rounded-xl shadow-lg
                  min-w-[130px] overflow-hidden py-1
                ">
                  {availableLanguages.map((lang) => {
                    const isSelected = lang.code === i18n.language;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setCurrentLang(lang.code.toUpperCase());
                          setIsLanguageDropdownOpen(false);
                        }}
                        className={`
                          w-full text-left px-4 py-2.5 text-sm transition-colors duration-150
                          ${isSelected
                            ? 'text-[#800000] font-bold bg-[#800000]/[0.05]'
                            : 'text-[#1a1a1a] font-medium hover:bg-gray-50'
                          }
                        `}
                      >
                        {lang.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="
                md:hidden flex items-center justify-center
                w-10 h-10 rounded-xl
                text-[#1a1a1a] hover:bg-gray-100
                transition-colors duration-200
              "
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>

        {/* ── MOBILE DROPDOWN ──────────────────────────────────── */}
        {isMenuOpen && (
          <div className="
            md:hidden
            absolute top-[calc(100%+8px)] left-[4%] w-[92%]
            bg-white rounded-2xl border border-black/[0.06]
            shadow-xl shadow-black/10
            p-5 flex flex-col gap-4
            z-[1001]
          ">
            {/* Nav links */}
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    text-base font-semibold no-underline
                    transition-colors duration-150
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

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Reseller */}
            <Link
              to="/reseller"
              onClick={() => setIsMenuOpen(false)}
              className="
                flex items-center justify-center gap-2.5
                px-4 py-3.5 rounded-xl
                text-base font-bold text-white bg-[#1a1a1a]
                hover:bg-black active:scale-[0.98]
                transition-all duration-200 no-underline
              "
            >
              <UserPlus size={18} />
              {t('navbar.nav_reseller')}
            </Link>
          </div>
        )}
      </header>

      {/* ── SPACER ──────────────────────────────────────────────────── */}
      <div className={`transition-all duration-300 ${isScrolled ? 'h-[70px]' : 'h-[85px]'}`} />

      {/* ── FLAME PULSE KEYFRAME ─────────────────────────────────────
          Minimal inline keyframe only for the logo animation.
          Does not affect global layout or typography.
      ─────────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes flame-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px #800000); }
          50%       { transform: scale(1.12); filter: drop-shadow(0 0 8px #800000); }
        }
      `}</style>
    </>
  );
};

export default Navbar;