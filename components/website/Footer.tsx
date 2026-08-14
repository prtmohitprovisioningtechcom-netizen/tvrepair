import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { MenuItem } from "@/models";
import type { SettingsMap } from "@/types";
import { phoneHref, whatsappHref } from "@/lib/utils/cn";
import { Logo } from "@/components/website/Logo";
import { SiteLink } from "@/components/website/SiteLink";

export function Footer({
  settings,
  items,
  legal,
}: {
  settings: SettingsMap;
  items: MenuItem[];
  legal: MenuItem[];
}) {
  const phone = settings["business.phone"] || "";
  const whatsapp = settings["business.whatsapp"] || phone;
  return (
    <footer className="bg-navy pb-[calc(4.25rem+env(safe-area-inset-bottom))] text-white lg:pb-0">
      <div className="h-1 bg-copper" />
      <div className="container-wide grid grid-cols-2 gap-x-4 gap-y-5 py-6 sm:gap-8 sm:py-16 lg:grid-cols-4">
        <div className="col-span-2">
          <Logo light name={settings["business.name"]} src={settings["business.logo"]} />
          <p className="mt-2.5 max-w-md text-xs leading-5 text-white/65 sm:mt-4 sm:text-sm sm:leading-7">
            Doorstep TV repair for LED, LCD, OLED, QLED and Smart TVs across Delhi NCR.
          </p>
          <div className="mt-3 space-y-1.5 text-xs text-white/70 sm:mt-6 sm:space-y-2 sm:text-sm">
            {settings["business.address"] ? (
              <p className="flex min-w-0 items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-copper" />
                <span className="wrap-break-word">{settings["business.address"]}</span>
              </p>
            ) : null}
            {settings["business.working_hours"] ? (
              <p className="flex items-center gap-2">
                <Clock size={14} className="shrink-0 text-copper" />
                {settings["business.working_hours"]}
              </p>
            ) : null}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45 sm:text-xs sm:tracking-[0.18em]">Explore</p>
          <div className="mt-2.5 grid gap-1.5 text-[13px] text-white/75 sm:mt-4 sm:gap-2.5 sm:text-sm">
            {items.map((item) => (
              <SiteLink key={item.id} href={item.url} className="text-left hover:text-white" source="footer">
                {item.label}
              </SiteLink>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45 sm:text-xs sm:tracking-[0.18em]">Contact</p>
          <div className="mt-2.5 grid gap-1.5 text-[13px] text-white/75 sm:mt-4 sm:gap-2.5 sm:text-sm">
            {phone ? (
              <a href={phoneHref(phone)} className="inline-flex min-w-0 items-center gap-1.5 hover:text-white">
                <Phone size={13} className="shrink-0 text-copper" />
                <span className="break-all">{phone}</span>
              </a>
            ) : null}
            {whatsapp ? (
              <a href={whatsappHref(whatsapp)} className="inline-flex items-center gap-1.5 hover:text-white">
                <MessageCircle size={13} className="shrink-0 text-copper" />
                WhatsApp
              </a>
            ) : null}
            {settings["business.email"] ? (
              <a href={`mailto:${settings["business.email"]}`} className="inline-flex min-w-0 items-center gap-1.5 hover:text-white">
                <Mail size={13} className="shrink-0 text-copper" />
                <span className="break-all">{settings["business.email"]}</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col gap-2 py-3 text-[11px] text-white/45 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:py-4 sm:text-xs">
          <p className="wrap-break-word">{settings["footer.copyright"] || `© ${new Date().getFullYear()} ${settings["business.name"]}`}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 sm:gap-x-4 sm:gap-y-2">
            {legal.map((item) => (
              <Link key={item.id} href={item.url} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function MobileCta({ settings }: { settings: SettingsMap }) {
  const phone = settings["business.phone"] || "";
  const whatsapp = settings["business.whatsapp"] || phone;
  return (
    <div className="mobile-cta">
      <a href={phoneHref(phone)} className="flex min-h-12 items-center justify-center gap-2 bg-navy py-3 text-sm font-semibold text-white">
        <Phone size={16} />
        Call now
      </a>
      <a
        href={whatsappHref(whatsapp, "Hi, I need TV repair service.")}
        className="flex min-h-12 items-center justify-center gap-2 bg-copper py-3 text-sm font-semibold text-white"
      >
        <MessageCircle size={16} />
        WhatsApp
      </a>
    </div>
  );
}
