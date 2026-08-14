import Link from "next/link";
import { CheckCircle2, Clock, MapPin, Phone, ShieldCheck } from "lucide-react";
import type { Service, ServiceFaq } from "@/models";
import type { SettingsMap } from "@/types";
import { BookingForm } from "@/components/forms/BookingForm";
import { CmsImage } from "@/components/website/CmsImage";
import { FAQSection } from "@/components/website/FAQSection";
import { Reveal } from "@/components/website/Reveal";
import { ServiceCard } from "@/components/website/ServiceCard";
import { SiteLink } from "@/components/website/SiteLink";
import { phoneHref } from "@/lib/utils/cn";

export function ServiceDetailView({
  item,
  settings,
  related,
  faqs,
}: {
  item: Service;
  settings: SettingsMap;
  related: Service[];
  faqs: ServiceFaq[];
}) {
  const phone = settings["business.phone"] || "";
  const hours = settings["business.working_hours"] || "";
  const city = settings["business.city"] || "Delhi NCR";
  const others = related.filter((s) => s.id !== item.id).slice(0, 6);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <CmsImage src={item.image_url} alt="" className="object-cover object-[center_35%]" sizes="100vw" priority />
        <div className="hero-photo-shade pointer-events-none absolute inset-0" />
        <div className="container-wide relative z-10 grid min-w-0 items-end gap-6 py-10 sm:py-14 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <Reveal className="min-w-0">
            <p className="eyebrow">TV Repair</p>
            <h1 className="mt-2 max-w-2xl font-display text-2xl leading-snug sm:text-4xl md:text-5xl">{item.name}</h1>
            {item.short_description ? (
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:mt-4 sm:text-lg sm:leading-8">
                {item.short_description}
              </p>
            ) : null}
            <div className="mt-5 flex flex-col gap-2 min-[480px]:flex-row min-[480px]:flex-wrap">
              <SiteLink href="/book-service" className="btn-primary w-full min-[480px]:w-auto" source={`service-hero:${item.slug}`}>
                Book this repair
              </SiteLink>
              {phone ? (
                <a href={phoneHref(phone)} className="btn-outline w-full border-white/30 text-white hover:bg-white hover:text-navy min-[480px]:w-auto">
                  <Phone size={16} />
                  Call now
                </a>
              ) : null}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] text-white/90">
                <CheckCircle2 size={13} className="text-copper" />
                Doorstep in {city}
              </span>
              {hours ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] text-white/90">
                  <Clock size={13} className="text-copper" />
                  {hours}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] text-white/90">
                <ShieldCheck size={13} className="text-copper" />
                90-day warranty
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-wide grid min-w-0 gap-8 py-8 sm:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:py-16">
        <div className="min-w-0 space-y-8 sm:space-y-10">
          {item.description ? (
            <Reveal>
              <p className="eyebrow">About this repair</p>
              <h2 className="mt-2 font-display text-xl sm:text-2xl">What the technician actually does</h2>
              <div className="prose-site mt-4 whitespace-pre-line">{item.description}</div>
            </Reveal>
          ) : null}

          {item.symptoms?.length ? (
            <Reveal delay={40}>
              <p className="eyebrow">Symptoms</p>
              <h2 className="mt-2 font-display text-xl sm:text-2xl">Common signs we see</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {item.symptoms.map((symptom) => (
                  <li
                    key={symptom}
                    className="flex items-start gap-2.5 rounded-xl border border-line bg-white p-3 text-sm text-ink"
                  >
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-copper" />
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {item.benefits?.length ? (
            <Reveal delay={60}>
              <p className="eyebrow">Why this visit</p>
              <h2 className="mt-2 font-display text-xl sm:text-2xl">What you get</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {item.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2.5 rounded-xl border border-line bg-cream/60 p-3 text-sm text-ink"
                  >
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-copper" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </div>

        <Reveal delay={80} className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <aside className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
            <div className="bg-navy p-4 text-white sm:p-5">
              <p className="eyebrow">Same-day slots</p>
              <h2 className="mt-1 font-display text-xl">Book this service</h2>
              <p className="mt-1 text-xs text-white/65">A coordinator confirms before the technician leaves.</p>
              <ul className="mt-3 space-y-1.5 text-xs text-white/80">
                {phone ? (
                  <li>
                    <a href={phoneHref(phone)} className="inline-flex items-center gap-1.5 hover:text-copper">
                      <Phone size={13} className="text-copper" />
                      {phone}
                    </a>
                  </li>
                ) : null}
                {hours ? (
                  <li className="flex items-center gap-1.5">
                    <Clock size={13} className="text-copper" />
                    {hours}
                  </li>
                ) : null}
                <li className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-copper" />
                  Doorstep across {city}
                </li>
              </ul>
            </div>
            <div className="p-4 sm:p-5">
              <BookingForm compact source={`service:${item.slug}`} />
            </div>
          </aside>
        </Reveal>
      </section>

      <FAQSection heading={`Questions about ${item.name}`} items={faqs} />

      {others.length ? (
        <section className="section-pad bg-cream">
          <div className="container-wide">
            <Reveal>
              <p className="eyebrow">More from the bench</p>
              <h2 className="mt-2 font-display text-xl sm:text-2xl">Related TV services</h2>
            </Reveal>
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
              {others.map((service, i) => (
                <Reveal key={service.id} delay={i * 60} className="h-full">
                  <ServiceCard
                    name={service.name}
                    slug={service.slug}
                    description={service.short_description}
                    image={service.image_url}
                  />
                </Reveal>
              ))}
            </div>
            <p className="mt-6">
              <Link href="/tv-repair" className="text-sm font-semibold text-copper hover:underline">
                View all services
              </Link>
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
