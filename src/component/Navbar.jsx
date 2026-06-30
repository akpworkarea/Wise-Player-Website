import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, Home, CloudDownload, Tag,
  Menu, X, ChevronRight, UserPlus, Globe,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WisePlayerLogo from './WisePlayerLogo';

const availableLanguages = [
  { code: 'en', short: '🇺🇸', name: 'English',    image: 'https://flagcdn.com/w40/us.png' },
  { code: 'fr', short: '🇫🇷', name: 'Français',   image: 'https://flagcdn.com/w40/fr.png' },
  { code: 'es', short: '🇪🇸', name: 'Español',    image: 'https://flagcdn.com/w40/es.png' },
  { code: 'de', short: '🇩🇪', name: 'Deutsch',    image: 'https://flagcdn.com/w40/de.png' },
  { code: 'it', short: '🇮🇹', name: 'Italiano',   image: 'https://flagcdn.com/w40/it.png' },
  { code: 'pt', short: '🇵🇹', name: 'Português',  image: 'https://flagcdn.com/w40/pt.png' },
  { code: 'nl', short: '🇳🇱', name: 'Nederlands', image: 'https://flagcdn.com/w40/nl.png' },
  { code: 'ar', short: '🇸🇦', name: 'العربية',    image: 'https://flagcdn.com/w40/sa.png' },
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location    = useLocation();
  const langRef     = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [langOpen,   setLangOpen]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);

  const navLinks = [
    { name: t('navbar.nav_home'),        path: '/home',        icon: <Home          size={16} />, color: 'text-[#800000]'  },
    { name: t('navbar.nav_upload_list'), path: '/upload-list', icon: <CloudDownload size={16} />, color: 'text-[#991c22]'  },
    { name: t('navbar.nav_activation'),  path: '/activation',  icon: <Tag           size={16} />, color: 'text-[#6e1216]'  },
  ];

  const currentLang = availableLanguages.find(l => l.code === i18n.language) || availableLanguages[0];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
    setLangOpen(false);
  };

  /*
   * BACKGROUND LOGIC
   * ─────────────────────────────────────────────────────
   * Not scrolled → transparent (blends with home page bg, whatever colour it is)
   * Scrolled     → white/95 + blur + subtle shadow + border
   * This means on home page the navbar floats over the hero bg.
   * On scroll it locks to a clean white.
   *
   * Logo bg prop also switches:
   *   transparent state → bg matches home page (pass 'transparent', falls back to white halo)
   *   scrolled state    → bg="#ffffff"
   */
  const scrolled = isScrolled;

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 w-full z-[1000] flex items-center
          transition-all duration-300
          ${scrolled
            ? 'h-[64px] bg-white/95 backdrop-blur-md shadow-sm border-b border-black/[0.06]'
            : 'h-[78px] bg-transparent'
          }
        `}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                        flex items-center justify-between gap-4">

          {/* ══ LOGO ═══════════════════════════════════════════════════ */}
          <Link to="/" className="flex items-center gap-2.5 no-underline group shrink-0">
            <WisePlayerLogo
              size={44}
              animate
              bg={scrolled ? '#ffffff' : '#ffffff'}
              className="shrink-0 group-hover:scale-105 transition-transform duration-200"
            />
            <div className="leading-none select-none">
              <span className={`block text-[17px] font-black tracking-tight leading-none
                ${scrolled ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]'}`}>
                {t('navbar.logo.title') || 'WisePlayer'}
              </span>
              <span className="block text-[9px] font-bold text-[#800000]
                               tracking-[2.2px] uppercase mt-[3px] leading-none">
                Premium Experience
              </span>
            </div>
          </Link>

          {/* ══ CENTER NAV — lg+ only ══════════════════════════════════ */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl
                    text-sm font-semibold no-underline transition-all duration-200
                    ${active
                      ? 'text-[#800000] bg-[#800000]/[0.07]'
                      : 'text-gray-500 hover:text-[#800000] hover:bg-[#800000]/[0.04]'
                    }
                  `}
                >
                  {/* Each nav icon gets its own brand maroon-family colour when active */}
                  <span className={active ? 'text-[#800000]' : 'text-gray-400'}>
                    {link.icon}
                  </span>
                  {link.name}
                  {/* ✕ NO bottom dot — removed as requested */}
                </Link>
              );
            })}
          </nav>

          {/* ══ RIGHT ACTIONS ══════════════════════════════════════════ */}
          <div className="flex items-center gap-2 shrink-0">

            {/*
             * RESELLER BUTTON
             * Desktop only (lg+) — black solid, white text
             * Hidden on mobile & tablet → lives in hamburger menu
             */}
            <Link
              to="/reseller"
              className="
                hidden lg:flex items-center gap-1.5
                px-4 py-2 rounded-full text-sm font-bold
                text-white bg-[#1a1a1a]
                hover:bg-black hover:-translate-y-px hover:shadow-md
                active:scale-95 transition-all duration-200 no-underline
              "
            >
              <UserPlus size={14} />
              {t('navbar.nav_reseller') || 'Reseller'}
            </Link>

            {/*
             * CONTACT BUTTON
             * Desktop only (lg+) — maroon solid
             * Hidden on mobile & tablet → lives in hamburger menu
             */}
            <Link
              to="/contact"
              className="
                hidden lg:flex items-center gap-1.5
                px-4 py-2 rounded-full text-sm font-bold
                text-white bg-[#800000]
                hover:bg-[#6a0000] hover:-translate-y-px hover:shadow-md hover:shadow-[#800000]/25
                active:scale-95 transition-all duration-200 no-underline
              "
            >
              <Mail size={14} />
              {t('navbar.nav_contact') || 'Contact'}
              <ChevronRight size={12} className="opacity-70" />
            </Link>

            {/*
             * LANGUAGE PICKER — always visible on all breakpoints
             * Globe icon: dark (#1a1a1a) not blue/gray
             * Border: light gray, hover shifts to maroon
             */}
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(v => !v)}
                className="
                  flex items-center justify-center gap-1.5
                  h-9 px-3 rounded-full
                  border border-gray-200 bg-white
                  hover:border-[#800000]/50
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#800000]/20
                "
              >
                 <span className="text-base">🌐</span>
                <span className="text-sm leading-none">{currentLang.short}</span>
              </button>

              {langOpen && (
                <div className="
                  absolute right-0 top-[calc(100%+8px)] w-48
                  bg-white rounded-2xl border border-gray-200
                  shadow-xl z-[99999] overflow-hidden
                ">
                  {availableLanguages.map((lang, i) => {
                    const active = i18n.language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => changeLanguage(lang.code)}
                        className={`
                          w-full flex items-center justify-between
                          px-3.5 py-2.5 text-left transition-colors duration-150
                          ${active ? 'bg-[#800000]/[0.05]' : 'hover:bg-gray-50'}
                          ${i < availableLanguages.length - 1 ? 'border-b border-gray-100' : ''}
                        `}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={lang.image} alt={lang.name}
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                            draggable={false} />
                          <div className="leading-none min-w-0">
                            <p className="text-[13px] font-bold text-gray-900 truncate">{lang.short}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5 truncate">{lang.name}</p>
                          </div>
                        </div>
                        {active && (
                          <div className="w-2 h-2 rounded-full bg-[#800000]
                                          shadow-[0_0_0_3px_rgba(128,0,0,0.12)] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/*
             * HAMBURGER — mobile & tablet only (hidden at lg+)
             * Menu icon: maroon #800000 — colourful, on-brand
             * X icon: darker maroon #6a0000 when open
             */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
              className="
                lg:hidden flex items-center justify-center w-9 h-9 rounded-xl
                bg-[#800000]/[0.07] hover:bg-[#800000]/[0.14]
                transition-colors duration-200
              "
            >
              {menuOpen
                ? <X    size={20} className="text-[#6a0000]" />
                : <Menu size={20} className="text-[#800000]" />
              }
            </button>
          </div>
        </div>

        {/* ══ MOBILE / TABLET MENU ══════════════════════════════════ */}
        {menuOpen && (
          <div className="
            lg:hidden absolute top-[calc(100%+6px)] left-3 right-3
            bg-white rounded-2xl border border-black/[0.06]
            shadow-xl shadow-black/[0.08] p-4 flex flex-col gap-1 z-[1001]
          ">
            {/* Nav links — each icon in its own maroon-family colour */}
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    text-[15px] font-semibold no-underline transition-colors duration-150
                    ${active
                      ? 'text-[#800000] bg-[#800000]/[0.07]'
                      : 'text-gray-600 hover:text-[#800000] hover:bg-gray-50'
                    }
                  `}
                >
                  {/* Icon always in brand colour family — colourful */}
                  <span className={link.color}>{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}

            <div className="my-1 h-px bg-gray-100" />

            {/* Action buttons — Reseller (black) + Contact (maroon) */}
            <div className="flex gap-2">
              <Link
                to="/reseller"
                onClick={() => setMenuOpen(false)}
                className="
                  flex-1 flex items-center justify-center gap-2
                  py-3 rounded-xl text-sm font-bold
                  text-white bg-[#1a1a1a]
                  hover:bg-black transition-all duration-200 no-underline
                "
              >
                <UserPlus size={15} />
                {t('navbar.nav_reseller') || 'Reseller'}
              </Link>

              <Link
                to="/contact"
                onClick={() => setMenuOpen(false)}
                className="
                  flex-1 flex items-center justify-center gap-2
                  py-3 rounded-xl text-sm font-bold
                  text-white bg-[#800000]
                  hover:bg-[#6a0000] transition-all duration-200 no-underline
                "
              >
                <Mail size={15} />
                {t('navbar.nav_contact') || 'Contact'}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── SPACER ──────────────────────────────────────────────────── */}
      <div className={`transition-all duration-300 ${scrolled ? 'h-[64px]' : 'h-[78px]'}`} />
    </>
  );
};

export default Navbar;