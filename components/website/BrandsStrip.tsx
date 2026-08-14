"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/website/Reveal";
import { SITE_IMAGES } from "@/lib/site-images";

const BRAND_NOTES: Record<string, { hue: string; note: string }> = {
  samsung: { hue: "from-[#0b1f6b] to-[#1c4ed8]", note: "QLED backlight, T-con and Smart Hub" },
  lg: { hue: "from-[#6b1024] to-[#c81e3a]", note: "OLED care, webOS and power board" },
  sony: { hue: "from-[#1a1a1a] to-[#4a4a4a]", note: "Bravia processor, no-picture and audio" },
  mi: { hue: "from-[#9a3b00] to-[#ff6900]", note: "PatchWall, Wi-Fi and mainboard" },
  tcl: { hue: "from-[#7a1014] to-[#e31e24]", note: "Google TV, LED strips and power" },
  panasonic: { hue: "from-[#062a6e] to-[#0b57d0]", note: "Viera boards and inverter faults" },
  oneplus: { hue: "from-[#7a0014] to-[#eb0028]", note: "Smart board, apps and display" },
  vu: { hue: "from-[#111827] to-[#374151]", note: "Backlight, smart board and ports" },
};

function meta(name: string) {
  return (
    BRAND_NOTES[name.toLowerCase()] || {
      hue: "from-navy-3 to-navy",
      note: "Panel, board and software diagnosis",
    }
  );
}

export function BrandsStrip({
  heading,
  items,
}: {
  heading?: string;
  items: string[];
}) {
  const brands = useMemo(() => items.filter(Boolean), [items]);
  const [active, setActive] = useState(0);
  if (!brands.length) return null;
  const current = brands[active];
  const currentMeta = meta(current);

  return (
    <section className="section-pad bg-paper">
      <div className="container-wide grid min-w-0 items-center gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal className="min-w-0">
          <p className="eyebrow">Pick a set</p>
          <h2 className="mt-2 wrap-break-word font-display text-2xl sm:text-3xl md:text-4xl">{heading || "Brands we service"}</h2>
          <p className="mt-3 max-w-md text-sm text-muted sm:mt-4 sm:text-base">
            Treat it like the TV home screen. Select a brand — we already carry the boards and habits for that chassis.
          </p>
          <div className="mt-8 rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Now servicing</p>
            <p className="mt-2 font-display text-xl sm:text-3xl">{current}</p>
            <p className="mt-2 text-sm text-muted">{currentMeta.note}</p>
          </div>
        </Reveal>

        <Reveal delay={90} className="mx-auto w-full max-w-lg">
          <div className="rounded-[1.7rem] bg-navy p-2 shadow-[0_30px_60px_-28px_rgba(8,21,37,0.7)] sm:p-2.5">
            <div className="relative overflow-hidden rounded-[1.2rem] bg-[#0c1220]">
              <Image
                src={SITE_IMAGES.watching}
                alt=""
                fill
                className="object-cover opacity-45"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-navy/55" />
              <div className="relative">
              <div className="flex items-center justify-between px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-white/70 sm:px-4">
                <span>TV Care</span>
                <span>Home</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 px-2 pb-3 sm:gap-2.5 sm:px-3">
                {brands.map((brand, i) => {
                  const { hue } = meta(brand);
                  const on = i === active;
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setActive(i)}
                      className={`aspect-square min-w-0 rounded-xl bg-linear-to-br p-px transition duration-300 sm:rounded-2xl ${
                        on ? "scale-[1.04] ring-2 ring-copper ring-offset-1 ring-offset-[#0c1220] sm:ring-offset-2" : "opacity-85 hover:opacity-100"
                      } ${hue}`}
                      aria-pressed={on}
                      aria-label={brand}
                    >
                      <span className="flex h-full w-full flex-col items-center justify-center rounded-[0.7rem] bg-black/25 px-0.5 text-white sm:rounded-[0.95rem] sm:px-1">
                        <span className="font-display text-base leading-none sm:text-lg">{brand.slice(0, 1)}</span>
                        <span className="mt-1 max-w-full truncate text-[8px] font-semibold uppercase tracking-wide sm:text-[9px]">
                          {brand}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-white/70">
                <span>Open {current}</span>
                <span className="text-copper">OK</span>
              </div>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-1 h-3 w-28 rounded-b-lg bg-navy-3" />
          <div className="mx-auto h-2 w-40 rounded-b-md bg-navy/80" />
        </Reveal>
      </div>
    </section>
  );
}
