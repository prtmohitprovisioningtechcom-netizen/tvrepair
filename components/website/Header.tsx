"use client";

import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import type { MenuItem } from "@/models";
import type { SettingsMap } from "@/types";
import { phoneHref } from "@/lib/utils/cn";
import { Logo } from "@/components/website/Logo";
import { SiteLink } from "@/components/website/SiteLink";
import { useUiStore } from "@/store/ui";

export function Header({
  settings,
  items,
}: {
  settings: SettingsMap;
  items: MenuItem[];
}) {
  const [open, setOpen] = useState(false);
  const openBooking = useUiStore((s) => s.openBooking);
  const phone = settings["business.phone"] || "";
  const name = settings["business.name"] || "India LED TV Repair Center";
  const hours = settings["business.working_hours"] || "";

  return (
    <header className="sticky top-0 z-50">
      {phone || hours ? (
        <div className="hidden border-b border-white/10 bg-navy-2 text-xs text-white/70 lg:block">
          <div className="container-wide flex h-9 items-center justify-between gap-4">
            <span className="min-w-0 truncate">{hours ? `Service desk · ${hours}` : "Doorstep TV repair across Delhi NCR"}</span>
            {phone ? (
              <a href={phoneHref(phone)} className="inline-flex shrink-0 items-center gap-1.5 font-medium text-white hover:text-copper">
                <Phone size={12} />
                {phone}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="border-b border-white/10 bg-navy/95 text-white backdrop-blur">
        <div className="container-wide flex h-14 min-w-0 items-center justify-between gap-2 sm:h-18 sm:gap-3 lg:h-20 lg:gap-6">
          <div className="min-w-0 shrink">
            <Logo light name={name} src={settings["business.logo"]} />
          </div>
          <nav className="hidden min-w-0 flex-1 items-center justify-end gap-4 overflow-x-auto text-[0.85rem] whitespace-nowrap text-white/75 xl:gap-7 xl:text-[0.9rem] lg:flex">
            {items.map((item) => (
              <div key={item.id} className="group relative shrink-0">
                <SiteLink href={item.url} target={item.target} className="transition hover:text-white" source="header-nav">
                  {item.label}
                </SiteLink>
                {item.children?.length ? (
                  <div className="invisible absolute right-0 top-full z-20 min-w-52 max-w-[min(16rem,calc(100vw-2rem))] rounded-lg bg-white py-2 text-ink opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100">
                    {item.children.map((child) => (
                      <SiteLink
                        key={child.id}
                        href={child.url}
                        className="block px-4 py-2 text-left text-sm whitespace-normal hover:bg-cream"
                        source="header-nav"
                      >
                        {child.label}
                      </SiteLink>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <button
              type="button"
              className="btn-primary py-2.5 text-sm"
              onClick={() => openBooking("header")}
            >
              Book Service
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:hidden">
            {phone ? (
              <a href={phoneHref(phone)} className="btn-primary px-2.5 py-2 text-xs sm:px-3 sm:py-2.5" aria-label="Call">
                <Phone size={14} />
                Call
              </a>
            ) : null}
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="max-h-[min(70vh,calc(100dvh-5rem))] overflow-y-auto border-t border-white/10 bg-navy-2 px-4 py-3 lg:hidden">
            {items.map((item) => (
              <div key={item.id}>
                <SiteLink
                  href={item.url}
                  className="block rounded-lg px-3 py-3 text-left text-sm text-white/85 hover:bg-white/5"
                  source="header-nav"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </SiteLink>
                {item.children?.length ? (
                  <div className="mb-1 ml-3 border-l border-white/10 pl-2">
                    {item.children.map((child) => (
                      <SiteLink
                        key={child.id}
                        href={child.url}
                        className="block rounded-lg px-3 py-2.5 text-left text-sm text-white/65 hover:bg-white/5 hover:text-white"
                        source="header-nav"
                        onClick={() => setOpen(false)}
                      >
                        {child.label}
                      </SiteLink>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              className="btn-primary mt-3 mb-1 w-full"
              onClick={() => {
                setOpen(false);
                openBooking("header-mobile");
              }}
            >
              Book Service
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
