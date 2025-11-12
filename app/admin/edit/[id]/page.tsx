"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie"; 

const API = process.env.NEXT_PUBLIC_API_URL;

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    content: "",
    image: "",
    category: "",
    slug: "",
    contentImages: [] as string[], // ✅ added
  });
  const [file, setFile] = useState<File | null>(null);
  const [contentFiles, setContentFiles] = useState<File[]>([]); // ✅ new for content images
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API}/posts/${id}`);
        const data = await res.json();
        setForm({
          title: data.title || "",
          content: data.content || "",
          image: data.image || "",
          category: data.category || "",
          slug: data.slug || "",
          contentImages: data.contentImages || [], // ✅ load existing content images
        });
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("category", form.category);
    formData.append("slug", form.slug);
    if (file) formData.append("image", file);
    contentFiles.forEach((file) => formData.append("contentImages", file)); // ✅ append content images

    try {
      const token = Cookies.get("token");

      const res = await fetch(`${API}/posts/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update post");

      setMessage("✅ Post updated successfully!");
      setTimeout(() => router.push("/admin/manage"), 2000);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <main className="flex justify-center items-center h-screen bg-gradient-to-br from-black via-blue-900 to-purple-900 text-white text-xl sm:text-2xl">
        Loading Post...
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white p-4 sm:p-10">
      <motion.h1
        className="text-3xl sm:text-5xl font-extrabold text-center bg-gradient-to-r from-pink-400 to-purple-300 bg-clip-text text-transparent mb-6 sm:mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Edit Post ✏️
      </motion.h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-700/40 flex flex-col gap-4"
      >
        <input
          type="text"
          name="title"
          placeholder="Post Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-3 sm:p-4 rounded-xl bg-white/90 text-black focus:outline-none text-sm sm:text-base"
          required
        />
        <input
          type="text"
          name="slug"
          placeholder="Post Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full p-3 sm:p-4 rounded-xl bg-white/90 text-black focus:outline-none text-sm sm:text-base"
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Post Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full p-3 sm:p-4 rounded-xl bg-white/90 text-black focus:outline-none text-sm sm:text-base"
          required
        />
        <textarea
          name="content"
          placeholder="Post Content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full p-3 sm:p-4 rounded-xl bg-white/90 text-black h-40 sm:h-48 resize-none focus:outline-none text-sm sm:text-base"
          required
        />

        {/* Featured Image */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
          {form.image && (
            <img
              src={form.image}
              alt="Current"
              className="w-full sm:w-1/3 h-40 sm:h-56 object-cover rounded-xl border border-purple-700/40"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full sm:w-2/3 text-sm sm:text-base text-gray-300"
          />
        </div>

        {/* Content Images */}
        {form.contentImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {form.contentImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Content image ${i + 1}`}
                className="w-full h-24 sm:h-32 object-cover rounded-lg border border-purple-700/40"
              />
            ))}
          </div>
        )}
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setContentFiles(e.target.files ? Array.from(e.target.files) : [])}
            className="w-full text-sm sm:text-base text-gray-300"
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-purple-600 to-pink-500 w-full py-3 rounded-xl font-semibold text-lg hover:opacity-80 transition"
        >
          {loading ? "Saving..." : "Save Changes"}
        </motion.button>
      </form>

      <AnimatePresence>
        {message && (
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-2 sm:right-10 bg-black/70 px-4 sm:px-6 py-3 rounded-xl shadow-lg text-sm sm:text-base"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
