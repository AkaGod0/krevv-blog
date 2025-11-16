"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";



const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminHomePage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/posts`);
        const data = await res.json();

        const totalLikes = data.reduce((acc: number, post: any) => acc + (post.likes?.length || 0), 0);
        const totalComments = data.reduce((acc: number, post: any) => acc + (post.comments?.length || 0), 0);

        setStats({
          totalPosts: data.length,
          totalLikes,
          totalComments,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <motion.h1
        className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-pink-500 text-transparent bg-clip-text"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Welcome to the Admin Panel ✨
      </motion.h1>

      <motion.p
        className="text-gray-300 text-lg max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Manage your posts, track comments, and monitor likes — all in one place.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-6 mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="bg-white/10 p-6 rounded-xl shadow-lg w-56 sm:w-64">
          <h2 className="text-2xl font-semibold mb-2">Total Posts</h2>
          <p className="text-4xl font-bold">{stats.totalPosts}</p>
        </div>
        <div className="bg-white/10 p-6 rounded-xl shadow-lg w-56 sm:w-64">
          <h2 className="text-2xl font-semibold mb-2">Total Likes</h2>
          <p className="text-4xl font-bold">{stats.totalLikes}</p>
        </div>
        <div className="bg-white/10 p-6 rounded-xl shadow-lg w-56 sm:w-64">
          <h2 className="text-2xl font-semibold mb-2">Total Comments</h2>
          <p className="text-4xl font-bold">{stats.totalComments}</p>
        </div>
      </motion.div>
    </div>
  );
}
