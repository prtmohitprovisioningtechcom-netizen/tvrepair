"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api-client";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { useUiStore } from "@/store/ui";
import type { SettingsMap } from "@/types";

const GROUPS: { title: string; note: string; fields: [string, string, string][] }[] = [
  {
    title: "What customers see everywhere",
    note: "Header, footer, booking popup and contact buttons.",
    fields: [
      ["business.name", "Business name", "Shown next to the logo."],
      ["business.phone", "Phone", "Updates Call buttons everywhere. Do not paste the number on each page."],
      ["business.whatsapp", "WhatsApp number", "Leave empty to use the Phone number. Digits with country code, e.g. 918510951545."],
      ["business.email", "Email", "Footer and contact."],
      ["business.working_hours", "Working hours", "Header strip and booking card."],
      ["contact.emergency", "Emergency number", "If used on contact."],
    ],
  },
  {
    title: "Address",
    note: "Footer and Google Business style details.",
    fields: [
      ["business.address", "Address", "Footer."],
      ["business.city", "City", "Used in text and SEO."],
      ["business.pincode", "Pincode", ""],
      ["business.maps_url", "Google Maps link", "Opens maps from the site."],
    ],
  },
  {
    title: "Social links",
    note: "Shown if your theme uses them in the footer.",
    fields: [
      ["social.facebook", "Facebook", ""],
      ["social.instagram", "Instagram", ""],
      ["social.youtube", "YouTube", ""],
      ["social.linkedin", "LinkedIn", ""],
      ["social.twitter", "Twitter / X", ""],
    ],
  },
  {
    title: "Google (optional)",
    note: "Does not change the look of the site — only search / tracking.",
    fields: [
      ["seo.default_title", "Default Google title", "Used when a page has no SEO title."],
      ["seo.default_description", "Default Google description", ""],
      ["seo.ga", "Google Analytics ID", ""],
      ["seo.gtm", "Google Tag Manager ID", ""],
      ["seo.gsc", "Search Console code", ""],
      ["footer.copyright", "Footer copyright line", "Very bottom of every page."],
    ],
  },
];

export default function SettingsPage() {
  const toast = useUiStore((s) => s.pushToast);
  const [settings, setSettings] = useState<SettingsMap>({});
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  useEffect(() => {
    apiGet<SettingsMap>("/settings").then(setSettings);
  }, []);

  function setImage(key: string, url?: string | null) {
    setSettings({ ...settings, [key]: url || "" });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await apiPut("/settings", settings);
    toast("success", "Saved. Check View website.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Business info</h1>
          <p className="mt-1 text-sm text-muted">Phone, logo and address used on every page.</p>
        </div>
        <Button type="submit">Save</Button>
      </div>
      <AdminGuide
        title="Change once here — it updates the whole website"
        changes={[
          "Name — logo text, browser tab, Google name",
          "Phone — header, footer, Call Now, booking card, contact page",
          "WhatsApp — WhatsApp buttons (leave empty to use the same phone)",
          "Address & hours — footer, contact page, booking card",
          "Logo — top-left and footer",
        ]}
      />
      <section className="grid gap-4 rounded-2xl border border-line bg-white p-5 md:grid-cols-3">
        <ImageField
          label="Logo"
          hint="Shown in the top-left of the website. Use a wide logo (not a tiny square crop)."
          url={settings["business.logo"] || null}
          onChange={(next) => setImage("business.logo", next?.url)}
        />
        <ImageField
          label="Browser tab icon"
          hint="Optional. Leave empty to use the Logo in the browser tab."
          size="square"
          url={settings["business.favicon"] || settings["business.logo"] || null}
          onChange={(next) => setImage("business.favicon", next?.url)}
        />
        <ImageField
          label="WhatsApp / Google share photo"
          hint="Used when a page has no own share photo."
          url={settings["seo.default_og_image"] || null}
          onChange={(next) => setImage("seo.default_og_image", next?.url)}
        />
      </section>
      {GROUPS.map((group) => (
        <section key={group.title} className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-xl">{group.title}</h2>
          <p className="mt-1 text-sm text-muted">{group.note}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {group.fields.map(([key, label, hint]) => (
              <Field key={key} label={label} hint={hint || undefined}>
                {key.includes("description") || key.includes("address") ? (
                  <Textarea value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
                ) : (
                  <Input value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
                )}
              </Field>
            ))}
          </div>
        </section>
      ))}
      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-xl">Admin password</h2>
        <p className="mt-1 text-sm text-muted">This does not change the website. It only changes this login.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Current password">
            <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </Field>
          <Field label="New password">
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
          </Field>
        </div>
        <Button
          type="button"
          className="mt-4"
          variant="outline"
          onClick={async () => {
            const { apiPost } = await import("@/lib/api-client");
            await apiPost("/auth/change-password", { currentPassword: current, newPassword: next });
            toast("success", "Password updated");
          }}
        >
          Update password
        </Button>
      </section>
    </form>
  );
}
