import { MetadataRoute } from "next";
import { getAllTours } from "@/lib/queries/tours";
import { getAllDestinations } from "@/lib/queries/destinations";
import { getAllExperiences } from "@/lib/queries/experiences";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://manjutourslanka.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date("2026-03-01T00:00:00Z"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/tours`,
      lastModified: new Date("2026-03-01T00:00:00Z"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/destinations`,
      lastModified: new Date("2026-03-01T00:00:00Z"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/experiences`,
      lastModified: new Date("2026-03-01T00:00:00Z"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/custom-tour`,
      lastModified: new Date("2026-03-01T00:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date("2026-03-01T00:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date("2026-03-01T00:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/stories`,
      lastModified: new Date("2026-03-01T00:00:00Z"),
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  const [tours, destinations, experiences] = await Promise.all([
    getAllTours(),
    getAllDestinations(),
    getAllExperiences(),
  ]);

  const { islandStories } = await import("@/lib/data/stories-dataset");

  const storyRoutes: MetadataRoute.Sitemap = islandStories.map((s) => ({
    url: `${siteUrl}/stories/${s.slug}`,
    lastModified: new Date("2026-03-01T00:00:00Z"),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const tourRoutes: MetadataRoute.Sitemap = tours.map((t: { slug: string }) => ({
    url: `${siteUrl}/tours/${t.slug}`,
    lastModified: new Date("2026-03-01T00:00:00Z"),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const destinationRoutes: MetadataRoute.Sitemap = destinations.map((d: { slug: string }) => ({
    url: `${siteUrl}/destinations/${d.slug}`,
    lastModified: new Date("2026-03-01T00:00:00Z"),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const experienceRoutes: MetadataRoute.Sitemap = experiences.map((e: { slug: string }) => ({
    url: `${siteUrl}/experiences/${e.slug}`,
    lastModified: new Date("2026-03-01T00:00:00Z"),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...staticRoutes, ...storyRoutes, ...tourRoutes, ...destinationRoutes, ...experienceRoutes];
}
