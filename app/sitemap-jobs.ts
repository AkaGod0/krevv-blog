import { MetadataRoute } from "next";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL!;

  let jobs: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `${NEXT_PUBLIC_API_URL}/jobs?status=active&page=${page}&limit=100`,
      { cache: "no-store" }
    );

    const data = await res.json();

    if (!data?.data || data.data.length === 0) {
      hasMore = false;
    } else {
      jobs.push(...data.data);
      page++;
    }
  }

  return jobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: new Date(job.updatedAt || job.createdAt),
    changeFrequency: "daily",
    priority: 0.8,
  }));
}
