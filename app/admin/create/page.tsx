"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie"; 

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CreatePostPage() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    slug: "",
    image: null as File | null,
    contentImages: [] as File[],
    keywords: "", // ✅ added keywords
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (name === "contentImages") {
      setForm({ ...form, contentImages: files ? Array.from(files) : [] });
    } else {
      setForm({ ...form, [name]: files ? files[0] : value });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("category", form.category);
    formData.append("slug", form.slug);
    formData.append("keywords", JSON.stringify(form.keywords.split(",").map(k => k.trim()))); // ✅ append keywords
    if (form.image) formData.append("image", form.image);
    form.contentImages.forEach((file) => formData.append("contentImages", file));

    try {
      const token = Cookies.get("token");

      if (!token) {
        setMessage("❌ Unauthorized. Please log in first.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create post");

      setForm({ title: "", content: "", category: "", slug: "", image: null, contentImages: [], keywords: "" });
      setMessage("🎉 Post Created Successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white p-4 sm:p-10">
      <motion.h1
        className="text-3xl sm:text-5xl font-extrabold text-center bg-gradient-to-r from-pink-400 to-purple-300 bg-clip-text text-transparent mb-8 sm:mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Create New Post 📝
      </motion.h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-md sm:max-w-2xl mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-2xl border border-purple-700/40"
      >
        <input
          type="text"
          name="title"
          placeholder="Post Title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 mb-4 rounded-xl bg-white/90 text-black focus:outline-none text-sm sm:text-base"
          required
        />
        <input
          type="text"
          name="slug"
          placeholder="Post slug"
          value={form.slug}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 mb-4 rounded-xl bg-white/90 text-black focus:outline-none text-sm sm:text-base"
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Post Category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 mb-4 rounded-xl bg-white/90 text-black focus:outline-none text-sm sm:text-base"
          required
        />
        <textarea
          name="content"
          placeholder="Post Content"
          value={form.content}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 mb-4 rounded-xl bg-white/90 text-black h-32 sm:h-40 resize-none focus:outline-none text-sm sm:text-base"
          required
        />

        {/* Featured Image */}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full mb-4 sm:mb-6 text-sm sm:text-base text-gray-300"
        />

        {/* Content Images */}
        <label className="block mb-2 text-sm sm:text-base">Upload Content Images</label>
        <input
          type="file"
          name="contentImages"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="w-full mb-4 sm:mb-6 text-sm sm:text-base text-gray-300"
        />

        {/* Keywords */}
        <input
          type="text"
          name="keywords"
          placeholder="Keywords (comma separated)"
          value={form.keywords}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 mb-4 rounded-xl bg-white/90 text-black focus:outline-none text-sm sm:text-base"
        />

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-purple-600 to-pink-500 w-full py-3 rounded-xl font-semibold text-lg hover:opacity-80 transition"
        >
          {loading ? "Creating..." : "Create Post"}
        </motion.button>
      </form>

      <AnimatePresence>
        {message && (
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-2 sm:right-10 px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg text-sm sm:text-base ${
              message.startsWith("🎉") ? "bg-green-700/70" : "bg-red-700/70"
            }`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
