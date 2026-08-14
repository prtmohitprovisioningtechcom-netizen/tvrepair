"use client";

import { Clock, MapPin, Phone, ShieldCheck } from "lucide-react";
import { BookingForm } from "@/components/forms/BookingForm";
import type { SettingsMap } from "@/types";
import { phoneHref } from "@/lib/utils/cn";
import { Reveal } from "@/components/website/Reveal";

export function BookingSection({
  settings,
  source = "home",
  heading = "Book a doorstep visit",
}: {
  settings: SettingsMap;
  source?: string;
  heading?: string;
}) {
  const phone = settings["business.phone"] || "";
  const hours = settings["business.working_hours"] || "";
  const city = settings["business.city"] || "Delhi NCR";

  return (
    <section className="relative z-10 -mt-5 pb-1 sm:-mt-8 md:-mt-10">
      <div className="container-wide">
        <Reveal>
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-soft sm:rounded-2xl lg:grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-navy p-3 text-white sm:p-7 lg:p-10">
            <p className="eyebrow">Same-day slots</p>
            <h2 className="mt-1 wrap-break-word font-display text-xl leading-snug sm:mt-2 sm:text-3xl md:text-4xl">{heading}</h2>
            <p className="mt-1 hidden max-w-md text-sm leading-6 text-white/70 sm:mt-3 sm:block">
              Tell us the TV type and the fault. A coordinator confirms the window before a technician leaves.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-white/85 sm:mt-8 sm:grid-cols-1 sm:gap-3 sm:text-sm">
              {phone ? (
                <li>
                  <a href={phoneHref(phone)} className="inline-flex min-w-0 items-center gap-1.5 hover:text-copper">
                    <Phone size={13} className="shrink-0 text-copper sm:h-4 sm:w-4" />
                    <span className="truncate">{phone}</span>
                  </a>
                </li>
              ) : null}
              {hours ? (
                <li className="flex items-center gap-1.5">
                  <Clock size={13} className="shrink-0 text-copper sm:h-4 sm:w-4" />
                  <span className="truncate">{hours}</span>
                </li>
              ) : null}
              <li className="flex items-center gap-1.5">
                <MapPin size={13} className="shrink-0 text-copper sm:h-4 sm:w-4" />
                <span className="truncate">{city}</span>
              </li>
              <li className="col-span-2 flex items-center gap-1.5 sm:col-span-1">
                <ShieldCheck size={13} className="shrink-0 text-copper sm:h-4 sm:w-4" />
                <span className="truncate">90-day workmanship warranty</span>
              </li>
            </ul>
          </div>
          <div className="p-3 sm:p-6 lg:p-10">
            <p className="hidden font-display text-xl text-ink sm:block">Request a technician</p>
            <p className="mb-3 hidden text-sm text-muted sm:mb-6 sm:mt-1 sm:block">We call back to confirm. No surprise visit.</p>
            <BookingForm variant="panel" source={source} />
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
