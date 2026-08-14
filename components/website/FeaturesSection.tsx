"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Cpu, MapPinned } from "lucide-react";
import { CmsImage } from "@/components/website/CmsImage";
import { resolveWorkImage } from "@/lib/site-images";

const ICONS = [Cpu, BadgeCheck, MapPinned];

export function FeaturesSection({
  heading,
  items,
}: {
  heading?: string;
  items: { title: string; body: string; image?: string }[];
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.22, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!items.length) return null;

  return (
    <section ref={ref} className="section-pad">
      <div className="container-wide">
        <div className={`max-w-2xl ${inView ? "feature-in" : "feature-wait"}`}>
          <p className="eyebrow">Why choose us</p>
          <h2 className="mt-1.5 wrap-break-word font-display text-2xl leading-snug sm:mt-2 sm:text-3xl md:text-4xl lg:text-[2.75rem]">
            {heading || "Why choose us"}
          </h2>
          <span className={`mt-2.5 block h-0.5 w-10 origin-left rounded-full bg-copper sm:mt-5 sm:w-16 ${inView ? "feature-line-draw" : "scale-x-0"}`} />
        </div>

        {items.length > 1 ? (
          <div className="relative mt-12 hidden lg:block" aria-hidden>
            <div
              className="absolute top-[1.15rem] h-px overflow-hidden bg-line"
              style={{ left: `${50 / items.length}%`, right: `${50 / items.length}%` }}
            >
              <div className={`h-full origin-left bg-copper ${inView ? "feature-line-draw" : "scale-x-0"}`} />
            </div>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
              {items.map((item, i) => (
                <div key={`${item.title}-step`} className="flex justify-center">
                  <span
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-copper/50 bg-paper font-display text-xs tracking-[0.14em] text-copper ${
                      inView ? "feature-in" : "feature-wait"
                    }`}
                    style={{ animationDelay: `${120 + i * 160}ms` }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className={`mt-4 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-5 md:gap-6 ${items.length === 2 ? "" : "lg:grid-cols-3"}`}>
          {items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            const n = String(i + 1).padStart(2, "0");
            const photo = resolveWorkImage(item.image);
            return (
              <article
                key={item.title}
                className={`feature-card group relative overflow-hidden rounded-xl border border-line bg-white sm:rounded-2xl ${
                  inView ? "feature-in" : "feature-wait"
                }`}
                style={{ animationDelay: `${220 + i * 140}ms` }}
              >
                <div className="relative aspect-4/3 overflow-hidden bg-navy-2">
                  {photo ? (
                    <CmsImage
                      src={photo}
                      alt=""
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-linear-to-t from-navy via-navy/25 to-transparent" />
                  <span className="absolute left-2 top-2 rounded-full bg-white/95 px-1.5 py-0.5 font-display text-[10px] text-navy sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
                    {n}
                  </span>
                  <span className="absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-copper text-white sm:bottom-3 sm:left-3 sm:h-10 sm:w-10">
                    <span className="feature-ring absolute inset-0 rounded-full border border-dashed border-white/50" />
                    <Icon size={14} className="relative sm:hidden" />
                    <Icon size={18} className="relative hidden sm:block" />
                  </span>
                </div>
                <div className="p-2.5 sm:p-6">
                  <h3 className="font-display text-base leading-snug text-ink sm:text-2xl">{item.title}</h3>
                  <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-muted sm:mt-3 sm:line-clamp-none sm:text-sm sm:leading-7">{item.body}</p>
                </div>
                <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-copper transition duration-500 ease-out group-hover:scale-x-100" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
