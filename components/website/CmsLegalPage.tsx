import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPageBySlug } from "@/server/repositories/pages.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { getSiteContext } from "@/server/services/site";
import { PageRenderer } from "@/components/website/PageRenderer";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { buildMetadata } from "@/lib/seo/metadata";

export async function legalMetadata(slug: string, fallback: string): Promise<Metadata> {
  const [page, site] = await Promise.all([getPublishedPageBySlug(slug), getSiteContext()]);
  const seo = page ? await getSeo("page", page.id) : null;
  return buildMetadata({
    seo,
    fallbackTitle: page?.title || fallback,
    fallbackDescription: page?.excerpt || "",
    path: `/${slug}`,
    settings: site.settings,
  });
}

export async function CmsLegalPage({ slug, title }: { slug: string; title: string }) {
  const [page, site] = await Promise.all([getPublishedPageBySlug(slug), getSiteContext()]);
  if (!page) notFound();
  return (
    <>
      <Breadcrumb items={[{ name: "Home", href: "/" }, { name: page.title || title, href: `/${slug}` }]} />
      <PageRenderer sections={page.sections} extras={site} />
    </>
  );
}
