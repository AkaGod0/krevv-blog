import { MetadataRoute } from "next";

export const revalidate = 3600; // Re-generate sitemap every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.krevv.com";

 let jobs: any[] = [];
  
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/jobs?status=active&limit=0`, {
      cache: "no-store"
    });
     
      const data = await res.json();
    jobs = Array.isArray(data.data) ? data.data : [];
  } catch (err) {
    console.error("❌ Failed to fetch jobs for sitemap:", err);
  }
  
 // --------------------
  // Dynamic jobs
  // --------------------
  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: new Date(job.updatedAt || job.createdAt),
    changeFrequency: "daily",
    priority: 0.8,
  }));
  
   return [ ...jobRoutes];
}

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
