import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { DashboardProvider } from '../src/context/dashboardContext.jsx'

// i18n
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en.json';
import translationFR from './locales/fr.json';
import translationES from './locales/es.json';
import translationDE from './locales/de.json';
import translationIT from './locales/it.json';
import translationPT from './locales/pt.json';
import translationNL from './locales/nl.json';
import translationAR from './locales/ar.json'; 

import { AuthProvider } from '../src/context/AuthContext.jsx'
import {RefreshProvider} from '../src/context/RefreshContext.jsx'
// import { initAnimatedFavicon } from '../src/component/Animatedfavicon.jsx';



i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      fr: { translation: translationFR },
      es: { translation: translationES },
      de: { translation: translationDE },
      it: { translation: translationIT },
      pt: { translation: translationPT },
      nl: { translation: translationNL },
      ar: { translation: translationAR },
    },
    lng: localStorage.getItem("lang") || "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

// ✅ GLOBAL SYNC
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
  document.documentElement.lang = lng;
});

// initAnimatedFavicon(); // call before ReactDOM.render

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>            {/* ✅ MUST be first */}
      <RefreshProvider>
      <DashboardProvider>     {/* ✅ depends on Auth */}
        <App />
      </DashboardProvider>
      </RefreshProvider>
    </AuthProvider>
  </React.StrictMode>
)

