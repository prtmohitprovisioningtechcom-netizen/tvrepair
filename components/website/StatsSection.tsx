"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 9000, suffix: "+", label: "Happy Clients" },
  { value: 15000, suffix: "+", label: "Repairs Done" },
  { value: 10, suffix: "+", label: "Years of Experience" },
  { value: 100, suffix: "%", label: "Satisfaction Rate" },
];

function AnimatedNumber({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span>
      {display >= 1000 ? display.toLocaleString("en-IN") : display}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-16 sm:py-20"
      style={{ background: "linear-gradient(135deg, #7a3810 0%, #612D05 50%, #4a1e02 100%)" }}
    >
      {/* Background decorative circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -right-10 h-60 w-60 rounded-full bg-white/5" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03]" />
      </div>

      <div className="container-wide relative">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.6s ease ${i * 150}ms, transform 0.6s ease ${i * 150}ms`,
              }}
            >
              <span className="font-display text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} inView={inView} />
              </span>
              <span className="mt-2 text-sm font-medium tracking-wide text-white/70 sm:text-base">
                {stat.label}
              </span>
              {/* Divider line */}
              <span
                className="mt-4 block h-0.5 w-10 rounded-full bg-white/30"
                style={{
                  transform: inView ? "scaleX(1)" : "scaleX(0)",
                  transition: `transform 0.6s ease ${i * 150 + 400}ms`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
