import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHomepage } from "@/server/repositories/pages.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { getSiteContext } from "@/server/services/site";
import { PageRenderer } from "@/components/website/PageRenderer";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [page, site] = await Promise.all([getHomepage(), getSiteContext()]);
    if (!page) return { title: "TV Repair" };
    const seo = await getSeo("homepage", page.id);
    return buildMetadata({
      seo,
      fallbackTitle: page.title,
      fallbackDescription: page.excerpt || "",
      path: "/",
      settings: site.settings,
    });
  } catch {
    return { title: "TV Repair" };
  }
}

export default async function HomePage() {
  const [page, site] = await Promise.all([getHomepage(), getSiteContext()]);
  if (!page) notFound();
  return <PageRenderer sections={page.sections} extras={site} />;
}
