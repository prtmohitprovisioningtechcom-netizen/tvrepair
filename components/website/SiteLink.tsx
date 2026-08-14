"use client";

import Link from "next/link";
import { useUiStore } from "@/store/ui";
import { useSettings } from "@/context/settings";
import { isExternalAction, resolveActionHref } from "@/lib/site-settings";

export function isBookingHref(href?: string | null) {
  if (!href) return false;
  const path = href.split("?")[0].replace(/\/$/, "") || "/";
  return path === "/book-service" || path.endsWith("/book-service");
}

export function SiteLink({
  href,
  className,
  children,
  source = "cta",
  onClick,
  target,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  source?: string;
  onClick?: () => void;
  target?: string | null;
}) {
  const settings = useSettings();
  const openBooking = useUiStore((s) => s.openBooking);
  const label = typeof children === "string" ? children : "";
  const resolved = resolveActionHref(href, label, settings);

  if (isBookingHref(href) || isBookingHref(resolved)) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          onClick?.();
          openBooking(source);
        }}
      >
        {children}
      </button>
    );
  }

  if (isExternalAction(resolved)) {
    return (
      <a href={resolved} className={className} onClick={onClick} target={target || undefined}>
        {children}
      </a>
    );
  }

  return (
    <Link href={resolved} className={className} onClick={onClick} target={target || undefined}>
      {children}
    </Link>
  );
}
