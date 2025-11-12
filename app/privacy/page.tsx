"use client";

import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-800 via-black to-blue-900 text-white p-6 sm:p-12">
      <motion.div
        className="max-w-4xl mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-6 sm:p-12 shadow-2xl border border-purple-700/30"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-blue-400">
          Privacy Policy 🔒
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
          We respect your privacy and are committed to protecting your personal
          data. This policy explains how we collect, store, and use your
          information.
        </p>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
          Information collected may include your name, email, and browsing
          activity. We use this data to improve website functionality and user
          experience.
        </p>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
          We do not share your personal data with third parties without your
          consent, except as required by law. You may request deletion of your
          data at any time.
        </p>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          By using our website, you consent to this privacy policy and the terms
          described herein.
        </p>
      </motion.div>
    </main>
  );
}
