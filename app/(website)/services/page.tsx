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
  const [page, site] = await Promise.all([getPublishedPageBySlug("services"), getSiteContext()]);
  const seo = page ? await getSeo("page", page.id) : null;
  return buildMetadata({
    seo,
    fallbackTitle: "TV Repair Services",
    fallbackDescription: "LED, LCD, OLED, QLED and Smart TV repair at your doorstep.",
    path: "/services",
    settings: site.settings,
  });
}

export default async function ServicesPage() {
  const [page, site] = await Promise.all([getPublishedPageBySlug("services"), getSiteContext()]);
  const showHero = !hasSection(page?.sections, "hero");
  return (
    <>
      <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Services", href: "/services" }]} />
      {showHero ? (
        <PageHero
          eyebrow="What we repair"
          title="TV repair services"
          description="LED, LCD, OLED, QLED and Smart TV specialists — diagnosis first, then a clear estimate."
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
