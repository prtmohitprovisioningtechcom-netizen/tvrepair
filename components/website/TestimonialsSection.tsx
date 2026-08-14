"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeCheck, ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react";
import type { Testimonial } from "@/models";
import { Reveal } from "@/components/website/Reveal";
import { SITE_IMAGES, resolveWorkImage } from "@/lib/site-images";

const AVATARS = ["bg-navy", "bg-copper", "bg-navy-3", "bg-copper-dark"];
const TV_SCENES = [
  SITE_IMAGES.watching,
  SITE_IMAGES.living,
  SITE_IMAGES.wallTv,
  SITE_IMAGES.hero,
  SITE_IMAGES.smart,
  SITE_IMAGES.interior,
  SITE_IMAGES.screen,
];

function screenPhoto(url: string | null | undefined, index: number) {
  return resolveWorkImage(url) || TV_SCENES[index % TV_SCENES.length];
}

export function TestimonialsSection({
  heading,
  items,
}: {
  heading?: string;
  items: Testimonial[];
}) {
  const reviews = items.slice(0, 8);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reviews.length < 2 || paused) return;
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % reviews.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [reviews.length, paused]);

  if (!reviews.length) return null;
  const item = reviews[active];
  const photo = screenPhoto(item.image_url, active);

  return (
    <section className="section-pad bg-cream">
      <div className="container-wide grid min-w-0 items-center gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal className="min-w-0">
          <p className="eyebrow">On the wall again</p>
          <h2 className="mt-2 wrap-break-word font-display text-2xl sm:text-3xl md:text-4xl">{heading || "What customers say"}</h2>
          <p className="mt-3 max-w-md text-sm text-muted sm:mt-4 sm:text-base">
            One visit, one story. Switch the channel to hear the next household.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
            {reviews.map((review, i) => (
              <button
                key={review.id}
                type="button"
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 rounded-full border px-2 py-1.5 pr-3 text-left transition duration-300 ${
                  i === active
                    ? "border-copper bg-white shadow-soft"
                    : "border-line bg-white/60 hover:border-navy/20"
                }`}
                aria-label={`Show review from ${review.customer_name}`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-display text-xs text-white ${AVATARS[i % AVATARS.length]}`}
                >
                  {review.customer_name.slice(0, 1)}
                </span>
                <span className="hidden sm:block">
                  <span className="block text-xs font-semibold leading-none">{review.customer_name.split(" ")[0]}</span>
                  <span className="mt-1 block text-[11px] text-muted">{review.location}</span>
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={90} className="mx-auto w-full max-w-xl">
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
          <div className="rounded-[1.6rem] bg-navy p-2 shadow-[0_30px_60px_-28px_rgba(8,21,37,0.7)] sm:p-2.5">
            <div className="overflow-hidden rounded-[1.15rem] bg-navy-2">
              <div className="relative aspect-16/10">
                <Image
                  key={photo + item.id}
                  src={photo}
                  alt=""
                  fill
                  className="review-fade object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-navy/20 sm:bg-linear-to-t sm:from-navy sm:via-navy/50 sm:to-navy/10" />
                <p className="absolute left-3 top-3 rounded-full bg-navy/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:left-4 sm:top-4">
                  Live · Channel {String(active + 1).padStart(2, "0")}
                </p>
                <blockquote key={`desk-${item.id}`} className="review-fade absolute inset-x-0 bottom-0 hidden p-5 text-white sm:block lg:p-7">
                  <div className="flex gap-0.5 text-copper">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="mt-3 font-display text-xl leading-8 lg:text-2xl">“{item.review}”</p>
                  <footer className="mt-5 flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-sm font-semibold">{item.customer_name}</span>
                      {item.location ? (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-white/65">
                          <MapPin size={12} />
                          {item.location}
                        </span>
                      ) : null}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">
                      <BadgeCheck size={13} className="text-copper" />
                      Verified visit
                    </span>
                  </footer>
                </blockquote>
              </div>
              <blockquote key={`mob-${item.id}`} className="review-fade p-4 text-white sm:hidden">
                <div className="flex gap-0.5 text-copper">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-3 font-display text-lg leading-7">“{item.review}”</p>
                <footer className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <span className="block text-sm font-semibold">{item.customer_name}</span>
                    {item.location ? (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-white/65">
                        <MapPin size={12} />
                        {item.location}
                      </span>
                    ) : null}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">
                    <BadgeCheck size={13} className="text-copper" />
                    Verified visit
                  </span>
                </footer>
              </blockquote>
            </div>
          </div>
          <div className="mx-auto mt-1 h-3 w-28 rounded-b-lg bg-navy-3" />
          <div className="mx-auto h-2 w-40 rounded-b-md bg-navy/80" />

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-navy hover:border-copper"
              onClick={() => setActive((i) => (i - 1 + reviews.length) % reviews.length)}
              aria-label="Previous review"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              {String(active + 1).padStart(2, "0")} / {String(reviews.length).padStart(2, "0")}
            </p>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-navy hover:border-copper"
              onClick={() => setActive((i) => (i + 1) % reviews.length)}
              aria-label="Next review"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
