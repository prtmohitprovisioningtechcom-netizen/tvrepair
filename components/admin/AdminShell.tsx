"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";
import { cn } from "@/lib/utils/cn";
import type { SessionUser } from "@/types";

const NAV: { href?: string; label?: string; hint?: string; group?: string }[] = [
  { group: "Start" },
  { href: "/admin/dashboard", label: "Dashboard", hint: "Where to click" },
  { group: "Website" },
  { href: "/admin/pages", label: "Pages", hint: "Home, About, Contact" },
  { href: "/admin/services", label: "TV services", hint: "Cards + photos" },
  { href: "/admin/gallery", label: "Gallery", hint: "Showcase photos" },
  { href: "/admin/media", label: "Photos", hint: "Upload images" },
  { href: "/admin/menus", label: "Header & footer", hint: "Top / bottom links" },
  { href: "/admin/settings", label: "Business info", hint: "Phone, logo, address" },
  { group: "Customers" },
  { href: "/admin/leads", label: "Bookings", hint: "Website form requests" },
  { href: "/admin/testimonials", label: "Reviews", hint: "Customer quotes" },
  { href: "/admin/faqs", label: "FAQs", hint: "Question answers" },
  { href: "/admin/blogs", label: "Blog", hint: "Articles" },
  { href: "/admin/categories", label: "Blog topics", hint: "Article groups" },
  { group: "Setup" },
  { href: "/admin/seo", label: "Google / SEO", hint: "Search titles" },
  { href: "/admin/users", label: "Staff logins", hint: "Who can edit" },
];

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const links = NAV.filter((item) => item.href);

  return (
    <div className="min-h-screen bg-(--admin-bg) text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-y-auto bg-navy text-white lg:block">
        <div className="px-5 py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Website editor</p>
          <p className="mt-1 font-display text-xl">India LED TV Repair Center</p>
          <p className="mt-2 text-xs leading-5 text-white/55">Change a field, click Save, then check View site.</p>
        </div>
        <nav className="space-y-0.5 px-3 pb-10">
          {NAV.map((item, i) =>
            item.group ? (
              <p key={`g-${item.group}`} className={`px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 ${i === 0 ? "mb-1" : "mb-1 mt-5"}`}>
                {item.group}
              </p>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  "block rounded-lg px-3 py-2 transition hover:bg-white/10 hover:text-white",
                  pathname.startsWith(item.href!) && "bg-white/10 text-white",
                )}
              >
                <span className="block text-sm text-white/90">{item.label}</span>
                {item.hint ? <span className="block text-[11px] text-white/45">{item.hint}</span> : null}
              </Link>
            ),
          )}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:px-8">
          <p className="text-sm text-muted">
            Signed in as <span className="text-ink">{user.name}</span>
          </p>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="rounded-lg bg-navy px-3 py-1.5 font-medium text-white hover:bg-navy-2" target="_blank">
              View website
            </Link>
            <button
              type="button"
              className="text-copper"
              onClick={async () => {
                await apiPost("/auth/logout");
                router.push("/admin/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>
        <div className="lg:hidden overflow-x-auto border-b border-line bg-white px-3 py-2">
          <div className="flex gap-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1 text-sm",
                  pathname.startsWith(item.href!) ? "bg-navy text-white" : "bg-cream",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
