import type { Metadata } from "next";
import { getPublishedPageBySlug } from "@/server/repositories/pages.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { getSiteContext } from "@/server/services/site";
import { PageRenderer } from "@/components/website/PageRenderer";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/website/PageHero";
import { ServicesCatalog } from "@/components/website/ServicesCatalog";
import { hasSection, pageBanner } from "@/lib/page-banner";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContext();
  const page = await getPublishedPageBySlug("tv-repair");
  const seo = page ? await getSeo("page", page.id) : null;
  return buildMetadata({
    seo,
    fallbackTitle: "TV Repair",
    fallbackDescription: "Professional doorstep TV repair for all major brands and panel types.",
    path: "/tv-repair",
    settings: site.settings,
  });
}

export default async function TvRepairPage() {
  const [page, site] = await Promise.all([getPublishedPageBySlug("tv-repair"), getSiteContext()]);
  const showHero = !hasSection(page?.sections, "hero");
  return (
    <>
      <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "TV Repair", href: "/tv-repair" }]} />
      {showHero ? (
        <PageHero
          eyebrow="Specialist workshop"
          title="TV Repair"
          description="Specialist repair for LED, LCD, OLED, QLED and Smart TVs — at your doorstep across Delhi NCR."
          image={pageBanner(page)}
        />
      ) : page ? (
        <PageRenderer
          sections={page.sections.filter((s) => s.type === "hero")}
          extras={site}
        />
      ) : null}
      <ServicesCatalog services={site.services} />
    </>
  );
}
