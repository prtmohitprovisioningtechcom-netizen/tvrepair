import Image from "next/image";
import { CalendarCheck, Home, Microscope, ShieldCheck } from "lucide-react";
import { SITE_IMAGES } from "@/lib/site-images";

const STEPS = [
  {
    n: "01",
    title: "Book a slot",
    body: "Share the brand, size and fault. A coordinator confirms a visit window.",
    icon: CalendarCheck,
    image: SITE_IMAGES.smart,
  },
  {
    n: "02",
    title: "Technician arrives",
    body: "A local engineer comes to your home with boards, strips and tools.",
    icon: Home,
    image: SITE_IMAGES.watching,
  },
  {
    n: "03",
    title: "Diagnose first",
    body: "Panel, backlight, power and software are isolated before any part is billed.",
    icon: Microscope,
    image: SITE_IMAGES.soldering,
  },
  {
    n: "04",
    title: "Repair & warranty",
    body: "You approve the estimate. Completed jobs carry a workmanship warranty.",
    icon: ShieldCheck,
    image: SITE_IMAGES.hero,
  },
];

export function ProcessSteps() {
  return (
    <section className="section-pad bg-white">
      <div className="container-wide">
        <p className="eyebrow">How a visit works</p>
        <h2 className="mt-2 max-w-2xl wrap-break-word font-display text-2xl sm:text-3xl md:text-4xl">From the call to a working TV</h2>
        <div className="mt-6 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.n} className="group overflow-hidden rounded-2xl border border-line bg-paper">
                <div className="relative aspect-video overflow-hidden sm:aspect-4/3">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-navy/10 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 font-display text-xs text-navy">
                    {step.n}
                  </span>
                  <span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-copper text-white">
                    <Icon size={16} />
                  </span>
                </div>
                <div className="p-3.5 sm:p-5">
                  <h3 className="font-display text-lg sm:text-xl">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted sm:mt-2">{step.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
