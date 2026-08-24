"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: number;
  image_url: string;
  alt_text?: string;
  caption?: string;
}

export function GallerySlider({ images }: { images: GalleryImage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(220);

  // Duplicate for seamless infinite scroll
  const items = [...images, ...images, ...images];

  useEffect(() => {
    function measure() {
      if (trackRef.current) {
        const first = trackRef.current.querySelector("[data-card]") as HTMLElement | null;
        if (first) setCardWidth(first.offsetWidth + 12); // gap
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (paused || images.length < 2) return;
    const loopWidth = images.length * cardWidth;
    const id = setInterval(() => {
      setOffset((prev) => {
        const next = prev + 1.2;
        return next >= loopWidth ? 0 : next;
      });
    }, 20);
    return () => clearInterval(id);
  }, [paused, cardWidth, images.length]);

  const scroll = (dir: -1 | 1) => {
    const loopWidth = images.length * cardWidth;
    setOffset((prev) => {
      const next = prev + dir * cardWidth;
      if (next < 0) return loopWidth - cardWidth;
      if (next >= loopWidth) return 0;
      return next;
    });
  };

  if (!images.length) return null;

  return (
    <section
      className="relative overflow-hidden py-10"
      style={{ background: "linear-gradient(135deg, #2d1008 0%, #1a0800 100%)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Heading */}
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Our Work</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">Gallery</h2>
        <div className="mx-auto mt-2 h-0.5 w-10 rounded-full bg-white/30" />
      </div>

      {/* Track */}
      <div className="relative overflow-hidden">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[#1a0800] to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#1a0800] to-transparent" />

        <div
          ref={trackRef}
          className="flex gap-3"
          style={{ transform: `translateX(-${offset}px)`, willChange: "transform" }}
        >
          {items.map((img, i) => (
            <div
              key={`${img.id}-${i}`}
              data-card
              className="relative shrink-0 w-48 h-36 sm:w-56 sm:h-44 overflow-hidden rounded-xl border border-white/10 shadow-lg group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image_url}
                alt={img.alt_text || img.caption || "Gallery"}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                loading="lazy"
              />
              {img.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-4 opacity-0 group-hover:opacity-100 transition">
                  <p className="text-xs text-white/90 truncate">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next buttons */}
      <button
        type="button"
        aria-label="Previous"
        onClick={() => scroll(-1)}
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25 border border-white/15"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => scroll(1)}
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25 border border-white/15"
      >
        <ChevronRight size={18} />
      </button>
    </section>
  );
}
