import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceBySlug, getPublishedServices } from "@/server/repositories/services.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { getSiteContext } from "@/server/services/site";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServiceDetailView } from "@/components/website/ServiceDetailView";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/seo/schema";

type Params = { params: Promise<{ service: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { service: slug } = await params;
  const [item, site] = await Promise.all([getServiceBySlug(slug), getSiteContext()]);
  if (!item) return { title: "Service" };
  const seo = await getSeo("service", item.id);
  return buildMetadata({
    seo,
    fallbackTitle: `${item.name} | Doorstep Service`,
    fallbackDescription: item.short_description || "",
    path: `/tv-repair/${item.slug}`,
    settings: site.settings,
    image: item.image_url,
  });
}

export default async function ServiceDetailPage({ params }: Params) {
  const { service: slug } = await params;
  const [item, site, related] = await Promise.all([
    getServiceBySlug(slug),
    getSiteContext(),
    getPublishedServices(),
  ]);
  if (!item) notFound();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "TV Repair", href: "/tv-repair" },
    { name: item.name, href: `/tv-repair/${item.slug}` },
  ];
  return (
    <>
      <JsonLd data={serviceSchema(item, site.settings)} />
      <JsonLd data={breadcrumbSchema(crumbs.map((c) => ({ name: c.name, path: c.href })))} />
      <JsonLd data={faqSchema(item.faqs)} />
      <Breadcrumb items={crumbs} />
      <ServiceDetailView
        item={item}
        settings={site.settings}
        related={related}
        faqs={item.faqs}
      />
    </>
  );
}
