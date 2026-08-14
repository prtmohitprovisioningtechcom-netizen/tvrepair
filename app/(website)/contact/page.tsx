import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getPublishedPageBySlug } from "@/server/repositories/pages.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { getSiteContext } from "@/server/services/site";
import { PageRenderer } from "@/components/website/PageRenderer";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHero } from "@/components/website/PageHero";
import { buildMetadata } from "@/lib/seo/metadata";
import { hasSection, pageBanner } from "@/lib/page-banner";
import { phoneHref, whatsappHref } from "@/lib/utils/cn";

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getPublishedPageBySlug("contact"), getSiteContext()]);
  const seo = page ? await getSeo("page", page.id) : null;
  return buildMetadata({
    seo,
    fallbackTitle: "Contact",
    fallbackDescription: "Call, WhatsApp or request a technician for TV repair.",
    path: "/contact",
    settings: site.settings,
  });
}

export default async function ContactPage() {
  const [page, site] = await Promise.all([getPublishedPageBySlug("contact"), getSiteContext()]);
  const s = site.settings;
  const showHero = !hasSection(page?.sections, "hero");
  const showForm = !hasSection(page?.sections, "contact_form");
  return (
    <>
      <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Contact", href: "/contact" }]} />
      {showHero ? (
        <PageHero
          eyebrow="Service desk"
          title="Talk to a coordinator"
          description="Share a fault, book a visit, or speak with the desk. We respond during working hours."
          image={pageBanner(page)}
        />
      ) : null}
      {page ? (
        <PageRenderer
          sections={page.sections.filter((sec) => (showHero ? sec.type !== "text" : true))}
          extras={site}
        />
      ) : null}
      {showForm ? (
        <section className="container-wide grid min-w-0 gap-8 py-10 sm:gap-10 sm:py-14 lg:grid-cols-2 lg:py-20">
          <div className="min-w-0 space-y-4">
            {s["business.phone"] ? (
              <a href={phoneHref(s["business.phone"])} className="card-surface flex min-w-0 items-center gap-4 p-4 sm:p-5 hover:shadow-soft">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cream text-copper">
                  <Phone size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted">Phone</span>
                  <span className="break-all font-medium">{s["business.phone"]}</span>
                </span>
              </a>
            ) : null}
            {s["business.whatsapp"] ? (
              <a href={whatsappHref(s["business.whatsapp"])} className="card-surface flex min-w-0 items-center gap-4 p-4 sm:p-5 hover:shadow-soft">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cream text-copper">
                  <MessageCircle size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted">WhatsApp</span>
                  <span className="break-all font-medium">{s["business.whatsapp"]}</span>
                </span>
              </a>
            ) : null}
            {s["business.email"] ? (
              <a href={`mailto:${s["business.email"]}`} className="card-surface flex min-w-0 items-center gap-4 p-4 sm:p-5 hover:shadow-soft">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cream text-copper">
                  <Mail size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted">Email</span>
                  <span className="break-all font-medium">{s["business.email"]}</span>
                </span>
              </a>
            ) : null}
            <div className="card-surface flex min-w-0 items-start gap-4 p-4 sm:p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cream text-copper">
                <MapPin size={18} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted">Workshop</span>
                <span className="font-medium">{s["business.address"]}</span>
                <span className="mt-1 block text-sm text-muted">{s["business.working_hours"]}</span>
              </span>
            </div>
          </div>
          <div className="card-surface min-w-0 p-4 sm:p-6 lg:p-8">
            <h2 className="font-display text-xl sm:text-2xl">Send a message</h2>
            <p className="mt-1 mb-4 text-sm text-muted sm:mb-6">We will call back to confirm the visit.</p>
            <ContactForm />
          </div>
        </section>
      ) : null}
    </>
  );
}
