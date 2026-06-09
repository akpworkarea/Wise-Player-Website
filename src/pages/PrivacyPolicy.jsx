import { motion } from "framer-motion";
import {
  Shield, Database, Lock, Trash2, Globe,
  Tv, Users, RefreshCw, Mail, Flame,
  ChevronRight, CheckCircle2,
} from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "Information We Collect",
    color: "bg-[#800000]/10 text-[#800000]",
    dot: "bg-[#800000]",
    content: [
      "Virtual device identifiers derived from non-sensitive device information.",
      "Encrypted M3U/IPTV playlist URLs for synchronization and streaming functionality.",
      "Locally stored preferences including language, favorites, and playback settings.",
      "Anonymous diagnostic and usage data to improve reliability and performance.",
    ],
  },
  {
    icon: Shield,
    title: "How We Use Your Information",
    color: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    content: [
      "Authenticate and verify authorized devices.",
      "Provide and maintain the Wise Player application.",
      "Enable playlist synchronization and streaming features.",
      "Improve performance and user experience.",
      "Prevent misuse and diagnose technical issues.",
    ],
  },
  {
    icon: Lock,
    title: "Data Sharing and Disclosure",
    color: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    content: [
      "We never sell or trade your information.",
      "Information may be shared when legally required.",
      "Trusted service providers operate under confidentiality obligations.",
      "Disclosure may occur to protect safety and security.",
    ],
  },
  {
    icon: Lock,
    title: "Data Security",
    color: "bg-green-50 text-green-700",
    dot: "bg-green-500",
    content: [
      "Sensitive information is encrypted.",
      "All supported requests use secure HTTPS communication.",
      "Industry-standard safeguards are implemented to protect data.",
    ],
  },
  {
    icon: Trash2,
    title: "Data Deletion",
    color: "bg-red-50 text-red-700",
    dot: "bg-red-500",
    content: [
      "Deletion requests are generally processed within 30 days.",
      "Local data can be removed by uninstalling the application.",
      "Additional retention may occur where legally required.",
    ],
  },
  {
    icon: Users,
    title: "Children's Privacy",
    color: "bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
    content: [
      "Wise Player is not intended for children under 13 years old.",
      "We do not knowingly collect information from children.",
    ],
  },
  {
    icon: Globe,
    title: "GDPR and International Rights",
    color: "bg-teal-50 text-teal-700",
    dot: "bg-teal-500",
    content: [
      "Access your data.",
      "Correct inaccurate information.",
      "Request deletion.",
      "Restrict or object to processing.",
      "Withdraw consent where applicable.",
      "Request data portability.",
    ],
  },
  {
    icon: Tv,
    title: "IPTV Content Disclaimer",
    color: "bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
    content: [
      "Wise Player is a media player application only.",
      "We do not provide or distribute IPTV subscriptions or content.",
      "Users are solely responsible for the legality of their playlist sources.",
    ],
  },
  {
    icon: RefreshCw,
    title: "Changes to This Policy",
    color: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
    content: [
      "We may update this Privacy Policy periodically.",
      "Continued use of the app constitutes acceptance of updates.",
    ],
  },
];

const stats = [
  { value: "256-bit", label: "AES Encryption" },
  { value: "HTTPS", label: "Secure Transfer" },
  { value: "GDPR", label: "Compliant" },
  { value: "0", label: "Data Sold" },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f4f4f7]">

      {/* ══ HERO HEADER ══════════════════════════════════════════════════════
          Creative full-width maroon hero — replaces the plain sticky nav header.
          No nav overlap issue since this IS the header for this standalone page.
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="relative bg-[#800000] overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-5 py-14 md:py-20 lg:py-24">
          {/* Brand bar */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5 mb-8"
          >
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Flame size={18} fill="white" color="white" />
            </div>
            <span className="text-sm font-black text-white tracking-tight">
              WISE<span className="text-yellow-400">PLAYER</span>
            </span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              {/* Breadcrumb */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-1.5 text-white/50 text-xs font-semibold mb-4 uppercase tracking-widest"
              >
                <span>Legal</span>
                <ChevronRight size={12} />
                <span className="text-white/80">Privacy Policy</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight"
              >
                Your Privacy
                <br />
                <span className="text-yellow-400">Matters</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-5 text-white/70 text-base sm:text-lg leading-relaxed max-w-lg"
              >
                We are committed to protecting your personal information and
                your right to privacy. Read how we collect, use, and safeguard your data.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-6 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs text-white/80 font-semibold"
              >
                <CheckCircle2 size={13} className="text-yellow-400" />
                Effective Date: June 8, 2026
              </motion.div>
            </div>

            {/* Stats — desktop right side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-3 lg:gap-4 shrink-0"
            >
              {stats.map((s) => (
                <div key={s.label}
                  className="bg-white/10 border border-white/15 rounded-2xl px-5 py-4 text-center backdrop-blur-sm">
                  <p className="text-xl sm:text-2xl font-black text-yellow-400">{s.value}</p>
                  <p className="text-[11px] text-white/60 font-semibold mt-0.5 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="h-8 bg-[#f4f4f7]" style={{
          clipPath: "ellipse(55% 100% at 50% 100%)",
          marginTop: "-1px",
        }} />
      </div>

      {/* ══ CONTENT ══════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 space-y-10">

        {/* Intro card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#800000]/10 flex items-center justify-center shrink-0">
              <Shield size={20} className="text-[#800000]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Welcome to Wise Player
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Wise Player ("we", "our", or "us") operates the Wise Player mobile application.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when using our application. Please read this carefully — it matters.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Policy sections grid */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.04, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${section.color}`}>
                  <Icon size={19} />
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-4">
                  {section.title}
                </h3>

                <ul className="space-y-2.5">
                  {section.content.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-gray-600 leading-relaxed">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${section.dot}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Contact card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#800000] rounded-2xl p-6 sm:p-8 shadow-lg overflow-hidden relative"
        >
          {/* Decorative circle */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Mail size={26} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Contact Us
              </h2>
              <p className="text-white/70 text-sm mb-4">
                Have questions regarding this Privacy Policy? We're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <Users size={14} className="text-yellow-400 shrink-0" />
                  <span className="font-medium text-white/60">Developer:</span>
                  <span className="font-bold text-white">Wise Player Team</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Mail size={14} className="text-yellow-400 shrink-0" />
                  <span className="font-medium text-white/60">Email:</span>
                  <a href="mailto:admin@wise-player.com"
                    className="font-bold text-yellow-400 hover:text-yellow-300 transition-colors">
                    admin@wise-player.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 font-medium pb-6">
          © {new Date().getFullYear()} Wise Player. All rights reserved. · Privacy Policy
        </div>
      </div>
    </div>
  );
}