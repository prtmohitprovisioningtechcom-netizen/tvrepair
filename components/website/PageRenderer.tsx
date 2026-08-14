import { Fragment } from "react";
import Link from "next/link";
import { CheckCircle2, Phone, ShieldCheck } from "lucide-react";
import type { PageSection } from "@/models";
import type { Faq, Service, Testimonial } from "@/models";
import type { SettingsMap } from "@/types";
import { ContactForm } from "@/components/forms/ContactForm";
import { FAQSection } from "@/components/website/FAQSection";
import { TestimonialsSection } from "@/components/website/TestimonialsSection";
import { ServiceCard } from "@/components/website/ServiceCard";
import { BrandsStrip } from "@/components/website/BrandsStrip";
import { BookingSection } from "@/components/website/BookingSection";
import { SiteLink } from "@/components/website/SiteLink";
import { FeaturesSection } from "@/components/website/FeaturesSection";
import { Reveal } from "@/components/website/Reveal";
import { phoneHref } from "@/lib/utils/cn";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import { resolveWorkImage } from "@/lib/site-images";
import { applySettingsTokens } from "@/lib/site-settings";
import { CmsImage } from "@/components/website/CmsImage";

export interface RendererExtras {
  services: Service[];
  faqs: Faq[];
  testimonials: Testimonial[];
  settings: SettingsMap;
}

export function PageRenderer({
  sections,
  extras,
}: {
  sections: PageSection[];
  extras: RendererExtras;
}) {
  const visible = sections.filter((s) => s.is_visible);
  return (
    <>
      {visible.map((section) => (
        <Fragment key={section.id || `${section.type}-${section.sort_order}`}>
          <Section section={section} extras={extras} />
          {section.type === "hero" && section.content.showBookingForm ? (
            <BookingSection settings={extras.settings} source="hero" />
          ) : null}
        </Fragment>
      ))}
    </>
  );
}

function Section({ section, extras }: { section: PageSection; extras: RendererExtras }) {
  const c = section.content;
  const settings = extras.settings;
  const align = section.settings?.alignment === "center" ? "text-center mx-auto" : "";
  const str = (key: string, fallback = "") => {
    const value = c[key];
    const text = typeof value === "string" ? value : fallback;
    return applySettingsTokens(text, settings);
  };
  const img = (key: string) => resolveWorkImage(str(key));

  if (section.type === "hero") {
    const badges = Array.isArray(c.badges) ? (c.badges as string[]) : [];
    const image = img("image");
    return (
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <div className="page-hero-mesh pointer-events-none absolute inset-0" />
        <div className={`container-wide relative z-10 grid min-w-0 items-center gap-5 py-8 sm:gap-8 sm:py-10 md:gap-10 lg:gap-12 lg:py-16 ${image ? "md:grid-cols-2" : ""} ${c.showBookingForm ? "pb-12 sm:pb-16 lg:pb-24" : ""}`}>
          <div className="min-w-0">
            <p className="eyebrow">{str("eyebrow", "Doorstep TV Repair")}</p>
            <h1 className="mt-2 max-w-xl wrap-break-word font-display text-[1.75rem] leading-snug sm:mt-4 sm:text-[2.15rem] md:text-5xl lg:text-[3.2rem]">
              {str("heading")}
            </h1>
            <p className="mt-2.5 max-w-lg text-[0.95rem] leading-6 text-white/80 sm:mt-4 sm:text-base sm:leading-7 md:mt-5 md:text-lg">
              {str("description")}
            </p>
            <div className="mt-4 flex flex-col gap-2 min-[480px]:flex-row min-[480px]:flex-wrap sm:mt-7 sm:gap-3">
              <SiteLink href={str("primaryHref", "/book-service")} className="btn-primary w-full min-[480px]:w-auto" source="hero">
                {str("primaryLabel", "Book a Repair")}
              </SiteLink>
              <SiteLink
                href={str("secondaryHref", "/contact")}
                className="btn-outline w-full border-white/40 text-white hover:bg-white hover:text-navy min-[480px]:w-auto"
                source="hero"
              >
                {str("secondaryLabel", "Call Now")}
              </SiteLink>
            </div>
            <p className="mt-4 text-sm text-white/70">{str("availabilityText")}</p>
          </div>
          {image ? (
            <div className="relative aspect-16/10 overflow-hidden rounded-2xl sm:aspect-4/3">
              <CmsImage src={image} alt="" sizes="(max-width: 768px) 100vw, 50vw" priority />
              <div className="absolute inset-0 bg-linear-to-t from-navy/40 to-transparent" />
            </div>
          ) : null}
          {badges.length ? (
            <div className="flex flex-wrap gap-2 md:col-span-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white"
                >
                  <CheckCircle2 size={13} className="text-copper" />
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (section.type === "text" || section.type === "rich_text") {
    return (
      <section className="section-pad">
        <div className={`container-narrow ${align}`}>
          {str("heading") ? <h2 className="wrap-break-word font-display text-2xl sm:text-3xl md:text-4xl">{str("heading")}</h2> : null}
          <div
            className="prose-site mt-5"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(str("html") || str("body") || str("description")) }}
          />
        </div>
      </section>
    );
  }

  if (section.type === "image_text") {
    const image = img("image");
    return (
      <section className="section-pad">
        <div className={`container-wide grid min-w-0 items-center gap-8 sm:gap-10 ${image ? "lg:grid-cols-2 lg:gap-16" : ""}`}>
          {image ? (
            <Reveal from="left" className="relative min-w-0 overflow-hidden md:overflow-visible">
              <div className="absolute -bottom-3 -right-3 hidden h-full w-full rounded-2xl bg-copper/20 md:block" />
              <div className="relative aspect-5/4 overflow-hidden rounded-2xl">
                <CmsImage src={image} alt={str("heading")} sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
            </Reveal>
          ) : null}
          <Reveal from="right" delay={80} className="min-w-0">
            <h2 className="wrap-break-word font-display text-2xl sm:text-3xl md:text-4xl">{str("heading")}</h2>
            <p className="mt-4 text-lg leading-8 text-muted">{str("body") || str("description")}</p>
            {str("buttonLabel") ? (
              <SiteLink href={str("buttonHref", "/contact")} className="btn-navy mt-7" source="image-text">
                {str("buttonLabel")}
              </SiteLink>
            ) : null}
          </Reveal>
        </div>
      </section>
    );
  }

  if (section.type === "services_grid") {
    const limit = Number(c.limit || 8);
    return (
      <section className="section-pad bg-cream">
        <div className="container-wide">
          <Reveal>
            <div className="flex min-w-0 items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow">Services</p>
                <h2 className="mt-2 wrap-break-word font-display text-2xl sm:text-3xl md:text-4xl">{str("heading", "TV repair services")}</h2>
              </div>
              <Link href="/tv-repair" className="hidden text-sm font-semibold text-copper md:inline">
                View all
              </Link>
            </div>
          </Reveal>
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            {extras.services.slice(0, limit).map((service, i) => (
              <Reveal key={service.id} delay={i * 70} className="h-full">
                <ServiceCard
                  name={service.name}
                  slug={service.slug}
                  description={service.short_description}
                  image={service.image_url}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "faq") {
    const category = str("category");
    const items = extras.faqs.filter((f) => !category || f.category === category);
    return <FAQSection heading={str("heading")} items={items} />;
  }

  if (section.type === "testimonials") {
    const items = c.featuredOnly ? extras.testimonials.filter((t) => t.is_featured) : extras.testimonials;
    return <TestimonialsSection heading={str("heading")} items={items} />;
  }

  if (section.type === "cta") {
    const phone = extras.settings["business.phone"] || "";
    const image = img("image");
    return (
      <section className="relative overflow-hidden bg-navy py-8 text-white sm:py-16 lg:py-20">
        {image ? <CmsImage src={image} alt="" className="object-cover opacity-35" sizes="100vw" /> : null}
        <div className={`absolute inset-0 ${image ? "bg-navy/70" : ""}`} />
        <div className={`container-wide relative grid min-w-0 items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] ${align || ""}`}>
          <Reveal className="min-w-0">
            <h2 className="max-w-2xl wrap-break-word font-display text-2xl sm:text-3xl md:text-5xl">{str("heading")}</h2>
            <p className="mt-3 max-w-xl text-sm text-white/70 sm:mt-4 sm:text-base">{str("body")}</p>
            <div className="mt-5 flex flex-col gap-2 sm:mt-8 sm:gap-3 min-[480px]:flex-row min-[480px]:flex-wrap">
              <SiteLink href={str("primaryHref", "/book-service")} className="btn-primary w-full min-[480px]:w-auto" source="cta">
                {str("primaryLabel", "Book a Repair")}
              </SiteLink>
              <SiteLink href={str("secondaryHref", "/contact")} className="btn-outline w-full border-white/30 text-white hover:bg-white hover:text-navy min-[480px]:w-auto" source="cta">
                {str("secondaryLabel", "WhatsApp Us")}
              </SiteLink>
            </div>
          </Reveal>
          {phone ? (
            <Reveal delay={100}>
              <a
                href={phoneHref(phone)}
                className="block min-w-0 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition duration-300 hover:bg-white/15 sm:rounded-2xl sm:p-6"
              >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Call the desk</p>
              <p className="mt-2 inline-flex max-w-full items-center gap-2 break-all font-display text-lg sm:mt-3 sm:text-2xl">
                <Phone size={22} className="shrink-0 text-copper" />
                {phone}
              </p>
              <p className="mt-2 text-sm text-white/55">7 days · usually under 90 minutes in Noida & Delhi</p>
              </a>
            </Reveal>
          ) : null}
        </div>
      </section>
    );
  }

  if (section.type === "features") {
    const items = Array.isArray(c.items)
      ? (c.items as { title: string; body: string; image?: string }[]).map((item) => ({
          ...item,
          image: resolveWorkImage(item.image),
        }))
      : [];
    return <FeaturesSection heading={str("heading", "Why choose us")} items={items} />;
  }

  if (section.type === "statistics") {
    return null;
  }

  if (section.type === "gallery") {
    const images = Array.isArray(c.images) ? (c.images as string[]).filter(Boolean) : [];
    if (!images.length) return null;
    return (
      <section className="section-pad">
        <div className="container-wide">
          <h2 className="font-display text-2xl sm:text-3xl">{str("heading", "Gallery")}</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((src) => (
              <div key={src} className="relative aspect-4/3 overflow-hidden rounded-2xl">
                <CmsImage src={src} alt="" sizes="(max-width: 1024px) 100vw, 33vw" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "contact_form") {
    return (
      <section className="section-pad">
        <div className="container-narrow">
          <h2 className="font-display text-2xl sm:text-3xl">{str("heading", "Contact")}</h2>
          <p className="mt-3 text-muted">{str("body")}</p>
          <div className="card-surface mt-8 p-5 sm:p-6">
            <ContactForm />
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "booking_form") {
    return (
      <BookingSection
        settings={extras.settings}
        source="booking-section"
        heading={str("heading", "Book a doorstep visit")}
      />
    );
  }

  if (section.type === "video" && str("url")) {
    return (
      <section className="section-pad">
        <div className="container-narrow">
          <h2 className="font-display text-2xl sm:text-3xl">{str("heading")}</h2>
          <div className="mt-6 aspect-video overflow-hidden rounded-xl">
            <iframe src={str("url")} className="h-full w-full" title={str("heading")} allowFullScreen />
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "custom_html") {
    return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(str("html")) }} />;
  }

  if (section.type === "brands" || section.type === "trust_badges") {
    const items = Array.isArray(c.items) ? (c.items as string[]) : [];
    return <BrandsStrip heading={str("heading")} items={items} />;
  }

  if (section.type === "before_after") {
    const beforeImage = img("beforeImage");
    const afterImage = img("afterImage");
    return (
      <section className="section-pad">
        <div className="container-wide grid gap-6 lg:grid-cols-2">
          {beforeImage ? (
            <div className="relative aspect-4/3 overflow-hidden rounded-xl">
              <CmsImage src={beforeImage} alt="Before" />
            </div>
          ) : null}
          {afterImage ? (
            <div className="relative aspect-4/3 overflow-hidden rounded-xl">
              <CmsImage src={afterImage} alt="After" />
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return null;
}

export function TrustNote() {
  return (
    <p className="inline-flex items-center gap-2 text-sm text-muted">
      <ShieldCheck size={16} className="text-copper" />
      Workmanship warranty on completed repairs
    </p>
  );
}
