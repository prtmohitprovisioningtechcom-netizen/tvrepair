"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils/cn";
import type { Lead } from "@/models";

interface Stats {
  cards: {
    totalLeads: number;
    newLeads: number;
    completedJobs: number;
    services: number;
    pages: number;
    blogs: number;
    testimonials: number;
  };
  leadChart: { day: string; count: number }[];
  recentLeads: Lead[];
  popularServices: { id: number; name: string; slug: string }[];
  recentPages: { id: number; title: string; slug: string; status: string; updated_at: string }[];
}

const GUIDE = [
  { href: "/admin/pages", title: "Pages", change: "Homepage heading, photos, buttons, About, Contact" },
  { href: "/admin/services", title: "TV services", change: "Service names, short text and card photos" },
          { href: "/admin/settings", title: "Business info", change: "Name, phone, address, hours — one save updates the whole site" },
  { href: "/admin/menus", title: "Header & footer", change: "Top menu and footer links" },
  { href: "/admin/leads", title: "Bookings", change: "Does not change the site — these are customer requests" },
  { href: "/admin/testimonials", title: "Reviews", change: "Quotes shown on Home / About" },
  { href: "/admin/faqs", title: "FAQs", change: "Question answers on the website" },
  { href: "/admin/media", title: "Photos", change: "Upload a photo, then pick it on a page or service" },
];

export default function DashboardPage() {
  const [data, setData] = useState<Stats | null>(null);

  useEffect(() => {
    apiGet<Stats>("/dashboard").then(setData);
  }, []);

  if (!data) return <p className="text-muted">Loading dashboard…</p>;

  const cards = [
    ["New bookings", data.cards.newLeads, "/admin/leads"],
    ["Total bookings", data.cards.totalLeads, "/admin/leads"],
    ["TV services", data.cards.services, "/admin/services"],
    ["Pages", data.cards.pages, "/admin/pages"],
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Start here</p>
        <h1 className="mt-1 font-display text-3xl">What do you want to change?</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Click a box. Edit the fields. Press Save. Then open View website to confirm.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {GUIDE.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-line bg-white p-4 transition hover:border-copper/40 hover:shadow-soft"
          >
            <p className="font-display text-lg">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{item.change}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="border border-line bg-white p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-display text-3xl">{value}</p>
          </Link>
        ))}
      </div>
      <section className="border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl">Latest bookings</h2>
            <p className="text-sm text-muted">From the website Book a Repair form.</p>
          </div>
          <Link href="/admin/leads" className="text-sm text-copper">
            Open all
          </Link>
        </div>
        <ul className="mt-4 space-y-3 text-sm">
          {data.recentLeads.map((lead) => (
            <li key={lead.id} className="flex justify-between gap-3 border-b border-line pb-3">
              <span>
                {lead.customer_name}
                <span className="block text-muted">{lead.phone}</span>
              </span>
              <span className="text-muted">{formatDateTime(lead.created_at)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
