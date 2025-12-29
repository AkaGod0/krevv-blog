"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash, Search, Eye, Heart, MessageCircle, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ManagePostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Search states
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);

  const router = useRouter();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("admin_token") || Cookies.get("token");
      const res = await fetch(`${API}/posts?page=${page}&limit=${limit}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      setPosts(Array.isArray(json.data) ? json.data : []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const handleDeleteClick = (id: string) => {
    setPostToDelete(id);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      const token = Cookies.get("admin_token") || Cookies.get("token");
      await fetch(`${API}/posts/${postToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((p) => p._id !== postToDelete));
      setMessage("Post deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setModalOpen(false);
      setPostToDelete(null);
    }
  };

  // Search posts
  useEffect(() => {
    if (!searchText.trim()) {
      fetchPosts();
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API}/posts/search?q=${encodeURIComponent(searchText.trim())}&all=true`
        );
        const json = await res.json();

        let results: any[] = [];
        if (Array.isArray(json)) results = json;
        else if (json.posts) results = json.posts;
        else if (json.results) results = json.results;
        else if (json.data) results = json.data;

        const exactMatches = results.filter((p) =>
          p.title.toLowerCase().includes(searchText.toLowerCase())
        );

        setPosts(exactMatches);
        setSuggestions(exactMatches);
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchText]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-2">
          <Edit size={32} />
          <h1 className="text-3xl font-bold">Manage Posts</h1>
        </div>
        <p className="text-blue-100">
          Edit, delete, and manage all your blog posts
        </p>
      </motion.div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search posts by title..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800"
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute inset-x-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
              {suggestions.map((post) => (
                <div
                  key={post._id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setPosts([post]);
                    setSearchText(post.title);
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition cursor-pointer"
                >
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{post.title}</p>
                    <p className="text-xs text-gray-500">
                      {post.views || 0} views • {post.category || "General"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="text-green-600" size={20} />
            <p className="text-green-700 font-medium">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
          <p className="text-xl font-semibold text-gray-600">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 text-lg">No posts found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden"
              >
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                      {post.category || "General"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      <span>{post.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={14} />
                      <span>{post.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      <span>{post.comments?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`/admin/edit/${post._id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                      <Edit size={16} />
                      Edit
                    </a>
                    <button
                      onClick={() => handleDeleteClick(post._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                      <Trash size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => {
                  setPage(page - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                  page === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              
              <span className="text-lg font-semibold text-gray-700">
                Page {page} of {totalPages}
              </span>
              
              <button
                disabled={page === totalPages}
                onClick={() => {
                  setPage(page + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                  page === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Delete Post</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}