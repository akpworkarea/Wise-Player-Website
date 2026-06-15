import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
const Footer = () => {
  const { t } = useTranslation();
  const footerLinks = [
    {
      label: t("privacy"),
      path: "/privacy-policy",
    },
    {
      label: t("contact"),
      path: "/contact",
    },
  ];

  return (
    <footer className="w-full py-3 px-42">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Copyright */}
        <p className="text-xs text-gray-400 font-medium text-center sm:text-left">
          © {new Date().getFullYear()} Wise Player. {t("rights")}
        </p>

        {/* Navigation Links */}
        <div className="flex items-center gap-5">
          {footerLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-xs font-semibold text-gray-400 uppercase tracking-wide no-underline transition-colors duration-150 hover:text-[#800000]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
