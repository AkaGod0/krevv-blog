"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../app/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  Briefcase,
  FileText,
  Home,
  ChevronDown,
  Phone,
  Info,
} from "lucide-react";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Helper function to safely get initials
  const getInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  // Redirect to login if not authenticated (only for protected pages)
  // Comment this out if you want navbar to show on all pages
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push('/login');
  //   }
  // }, [user, loading, router]);

  // Don't render until auth state is loaded
  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-amber-500 rounded-lg p-2">
                <Briefcase className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-gray-800">Krevv</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-amber-500 rounded-lg p-2">
              <Briefcase className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-800">Krevv</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2"
            >
              <Home size={18} />
              Home
            </Link>
            <Link
              href="/jobs"
              className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2"
            >
              <Briefcase size={18} />
              Jobs
            </Link>
            <Link
              href="/post"
              className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2"
            >
              <FileText size={18} />
              Posts
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2"
            >
              <Info size={18} />
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2"
            >
              <Phone size={18} />
              Contact
            </Link>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg transition"
                >
                  <div className="bg-amber-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials()}
                  </div>
                  <span className="font-medium text-gray-800">
                    {user.firstName} {user.lastName} {/* ✅ Only shows actual name, no fallback */}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-800">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-amber-50 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} />
                        My Profile
                      </Link>
                      <Link
                        href="../jobs/my-jobs"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-amber-50 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Briefcase size={16} />
                        My Jobs
                      </Link>
                      <Link
                        href="/applications"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-amber-50 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FileText size={16} />
                        My Applications
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-6 py-2 text-amber-600 hover:text-amber-700 font-semibold transition">
                    Log In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow transition">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3 bg-white">
              <Link
                href="/"
                className="flex items-center gap-2 py-2 text-gray-700 hover:text-amber-600 font-medium transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={18} />
                Home
              </Link>
              <Link
                href="/jobs"
                className="flex items-center gap-2 py-2 text-gray-700 hover:text-amber-600 font-medium transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Briefcase size={18} />
                Jobs
              </Link>
              <Link
                href="/post"
                className="flex items-center gap-2 py-2 text-gray-700 hover:text-amber-600 font-medium transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText size={18} />
                Posts
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 py-2 text-gray-700 hover:text-amber-600 font-medium transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Info size={18} />
                About
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 py-2 text-gray-700 hover:text-amber-600 font-medium transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone size={18} />
                Contact
              </Link>

              {user ? (
                <>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-amber-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-semibold">
                        {getInitials()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {user.firstName} {user.lastName} {/* ✅ Only shows actual name */}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 py-2 text-gray-700 hover:text-amber-600 font-medium transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={18} />
                      My Profile
                    </Link>
                    <Link
                      href="../jobs/my-jobs"
                      className="flex items-center gap-2 py-2 text-gray-700 hover:text-amber-600 font-medium transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Briefcase size={18} />
                      My Jobs
                    </Link>
                    <Link
                      href="/applications"
                      className="flex items-center gap-2 py-2 text-gray-700 hover:text-amber-600 font-medium transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FileText size={18} />
                      My Applications
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-left py-2 text-red-600 font-medium transition"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-6 py-2 text-amber-600 border-2 border-amber-500 font-semibold rounded-lg transition">
                      Log In
                    </button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow transition">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}