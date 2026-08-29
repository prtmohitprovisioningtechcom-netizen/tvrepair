import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPageBySlug } from "@/server/repositories/pages.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { getSiteContext } from "@/server/services/site";
import { PageRenderer } from "@/components/website/PageRenderer";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 60;

const RESERVED = new Set([
  "about",
  "services",
  "tv-repair",
  "blog",
  "contact",
  "book-service",
  "privacy-policy",
  "terms-and-conditions",
  "gallery",
  "admin",
  "api",
]);

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED.has(slug)) return {};
  const [page, site] = await Promise.all([getPublishedPageBySlug(slug), getSiteContext()]);
  if (!page) return { title: "Page" };
  const seo = await getSeo(page.is_homepage ? "homepage" : "page", page.id);
  return buildMetadata({
    seo,
    fallbackTitle: page.title,
    fallbackDescription: page.excerpt || "",
    path: `/${page.slug}`,
    settings: site.settings,
  });
}

export default async function DynamicPage({ params }: Params) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();
  const [page, site] = await Promise.all([getPublishedPageBySlug(slug), getSiteContext()]);
  if (!page || page.is_homepage) notFound();
  return (
    <>
      <Breadcrumb items={[{ name: "Home", href: "/" }, { name: page.title, href: `/${page.slug}` }]} />
      <PageRenderer sections={page.sections} extras={site} />
    </>
  );
}
