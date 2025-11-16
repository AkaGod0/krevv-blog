"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff8f2] via-[#ffeedd] to-[#fffaf6] text-[#3e2a1a] overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-24 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4"
        >
          About <span className="text-yellow-600">Us</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-3xl text-lg text-gray-600 leading-relaxed"
        >
          Krevv is built for one mission — to help freelancers and remote workers succeed in a world that’s moving faster than ever. Whether you're just getting started or already building your digital career, Krevv gives you the tools, guidance, and insights you need to work smarter, earn better, and thrive from anywhere.
          <br /><br />
          We understand that modern work isn’t tied to an office. It’s global, flexible, and constantly evolving. That’s why Krevv was created: to give digital workers a trusted space where they can learn, explore opportunities, and stay ahead in the remote work economy.
        </motion.p>
      </section>

      {/* What We Do Section */}
      <section className="max-w-5xl mx-auto py-24 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
          What We Do
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          At Krevv, we break down the complexities of freelancing and remote work into clear, actionable steps. Our content is crafted to help you:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li>Discover legitimate remote job opportunities</li>
          <li>Learn essential freelance skills and tools</li>
          <li>Build a strong, competitive online presence</li>
          <li>Manage clients, pricing, and productivity</li>
          <li>Grow confidently in your digital career</li>
        </ul>
        <p className="text-gray-700 mb-6">
          Whether you’re a writer, designer, developer, marketer, virtual assistant, or anything in between — Krevv is your partner on the journey.
        </p>
      </section>

      {/* Why Krevv Exists */}
      <section className="bg-[#fff3e4] py-24 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
          Why Krevv Exists
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Freelancing can feel overwhelming. Remote work can feel confusing. Information is everywhere, but reliable guidance is rare.
        </p>
        <p className="text-gray-700 mb-4">
          Krevv aims to bridge that gap by offering:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li><strong>Simple, honest explanations</strong></li>
          <li><strong>Modern, tech-driven insights</strong></li>
          <li><strong>Content built for real-world results</strong></li>
          <li><strong>Support for both beginners and experienced freelancers</strong></li>
        </ul>
        <p className="text-gray-700">
          We believe work should be flexible, meaningful, and accessible — and every digital worker deserves the chance to succeed.
        </p>
      </section>

      {/* Our Vision */}
      <section className="max-w-5xl mx-auto py-24 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
          Our Vision
        </h2>
        <p className="text-gray-700 leading-relaxed">
          To become the leading resource for digital, freelance, and remote professionals worldwide — empowering millions of people to build careers they love, without borders or limits.
        </p>
      </section>

      {/* Join the Krevv Community */}
      <section className="bg-[#fff3e4] py-24 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
          Join the Krevv Community
        </h2>
        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed mb-6">
          Krevv isn’t just a website. It’s a growing community of people embracing the future of work. If you’re ready to grow your skills, expand your opportunities, and build a career that fits your life, you’re in the right place.
        </p>
        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
          Let’s build the future of work — together.
        </p>
        <Link
          href="/"
          className="inline-block bg-yellow-700 text-white px-6 py-3 rounded-full mt-5 hover:bg-yellow-800 transition-all duration-300 shadow-lg hover:shadow-2xl"
        >
          Back to Home
        </Link>
      </section>
    </main>
  );
}
