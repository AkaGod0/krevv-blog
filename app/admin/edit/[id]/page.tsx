"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import type { Editor } from "@tiptap/react";
import React from "react";
import {
  FileText,
  Image as ImageIcon,
  Tag,
  Save,
  MessageCircle,
  Trash2,
  Reply,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Calendar,
  Shield,
} from "lucide-react";

const NovelEditor = dynamic(() => import("@/components/NovelEditor"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center">
      <Loader2 className="animate-spin text-blue-500 w-8 h-8 mx-auto" />
      <p className="mt-2 text-gray-400">Loading editor...</p>
    </div>
  ),
});

const API = process.env.NEXT_PUBLIC_API_URL;

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const editorRef = useRef<Editor | null>(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    image: "",
    category: "",
    slug: "",
    contentImages: [] as string[],
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [fetching, setFetching] = useState(true);
  const [comments, setComments] = useState<any[]>([]);

  // Modals
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; commentId: string | null }>({
    open: false,
    commentId: null,
  });
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = Cookies.get("admin_token") || Cookies.get("token");
        const res = await fetch(`${API}/posts/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setForm({
          title: data.title || "",
          content: data.content || "",
          image: data.image || "",
          category: data.category || "",
          slug: data.slug || "",
          contentImages: data.contentImages || [],
        });

        const commentsRes = await fetch(`${API}/comments/${id}`);
        const commentsData = await commentsRes.json();
        setComments(commentsData || []);
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Failed to load post" });
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", editorRef.current?.getHTML() || "");
    formData.append("category", form.category);
    formData.append("slug", form.slug);
    if (file) formData.append("image", file);

    try {
      const token = Cookies.get("admin_token") || Cookies.get("token");
      if (!token) throw new Error("Please login again");

      const res = await fetch(`${API}/posts/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");

      setMessage({ type: "success", text: "Post updated successfully!" });
      setTimeout(() => {
        router.push("/admin/manage");
      }, 2000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update post" });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteModal.commentId) return;

    const token = Cookies.get("admin_token") || Cookies.get("token");
    if (!token) {
      setMessage({ type: "error", text: "Please login again" });
      return;
    }

    const res = await fetch(`${API}/comments/${deleteModal.commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const removeComment = (comments: any[]): any[] => {
        return comments
          .filter((c) => c._id !== deleteModal.commentId)
          .map((c) => ({
            ...c,
            replies: c.replies ? removeComment(c.replies) : [],
          }));
      };
      setComments(removeComment);
      setMessage({ type: "success", text: "Comment deleted successfully" });
      setTimeout(() => setMessage(null), 3000);
    }

    setDeleteModal({ open: false, commentId: null });
  };

  const CommentItem = React.memo(
    ({
      comment,
      depth = 0,
      onReplySuccess,
    }: {
      comment: any;
      depth?: number;
      onReplySuccess?: () => void;
    }) => {
      const [isReplying, setIsReplying] = useState(false);
      const [replyText, setReplyText] = useState("");
      const textareaRef = useRef<HTMLTextAreaElement>(null);

      useEffect(() => {
        if (isReplying && textareaRef.current) {
          textareaRef.current.focus();
        }
      }, [isReplying]);

      const startReply = () => {
        setIsReplying(true);
        setReplyText("");
      };

      const cancelReply = () => {
        setIsReplying(false);
        setReplyText("");
      };

      const sendReply = async () => {
        if (!replyText.trim()) return;

        const token = Cookies.get("admin_token") || Cookies.get("token");
        if (!token) {
          setMessage({ type: "error", text: "Please login again" });
          return;
        }

        const res = await fetch(`${API}/comments/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: "Admin",
            message: replyText.trim(),
            parent: comment._id,
            isAdmin: true,
          }),
        });

        if (res.ok) {
          const newReply = await res.json();
          const addReply = (comments: any[]): any[] => {
            return comments.map((c) => {
              if (c._id === comment._id) {
                return {
                  ...c,
                  replies: [...(c.replies || []), { ...newReply, replies: [] }],
                };
              }
              if (c.replies?.length) {
                return { ...c, replies: addReply(c.replies) };
              }
              return c;
            });
          };
          setComments((prev) => addReply(prev));
          cancelReply();
          onReplySuccess?.();
        }
      };

      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${depth > 0 ? "ml-6 border-l-2 border-blue-500 pl-4" : ""}`}
        >
          <div className="bg-gray-50 rounded-lg p-4 mb-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold flex-shrink-0">
                {comment.name[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-gray-800">{comment.name}</span>
                  {comment.isAdmin && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded">
                      ADMIN
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.message}</p>

                <div className="flex items-center gap-3 mt-2">
                  {!isReplying && (
                    <button
                      onClick={startReply}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Reply size={14} />
                      Reply
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteModal({ open: true, commentId: comment._id })}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>

                <AnimatePresence>
                  {isReplying && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <textarea
                        ref={textareaRef}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your admin reply..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-800"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={sendReply}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm flex items-center gap-1"
                        >
                          <Send size={14} />
                          Send
                        </button>
                        <button
                          onClick={cancelReply}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {comment.replies?.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply: any) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  depth={depth + 1}
                  onReplySuccess={onReplySuccess}
                />
              ))}
            </div>
          )}
        </motion.div>
      );
    }
  );
  CommentItem.displayName = "CommentItem";

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 w-12 h-12 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-2">
          <FileText size={32} />
          <h1 className="text-3xl font-bold">Edit Post</h1>
        </div>
        <p className="text-indigo-100">Update your blog post content and settings</p>
      </motion.div>

      {/* Success/Error Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="text-green-600" size={20} />
            ) : (
              <AlertCircle className="text-red-600" size={20} />
            )}
            <p
              className={
                message.type === "success" ? "text-green-700 font-medium" : "text-red-700 font-medium"
              }
            >
              {message.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Category */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={18} />
                    Post Title *
                  </div>
                </label>
                <input
                  type="text"
                  placeholder="Enter post title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Tag size={18} />
                    Category *
                  </div>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Technology, Lifestyle"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800"
                />
              </div>
            </div>

            {/* Editor */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Content</h3>
              </div>
              <NovelEditor
                content={form.content}
                onChange={(html) => setForm((p) => ({ ...p, content: html }))}
                onCreate={({ editor }) => (editorRef.current = editor)}
              />
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} />
                  Featured Image
                </div>
              </label>

              {form.image && (
                <div className="mb-4">
                  <img
                    src={form.image}
                    alt="Current featured"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                  <p className="text-sm text-gray-500 mt-2">Current image</p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">New image selected: {file.name}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Comments Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
              <div className="flex items-center gap-2 text-white">
                <MessageCircle size={24} />
                <h2 className="text-xl font-bold">
                  Comments ({comments.length})
                </h2>
              </div>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">No comments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      onReplySuccess={() => {
                        setSuccessModal(true);
                        setTimeout(() => setSuccessModal(false), 2000);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.open && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteModal({ open: false, commentId: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Delete Comment</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this comment and all its replies? This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ open: false, commentId: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteComment}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {successModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -20 }}
              className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Reply Sent!</h3>
              <p className="text-gray-600">Your admin reply has been posted successfully.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}