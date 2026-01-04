import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.krevv.com";

  // Fetch active jobs (NO CACHE)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/jobs?status=active&limit=0`,
    { cache: "no-store" }
  );

  const data = await res.json();
  const jobs = Array.isArray(data.data) ? data.data : [];

  const urls = jobs
    .map(
      (job: any) => `
  <url>
    <loc>${baseUrl}/jobs/${job.slug}</loc>
    <lastmod>${new Date(job.updatedAt || job.createdAt).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
