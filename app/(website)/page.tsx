import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHomepage } from "@/server/repositories/pages.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { getSiteContext } from "@/server/services/site";
import { PageRenderer } from "@/components/website/PageRenderer";
import { StatsSection } from "@/components/website/StatsSection";
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
  const site = await getSiteContext();
  try {
    const page = await getHomepage();
    if (!page) notFound();

    // Split sections: render hero+services first, inject StatsSection, then rest
    const heroTypes = new Set(["hero", "offer_slider", "brands", "trust_badges"]);
    const topSections = page.sections.filter((s) => heroTypes.has(s.type));
    const servicesSections = page.sections.filter((s) => s.type === "services_grid");
    const hasStatistics = page.sections.some((s) => s.type === "statistics");
    const restSections = page.sections.filter(
      (s) => !heroTypes.has(s.type) && s.type !== "services_grid" && s.type !== "statistics"
    );

    return (
      <>
        <PageRenderer sections={topSections} extras={site} />
        <PageRenderer sections={servicesSections} extras={site} />
        {!hasStatistics && <StatsSection />}
        <PageRenderer sections={restSections} extras={site} />
      </>
    );
  } catch (error) {
    console.error("[home]", error);
    return (
      <>
        <PageRenderer sections={[]} extras={site} />
        <StatsSection />
      </>
    );
  }
}

