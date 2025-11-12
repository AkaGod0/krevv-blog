"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-800 text-white p-6 sm:p-12">
      <motion.div
        className="max-w-4xl mx-auto bg-black/50 backdrop-blur-xl rounded-3xl p-6 sm:p-12 shadow-2xl border border-purple-600/40"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
          Terms and Conditions 📜
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
          Welcome to our website. By accessing or using our site, you agree to
          comply with these Terms and Conditions. Please read them carefully.
        </p>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
          Use of our website is at your own risk. We are not responsible for any
          damages or losses incurred from accessing the site. All content is
          provided for informational purposes only.
        </p>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
          Unauthorized use of this website may give rise to a claim for damages
          or be a criminal offense.
        </p>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          By using our website, you acknowledge that you have read, understood,
          and agree to these terms.
        </p>
      </motion.div>
    </main>
  );
}
