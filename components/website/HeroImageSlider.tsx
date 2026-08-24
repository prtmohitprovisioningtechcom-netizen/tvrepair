"use client";

import { useEffect, useState } from "react";
import { CmsImage } from "@/components/website/CmsImage";

export function HeroImageSlider({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % images.length);
    }, 3500); // Change image every 3.5 seconds
    return () => clearInterval(timer);
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div className="relative aspect-16/10 overflow-hidden rounded-2xl sm:aspect-4/3 shadow-2xl">
      {images.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <CmsImage
            src={img}
            alt="TV Repair Services"
            className={`h-full w-full object-cover transition-transform duration-[4000ms] ease-out ${i === active ? "scale-100" : "scale-105"}`}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={i === 0}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-linear-to-t from-navy/60 via-transparent to-transparent z-20 pointer-events-none" />
      
      {/* Slider dots */}
      <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
