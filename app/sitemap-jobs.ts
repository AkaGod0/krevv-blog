import { MetadataRoute } from "next";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.krevv.com";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/jobs?status=active&limit=0`,
    { cache: "no-store" }
  );

  const data = await res.json();
  const jobs = data?.data ?? [];

  return jobs.map((job: any) => ({
    url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: new Date(job.updatedAt || job.createdAt),
    changeFrequency: "hourly",
    priority: 0.9,
  }));
}
