import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = [
    {
      label: "Privacy Policy",
      path: "/privacy-policy",
    },
    {
      label: "Contact Us",
      path: "/contact",
    },
  ];

  return (
    <footer className="w-full py-3 px-42">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Copyright */}
        <p className="text-xs text-gray-400 font-medium text-center sm:text-left">
          © {new Date().getFullYear()} Wise Player. All rights reserved.
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