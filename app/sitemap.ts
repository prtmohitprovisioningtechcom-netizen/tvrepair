import type { MetadataRoute } from "next";
import { listPublishedSlugs } from "@/server/repositories/content.repository";
import { siteUrl } from "@/lib/utils/cn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/about",
    "/services",
    "/tv-repair",
    "/blog",
    "/contact",
    "/book-service",
    "/privacy-policy",
    "/terms-and-conditions",
  ];

  try {
    const { pages, services, blogs } = await listPublishedSlugs();
    const entries: MetadataRoute.Sitemap = [
      ...staticPaths.map((path) => ({
        url: siteUrl(path || "/"),
        changeFrequency: "weekly" as const,
        priority: path === "" ? 1 : 0.8,
      })),
      ...pages
        .filter((p) =>
          ![
            "home",
            "about",
            "services",
            "tv-repair",
            "blog",
            "contact",
            "book-service",
            "privacy-policy",
            "terms-and-conditions",
          ].includes(p.slug),
        )
        .map((p) => ({
          url: siteUrl(`/${p.slug}`),
          lastModified: p.updated_at,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
      ...services.map((s) => ({
        url: siteUrl(`/tv-repair/${s.slug}`),
        lastModified: s.updated_at,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...blogs.map((b) => ({
        url: siteUrl(`/blog/${b.slug}`),
        lastModified: b.updated_at,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
    return entries;
  } catch {
    return staticPaths.map((path) => ({ url: siteUrl(path || "/") }));
  }
}
