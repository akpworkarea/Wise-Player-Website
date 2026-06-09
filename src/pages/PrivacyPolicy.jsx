import { motion } from "framer-motion";
import {
  Shield,
  Database,
  Lock,
  Trash2,
  Globe,
  Tv,
  Users,
  RefreshCw,
  Mail,
} from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "Information We Collect",
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
    content: [
      "Sensitive information is encrypted.",
      "All supported requests use secure HTTPS communication.",
      "Industry-standard safeguards are implemented to protect data.",
    ],
  },
  {
    icon: Trash2,
    title: "Data Deletion",
    content: [
      "Deletion requests are generally processed within 30 days.",
      "Local data can be removed by uninstalling the application.",
      "Additional retention may occur where legally required.",
    ],
  },
  {
    icon: Users,
    title: "Children's Privacy",
    content: [
      "Wise Player is not intended for children under 13 years old.",
      "We do not knowingly collect information from children.",
    ],
  },
  {
    icon: Globe,
    title: "GDPR and International Rights",
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
    content: [
      "Wise Player is a media player application only.",
      "We do not provide or distribute IPTV subscriptions or content.",
      "Users are solely responsible for the legality of their playlist sources.",
    ],
  },
  {
    icon: RefreshCw,
    title: "Changes to This Policy",
    content: [
      "We may update this Privacy Policy periodically.",
      "Continued use of the app constitutes acceptance of updates.",
    ],
  },
];
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 lg:px-12">
        <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900 md:text-4xl">
            Privacy Policy
          </h1>

          <p className="mt-2 text-sm text-slate-500 md:text-base">
            Effective Date: June 8, 2026
          </p>
        </div>
      </div>
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white p-8 shadow-lg"
        >
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Welcome to Wise Player
          </h2>

          <p className="leading-8 text-slate-600">
            Wise Player ("we", "our", or "us") operates the Wise Player mobile
            application. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when using our application.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section, index) => {
            const Icon = section.icon;

            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{
                  y: -8,
                }}
                className="rounded-3xl bg-white p-7 shadow-md transition-all duration-300 hover:shadow-2xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                  <Icon className="h-7 w-7 text-blue-600" />
                </div>

                <h3 className="mb-5 text-xl font-bold text-slate-900">
                  {section.title}
                </h3>

                <ul className="space-y-3">
                  {section.content.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-7 text-slate-600"
                    >
                      <span className="mt-2 h-2 w-2 rounded-full bg-blue-500"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-12 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/20 p-4">
              <Mail size={30} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">Contact Us</h2>

              <p className="mt-2 text-blue-100">
                Have questions regarding this Privacy Policy?
              </p>

              <div className="mt-5 space-y-2">
                <p>
                  <span className="font-semibold">Developer:</span> Wise Player
                  Team
                </p>

                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  admin@wise-player.com
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-10 pb-10 text-center text-sm text-slate-500">
          © 2026 Wise Player. All rights reserved.
        </div>
      </div>
    </div>
  );
}