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
  // If CMS data exists, we could render it, but we replace with static content as requested.
  return (
    <>
      <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "About", href: "/about" }]} />
      <section className="container-wide section-pad bg-paper text-ink">
        <h1 className="font-display text-3xl md:text-4xl">INDIA LED TV REPAIR CENTER</h1>
        <h2 className="font-display text-2xl md:text-3xl mt-4">About Us</h2>
        <p className="prose-site mt-4">
          Welcome to INDIA LED TV Repair, your trusted destination for expert LCD, LED, and Smart TV repairs. With years of hands-on experience and a team of skilled technicians, we specialize in diagnosing and fixing all types of television issues—quickly, reliably, and affordably. We use only genuine spare parts and ensure every repair meets high-quality standards, whether it’s a screen issue, sound problem, motherboard fault, or power failure. Customer satisfaction is our top priority, and we pride ourselves on transparent pricing, fast service, and long-lasting results.
        </p>
        <p className="prose-site mt-4">
          We offer a wide range of repair services, including:
        </p>
        <ul className="list-disc pl-6 prose-site mt-2">
          <li>Television Repair (all sizes and models)</li>
          <li>Smart TV Repair (Android, Google TV, etc.)</li>
          <li>LED TV Repair</li>
          <li>LCD TV Repair</li>
        </ul>
      </section>
    </>
  );
}
