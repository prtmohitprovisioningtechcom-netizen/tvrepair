import type { ReactNode } from "react";
import { Header } from "@/components/website/Header";
import { Footer, MobileCta } from "@/components/website/Footer";
import { getSiteContext } from "@/server/services/site";
import { SiteProvider } from "@/components/website/SiteProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessSchema, websiteSchema } from "@/lib/seo/schema";

export const dynamic = "force-dynamic";

const emptySite = {
  settings: {},
  header: null,
  footer: null,
  footerLegal: null,
  services: [],
  faqs: [],
  testimonials: [],
};

export default async function WebsiteLayout({ children }: { children: ReactNode }) {
  let site = emptySite;
  try {
    site = await getSiteContext();
  } catch (error) {
    console.error("[site] layout database error", error);
  }

  return (
    <SiteProvider settings={site.settings}>
      <JsonLd data={localBusinessSchema(site.settings)} />
      <JsonLd data={websiteSchema(site.settings)} />
      <Header settings={site.settings} items={site.header?.items || []} />
      <div className="flex-1">{children}</div>
      <Footer settings={site.settings} items={site.footer?.items || []} legal={site.footerLegal?.items || []} />
      <MobileCta settings={site.settings} />
    </SiteProvider>
  );
}
