import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHomepage } from "@/server/repositories/pages.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { getSiteContext } from "@/server/services/site";
import { PageRenderer } from "@/components/website/PageRenderer";
import { StatsSection } from "@/components/website/StatsSection";
import { GallerySlider } from "@/components/website/GallerySlider";
import { buildMetadata } from "@/lib/seo/metadata";
import { query } from "@/lib/db/query";

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
    const [page, galleryImages] = await Promise.all([
      getHomepage(),
      query<{ id: number; image_url: string; alt_text?: string; caption?: string }>(`
        SELECT g.id, m.url as image_url, m.alt_text, g.caption
        FROM gallery_images g
        JOIN media m ON g.media_id = m.id
        WHERE g.is_visible = 1
        ORDER BY g.sort_order ASC, g.id DESC
        LIMIT 20
      `).catch(() => []),
    ]);

    if (!page) notFound();

    const heroTypes = new Set(["hero", "offer_slider", "brands", "trust_badges"]);
    const HIDDEN_HEADINGS = ["Expert TV Repair Services"];

    const topSections = page.sections.filter((s) => heroTypes.has(s.type));
    const servicesSections = page.sections.filter((s) => s.type === "services_grid");
    const hasStatistics = page.sections.some((s) => s.type === "statistics");
    const whyChooseSections = page.sections.filter(
      (s) => s.type === "features" && (s.content?.heading as string | undefined)?.toLowerCase().includes("why choose")
    );
    const restSections = page.sections.filter((s) => {
      if (heroTypes.has(s.type)) return false;
      if (s.type === "services_grid" || s.type === "statistics") return false;
      if (s.type === "features" && (s.content?.heading as string | undefined)?.toLowerCase().includes("why choose")) return false;
      const heading = (s.content?.heading as string | undefined)?.trim() || "";
      if (HIDDEN_HEADINGS.some((h) => heading.toLowerCase() === h.toLowerCase())) return false;
      return true;
    });

    return (
      <>
        <PageRenderer sections={topSections} extras={site} />
        <PageRenderer sections={servicesSections} extras={site} />
        {!hasStatistics && <StatsSection />}
        <PageRenderer sections={whyChooseSections} extras={site} />
        {galleryImages.length > 0 && <GallerySlider images={galleryImages} />}
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
