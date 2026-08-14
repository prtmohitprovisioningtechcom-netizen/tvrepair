"use client";

import { useState } from "react";
import { MessageCircle, Minus, Phone, Plus } from "lucide-react";
import { useSettings } from "@/context/settings";
import { phoneHref, whatsappHref } from "@/lib/utils/cn";
import { Reveal } from "@/components/website/Reveal";

export function FAQSection({
  heading,
  items,
}: {
  heading?: string;
  items: { question: string; answer: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);
  const settings = useSettings();
  const phone = settings["business.phone"] || "";
  const whatsapp = settings["business.whatsapp"] || phone;
  if (!items.length) return null;

  return (
    <section className="section-pad bg-white">
      <div className="container-wide grid min-w-0 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal className="min-w-0">
          <p className="eyebrow">Questions</p>
          <h2 className="mt-2 wrap-break-word font-display text-2xl sm:text-3xl md:text-4xl">{heading || "Frequently asked questions"}</h2>
          <p className="mt-3 max-w-md text-sm text-muted sm:mt-4 sm:text-base">
            Straight answers before a technician is sent. If your TV issue is not listed, the desk will still advise on the call.
          </p>
          <div className="mt-8 space-y-3">
            {phone ? (
              <a
                href={phoneHref(phone)}
                className="card-surface flex min-w-0 items-center gap-3 p-4 transition duration-300 hover:shadow-soft"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream text-copper">
                  <Phone size={18} />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted">Call the desk</span>
                  <span className="font-medium">{phone}</span>
                </span>
              </a>
            ) : null}
            {whatsapp ? (
              <a
                href={whatsappHref(whatsapp, "Hi, I have a question about TV repair.")}
                className="card-surface flex min-w-0 items-center gap-3 p-4 transition duration-300 hover:shadow-soft"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream text-copper">
                  <MessageCircle size={18} />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted">WhatsApp</span>
                  <span className="font-medium">Message a coordinator</span>
                </span>
              </a>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={80} className="overflow-hidden rounded-2xl border border-line bg-paper">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.question} className={i > 0 ? "border-t border-line" : ""}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2.5 px-3 py-3.5 text-left sm:gap-4 sm:px-5 sm:py-5 lg:px-6"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="mt-0.5 font-display text-sm text-copper">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium leading-6">{item.question}</span>
                    <span className={`faq-answer ${isOpen ? "open" : ""}`}>
                      <span>
                        <p className="mt-3 text-sm leading-7 text-muted">{item.answer}</p>
                      </span>
                    </span>
                  </span>
                  <span
                    className={`faq-icon mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                      isOpen ? "open border-copper bg-copper text-white" : "border-line bg-white text-navy"
                    }`}
                  >
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
