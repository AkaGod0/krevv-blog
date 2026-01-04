import { MetadataRoute } from "next";

export const revalidate = 3600; // re-generate every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.krevv.com";

  let jobs: any[] = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/jobs?status=active&limit=0`,
      { next: { revalidate: 3600 } }
    );

    const data = await res.json();
    jobs = Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch jobs for sitemap", error);
  }

  return jobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: new Date(job.updatedAt || job.createdAt),
    changeFrequency: "daily",
    priority: 0.8,
  }));
}
