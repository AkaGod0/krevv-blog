"use client";


import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get("token");
      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        if (!window.location.pathname.includes("/admin/login")) {
          router.replace("/admin/login");
        }
      }
    };

    checkAuth();
    const timeout = setTimeout(checkAuth, 200);
    return () => clearTimeout(timeout);
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("token");
    setIsLoggedIn(false);
    router.replace("/admin/login");
  };

  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {isLoggedIn && (
        <nav className="bg-gray-950 shadow-md border-b border-gray-800 sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-400 to-blue-400 text-transparent bg-clip-text">
              Admin Dashboard
            </h1>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6 text-lg">
              <Link href="/admin" className="hover:text-pink-400 transition">Home</Link>
              <Link href="/admin/create" className="hover:text-blue-400 transition">Create Post</Link>
              <Link href="/admin/manage" className="hover:text-green-400 transition">Manage Posts</Link>
              <Link href="/admin/maintenance" className="hover:text-green-400 transition">maintenace</Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-300"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Dropdown */}
          {isOpen && (
            <div className="md:hidden bg-gray-950 border-t border-gray-800">
              <div className="flex flex-col items-start px-6 py-4 space-y-3 text-gray-200 text-lg">
                <Link href="/admin" className="w-full hover:text-pink-400" onClick={() => setIsOpen(false)}>Home</Link>
                <Link href="/admin/create" className="w-full hover:text-blue-400" onClick={() => setIsOpen(false)}>Create Post</Link>
                <Link href="/admin/manage" className="w-full hover:text-green-400" onClick={() => setIsOpen(false)}>Manage Posts</Link>
                 <Link href="/admin/maintenance" className="w-full hover:text-green-400" onClick={() => setIsOpen(false)}>maintenance</Link>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg w-full justify-center"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          )}
        </nav>
      )}

      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
