"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

function linkify(text: string) {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank" class="text-blue-400 underline">${url}</a>`
  );
}

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState<any[]>([]);



  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/slug/${slug}`);
        const data = await res.json();
        const postData = data.post || data;


        setPost({ ...postData, views: (postData.views || 0) + 1 });
        setLikesCount(postData.likes?.length || 0);
        setComments(postData.comments || []);

        // Related posts
        const relatedRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/${postData._id}/related`
        );
        const relatedData = await relatedRes.json();
        setRelatedPosts(relatedData.related || relatedData);

        // Trending posts: fetch all posts and sort by views
        const allPostsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
        const allPostsData = await allPostsRes.json();
        const allPostsList = allPostsData.posts || allPostsData;

        const trendingList = allPostsList
          .filter((p: any) => p._id !== postData._id)
          .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);
        setTrendingPosts(trendingList);

        // Check like status
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        const likedRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/likes/${postData._id}/check?ip=${ipData.ip}`
        );
        const likedData = await likedRes.json();
        setLiked(likedData.liked);
      } catch (err) {
        console.error("Failed to fetch post details:", err);
      }
    }
    fetchPost();
  }, [slug]);

  const handleLike = async () => {
    if (!post?._id) return;
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipRes.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/likes/${post._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ipAddress: ipData.ip }),
    });
    const data = await res.json();
    setLiked(data.liked);
    setLikesCount(data.likesCount);
  };

  const handleComment = async (e: any) => {
    e.preventDefault();
    if (!post?._id) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${post._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setName("");
      setMessage("");
      setToast("Comment added successfully!");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const handleShare = () => {
  if (!post?.slug) return;
  const postUrl = `${window.location.origin}/post/${post.slug}`;
  navigator.clipboard.writeText(postUrl)
    .then(() => {
      setToast("✅ Link copied!");
      setTimeout(() => setToast(""), 2000);
    })
    .catch(() => {
      setToast("❌ Failed to copy link");
      setTimeout(() => setToast(""), 2000);
    });
};

  if (!post) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-6xl flex flex-col lg:flex-row gap-8">
      {/* Main content */}
      <div className="flex-1">
        {toast && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
            {toast}
          </div>
        )}

        <motion.img
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          src={post.image}
          alt={post.title}
          className="w-full rounded-lg shadow-md mb-6"
        />

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold mb-2"
        >
          {post.title}
        </motion.h1>

        <p className="text-gray-500 mb-4">👁️‍🗨️ {post.views || 0} views</p>

        {/* ✅ SEO-friendly Keywords */}
        {Array.isArray(post.keywords) && post.keywords.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {post.keywords.map((kw: string, idx: number) => (
             <a
            key={idx}
            className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-amber-200 transition"
          >
            #{kw}
          </a>

            ))}
          </div>
        )}

        {/* ✅ Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "image": post.image,
              "author": {
                "@type": "Person",
                "name": post.author?.name || "Unknown",
              },
              "datePublished": post.createdAt,
              "dateModified": post.updatedAt || post.createdAt,
              "keywords": post.keywords || [],
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/post/${post.slug}`,
              },
              "description": post.description || post.content.slice(0, 150),
            }),
          }}
        />

        <p
          className="text-gray-700 leading-relaxed mb-8 whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: linkify(post.content) }}
        />
        {/* Content images */}
        {Array.isArray(post.contentImages) && post.contentImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {post.contentImages.map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt={`content-image-${idx}`}
                className="rounded-lg shadow-md w-full object-cover"
              />
            ))}
          </div>
        )}

        <div className="flex items-center space-x-3 mb-8">
          <button
            onClick={handleLike}
            className={`px-4 py-2 rounded-md font-semibold transition-transform transform hover:scale-105 ${
              liked ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            {liked ? "❤️ Liked" : "🤍 Like"}
          </button>
          <span className="text-gray-600 font-medium">{likesCount} Likes</span>

          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-md bg-green-500 text-white font-semibold hover:bg-green-600 transition-all"
          >
            📤 Share
          </button>
           {/* ✅ Toast message appears here, not inside the button */}
  {toast && (
    <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
      {toast}
    </div>
  )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Comments ({comments.length})</h2>
          <form onSubmit={handleComment} className="mb-6 space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md"
              required
            />
            <textarea
              placeholder="Write a comment..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-all"
            >
              Post Comment
            </button>
          </form>

          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 border p-3 rounded-md"
                >
                  <p className="font-semibold text-gray-800">{comment.name}</p>
                  <p className="text-gray-600">{comment.message}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {Array.isArray(relatedPosts) && relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Related Posts</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {relatedPosts.map((related, index) => (
                <motion.a
                  key={index}
                  href={`/post/${related.slug}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform overflow-hidden"
                >
                  <img
                    src={related.image}
                    alt={related.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                      👁️‍🗨️ {related.views || 0} views
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Trending */}
{/* Sidebar Trending */}
<aside className="w-full lg:w-80 flex-shrink-0 mt-8 lg:mt-0">
  <h3 className="text-xl font-bold mb-4">Most Trending</h3>

  {/* 🔍 Interactive Search Bar */}
  <div className="mb-6 relative">
    <input
      type="text"
      placeholder="Search posts..."
      value={searchQuery}
      onChange={async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query.trim()) {
          setSearchResults([]); // clear search when empty
          return;
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
          const data = await res.json();
          const allPosts = data.posts || data;

          // Filter by title or keywords
          const filtered = allPosts.filter((p: any) => {
            const lower = query.toLowerCase();
            return (
              p.title?.toLowerCase().includes(lower) ||
              p.keywords?.some((k: string) => k.toLowerCase().includes(lower))
            );
          });

          setSearchResults(filtered.slice(0, 6)); // preview top 6
        } catch (err) {
          console.error("Search failed:", err);
        }
      }}
      className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    {/* 🔽 Live Search Dropdown */}
    {searchResults.length > 0 && (
      <div className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-md mt-1 w-full max-h-64 overflow-y-auto">
        {searchResults.map((result, idx) => (
          <a
            key={idx}
            href={`/post/${result.slug}`}
            className="block px-3 py-2 hover:bg-amber-50 border-b last:border-none transition"
          >
            <p className="text-gray-800 font-medium line-clamp-1">{result.title}</p>
            <p className="text-sm text-gray-500 line-clamp-1">
              {Array.isArray(result.keywords) ? result.keywords.join(", ") : ""}
            </p>
          </a>
        ))}
      </div>
    )}
  </div>

  <div className="space-y-4">
    {trendingPosts.length > 0 ? (
      trendingPosts.map((t: any, idx: number) => (
        <motion.a
          key={idx}
          href={`/post/${t.slug}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="block bg-white p-3 rounded-md shadow hover:shadow-md hover:bg-amber-50 transition-all"
        >
          <h4 className="font-semibold text-gray-800 line-clamp-2">{t.title}</h4>
          <p className="text-sm text-gray-500">👁️‍🗨️ {t.views || 0} views</p>
        </motion.a>
      ))
    ) : (
      <p className="text-gray-500">No trending posts found.</p>
    )}
  </div>
</aside>


    </div>
  );
}
