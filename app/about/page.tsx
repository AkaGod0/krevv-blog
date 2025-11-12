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
          className="max-w-3xl text-lg text-gray-600"
        >
          Welcome to our creative space — where technology meets artistry.
          We build stories, code, and dreams that dance together in rhythm.
        </motion.p>

        {/* Floating Animation */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="absolute -bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <svg
            className="w-10 h-10 text-yellow-700 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* About Content */}
      <section className="max-w-5xl mx-auto py-24 px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.img
            src="https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=80"
            alt="Team working"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-700 ease-in-out"
          />

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-5"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-800">
              We’re dreamers, thinkers, and builders
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet risus vel
              velit porttitor facilisis. Sed nec lectus sed arcu vehicula ullamcorper. Maecenas 
              vitae velit eu eros vestibulum iaculis. 
            </p>
            <p className="text-gray-700 leading-relaxed">
              Aenean id eros non ligula pharetra pretium. Vestibulum in elit vitae sem blandit 
              accumsan non eu justo. Fusce luctus sapien in leo pretium, ac imperdiet risus varius.
            </p>
            <Link
              href="/"
              className="inline-block bg-yellow-700 text-white px-6 py-3 rounded-full mt-5 hover:bg-yellow-800 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              Back to Home
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-[#fff3e4] py-24 mt-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold mb-10 text-[#3e2a1a]"
          >
            Meet Our <span className="text-yellow-700">Passionate Team</span>
          </motion.h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
            {["Ava", "Leo", "Maya"].map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition-transform duration-500"
              >
                <img
                  src={`https://i.pravatar.cc/200?img=${i + 5}`}
                  alt={name}
                  className="w-28 h-28 rounded-full mx-auto border-4 border-yellow-600 mb-4"
                />
                <h3 className="text-xl font-semibold text-[#3e2a1a]">{name}</h3>
                <p className="text-gray-500">Creative Developer</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="relative text-center py-20 px-6">
        <motion.blockquote
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-2xl italic text-gray-700 font-medium leading-relaxed"
        >
          "Creativity is intelligence having fun — and we’re having the time of our lives."
        </motion.blockquote>
      </section>
    </main>
  );
}
