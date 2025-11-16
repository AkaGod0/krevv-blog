import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// MongoDB connection URI
const uri = process.env.MONGODB_URI; // Add this to your .env file
const dbName = process.env.MONGODB_DB; // Add your DB name

async function getBlogPosts() {
  if (!uri) throw new Error("MONGODB_URI not defined in environment");

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName);
  const posts = await db.collection("posts").find({}, { projection: { slug: 1 } }).toArray();

  await client.close();
  return posts;
}

export async function GET() {
  const baseUrl = "https://cautious-eureka-9gp9qvgv756fpjgr-3000.app.github.dev"; // <-- change to your domain
  const staticPages = ["", "about", "contact", "post"];

  const blogPosts = await getBlogPosts();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map((page) => {
      return `
  <url>
    <loc>${baseUrl}/${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("")}

  ${blogPosts
  .map((post) => {
    const safeSlug = encodeURIComponent(post.slug);
    return `
  <url>
    <loc>${baseUrl}/blog/${safeSlug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  })
  .join("")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
