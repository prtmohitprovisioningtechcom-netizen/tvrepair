import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPageBySlug } from "@/server/repositories/pages.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { getSiteContext } from "@/server/services/site";
import { PageRenderer } from "@/components/website/PageRenderer";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { buildMetadata } from "@/lib/seo/metadata";

async function renderCms(slug: string, titleFallback: string) {
  const [page, site] = await Promise.all([getPublishedPageBySlug(slug), getSiteContext()]);
  if (!page) return null;
  const seo = await getSeo("page", page.id);
  return { page, site, seo, titleFallback };
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await renderCms("about", "About");
  if (!data) return { title: "About" };
  return buildMetadata({
    seo: data.seo,
    fallbackTitle: data.page.title,
    fallbackDescription: data.page.excerpt || "",
    path: "/about",
    settings: data.site.settings,
  });
}

export default async function AboutPage() {
  const data = await renderCms("about", "About");
  if (!data) notFound();
  return (
    <>
      <Breadcrumb items={[{ name: "Home", href: "/" }, { name: data.page.title, href: "/about" }]} />
      <PageRenderer sections={data.page.sections} extras={data.site} />
    </>
  );
}
