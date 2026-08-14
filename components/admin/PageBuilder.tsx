"use client";

import { type SelectHTMLAttributes } from "react";
import { SECTION_TYPES, type SectionContent, type SectionSettings, type SectionType } from "@/types";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { GalleryField, ImageField } from "@/components/admin/ImageField";

export interface BuilderSection {
  id?: number;
  type: SectionType | string;
  title?: string | null;
  content: SectionContent;
  settings?: SectionSettings | null;
  sort_order: number;
  is_visible: boolean;
}

export function defaultSection(type: SectionType): BuilderSection {
  const defaults: Record<SectionType, SectionContent> = {
    hero: {
      eyebrow: "Doorstep TV Repair",
      heading: "Professional TV Repair at Your Doorstep",
      description: "Expert LED, LCD, OLED and Smart TV repair with same-day technician visits.",
      primaryLabel: "Book a Repair",
      primaryHref: "/book-service",
      secondaryLabel: "Call Now",
      secondaryHref: "tel:",
      image: "",
      availabilityText: "Technicians available across Delhi NCR · 7 days a week",
      badges: ["Same-day visit", "Genuine parts", "90-day workmanship warranty"],
      showBookingForm: true,
    },
    text: {
      heading: "Section heading",
      body: "Write your introduction here.",
    },
    image_text: {
      heading: "Image and text",
      body: "Describe the service, process or benefit.",
      image: "",
      imagePosition: "right",
      buttonLabel: "Learn more",
      buttonHref: "/contact",
    },
    services_grid: { heading: "TV Repair Services", limit: 8 },
    faq: { heading: "Frequently asked questions", category: "general" },
    testimonials: { heading: "What customers say", featuredOnly: true },
    cta: {
      heading: "Need a technician today?",
      body: "Book a doorstep visit or call our service desk.",
      image: "",
      primaryLabel: "Book a Repair",
      primaryHref: "/book-service",
      secondaryLabel: "WhatsApp Us",
      secondaryHref: "/contact",
    },
    features: {
      heading: "Why choose us",
      items: [
        { title: "Experienced technicians", body: "Specialists for LED, OLED and Smart TV faults.", image: "" },
        { title: "Transparent pricing", body: "Diagnosis first. No surprise charges.", image: "" },
        { title: "Doorstep service", body: "We come to your home across Delhi NCR.", image: "" },
      ],
    },
    statistics: {
      items: [
        { value: "12k+", label: "TVs repaired" },
        { value: "4.9/5", label: "Customer rating" },
        { value: "90 min", label: "Average arrival" },
        { value: "7 days", label: "Service coverage" },
      ],
    },
    gallery: { heading: "Workshop & on-site work", images: [] },
    contact_form: { heading: "Send us a message", body: "We respond during working hours." },
    booking_form: { heading: "Book a TV repair" },
    video: { heading: "See how we work", url: "" },
    rich_text: { html: "<p>Write long-form content here.</p>" },
    custom_html: { html: "" },
    brands: { heading: "Brands we service", items: ["Samsung", "LG", "Sony", "Mi", "TCL", "Panasonic"] },
    trust_badges: {
      items: ["Same-day service", "Genuine spare parts", "Trained technicians", "Warranty on work"],
    },
    before_after: {
      heading: "Before & after",
      beforeImage: "",
      afterImage: "",
      body: "Panel, backlight and board-level repairs completed on-site or in workshop.",
    },
  };

  return {
    type,
    title: SECTION_TYPES.find((s) => s.value === type)?.label || type,
    content: defaults[type],
    settings: { alignment: "left", padding: "lg" },
    sort_order: 0,
    is_visible: true,
  };
}

export function PageBuilder({
  sections,
  onChange,
}: {
  sections: BuilderSection[];
  onChange: (sections: BuilderSection[]) => void;
}) {
  function update(index: number, patch: Partial<BuilderSection>) {
    onChange(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function updateContent(index: number, key: string, value: unknown) {
    update(index, { content: { ...sections[index].content, [key]: value } });
  }

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= sections.length) return;
    const copy = [...sections];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    onChange(copy.map((s, i) => ({ ...s, sort_order: i })));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-xl">Blocks on this page</h3>
          <p className="mt-1 text-sm text-muted">Each block is one part of the public page. Hide or remove a block if you do not want it.</p>
        </div>
        <Select
          defaultValue=""
          onChange={(e) => {
            const type = e.target.value as SectionType;
            if (!type) return;
            onChange([...sections, { ...defaultSection(type), sort_order: sections.length }]);
            e.target.value = "";
          }}
        >
          <option value="">Add a block</option>
          {SECTION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      </div>

      {sections.map((section, index) => {
        const meta = SECTION_TYPES.find((s) => s.value === section.type);
        return (
        <article key={`${section.type}-${index}`} className="border border-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-cream px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{meta?.label || section.title || section.type}</p>
              <p className="mt-0.5 max-w-xl text-xs leading-5 text-muted">{meta?.help}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button type="button" variant="ghost" onClick={() => move(index, -1)}>
                Up
              </Button>
              <Button type="button" variant="ghost" onClick={() => move(index, 1)}>
                Down
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => update(index, { is_visible: !section.is_visible })}
              >
                {section.is_visible ? "Hide on website" : "Show on website"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onChange(sections.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </div>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-2">
            <SectionFields
              section={section}
              onContent={(key, value) => updateContent(index, key, value)}
            />
          </div>
        </article>
        );
      })}
    </div>
  );
}

function Select({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="admin-input" {...props}>{children}</select>;
}

function SectionFields({
  section,
  onContent,
}: {
  section: BuilderSection;
  onContent: (key: string, value: unknown) => void;
}) {
  const c = section.content;
  const str = (key: string) => String(c[key] ?? "");

  const common = (
    <>
      {"heading" in c || section.type === "hero" || section.type === "text" ? (
        <Field label="Heading on website" hint="The large title visitors read.">
          <Input value={str("heading")} onChange={(e) => onContent("heading", e.target.value)} />
        </Field>
      ) : null}
      {"description" in c || "body" in c ? (
        <Field label="Text on website" hint="The paragraph under the heading.">
          <Textarea
            value={str("description") || str("body")}
            onChange={(e) =>
              onContent("description" in c ? "description" : "body", e.target.value)
            }
          />
        </Field>
      ) : null}
    </>
  );

  if (section.type === "hero") {
    return (
      <>
        <Field label="Small line above heading" hint="Example: Delhi NCR · Doorstep service">
          <Input value={str("eyebrow")} onChange={(e) => onContent("eyebrow", e.target.value)} />
        </Field>
        {common}
        <Field label="Main button text" hint="Usually Book a Repair. Opens the booking popup.">
          <Input value={str("primaryLabel")} onChange={(e) => onContent("primaryLabel", e.target.value)} />
        </Field>
        <Field label="Second button text" hint="Call Now always dials the phone from Business info. WhatsApp uses the WhatsApp number there.">
          <Input value={str("secondaryLabel")} onChange={(e) => onContent("secondaryLabel", e.target.value)} />
        </Field>
        <p className="md:col-span-2 rounded-xl bg-cream px-3 py-2 text-sm text-muted">
          Phone, WhatsApp, name and address are edited once in <strong>Business info</strong>. Call / WhatsApp buttons on every page update automatically.
        </p>
        <Field label="Line under the buttons" hint="Hours / arrival time. You can type {{hours}} to always use Business info hours.">
          <Input value={str("availabilityText")} onChange={(e) => onContent("availabilityText", e.target.value)} />
        </Field>
        <Field label="Small tags" hint="Comma separated. Example: Same-day visit, Genuine parts">
          <Input
            value={Array.isArray(c.badges) ? (c.badges as string[]).join(", ") : ""}
            onChange={(e) =>
              onContent(
                "badges",
                e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
              )
            }
          />
        </Field>
        <ImageField
          label="Banner photo"
          hint="Shows on the right of the homepage (and behind the text on mobile)."
          url={str("image") || null}
          onChange={(next) => onContent("image", next?.url || "")}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(c.showBookingForm)}
            onChange={(e) => onContent("showBookingForm", e.target.checked)}
          />
          Show booking card below this banner
        </label>
      </>
    );
  }

  if (section.type === "cta") {
    return (
      <>
        {common}
        <Field label="Primary button">
          <Input value={str("primaryLabel")} onChange={(e) => onContent("primaryLabel", e.target.value)} />
        </Field>
        <Field label="Second button text" hint="If this says Call or WhatsApp, it uses Business info. You do not paste the number here.">
          <Input value={str("secondaryLabel")} onChange={(e) => onContent("secondaryLabel", e.target.value)} />
        </Field>
        <ImageField
          label="Background photo"
          url={str("image") || null}
          onChange={(next) => onContent("image", next?.url || "")}
        />
      </>
    );
  }

  if (section.type === "image_text" || section.type === "before_after") {
    return (
      <>
        {common}
        <ImageField
          label="Photo on this block"
          hint="The picture next to the text on the website."
          url={str(section.type === "before_after" ? "beforeImage" : "image") || null}
          onChange={(next) =>
            onContent(section.type === "before_after" ? "beforeImage" : "image", next?.url || "")
          }
        />
        {section.type === "before_after" ? (
          <ImageField
            label="After image"
            url={str("afterImage") || null}
            onChange={(next) => onContent("afterImage", next?.url || "")}
          />
        ) : (
          <Field label="Button">
            <Input value={str("buttonLabel")} onChange={(e) => onContent("buttonLabel", e.target.value)} />
          </Field>
        )}
      </>
    );
  }

  if (section.type === "rich_text" || section.type === "custom_html") {
    return (
      <Field label="HTML">
        <Textarea className="min-h-40 font-mono text-sm" value={str("html")} onChange={(e) => onContent("html", e.target.value)} />
      </Field>
    );
  }

  if (section.type === "video") {
    return (
      <>
        {common}
        <Field label="Video URL">
          <Input value={str("url")} onChange={(e) => onContent("url", e.target.value)} />
        </Field>
      </>
    );
  }

  if (section.type === "services_grid") {
    return (
      <>
        <Field label="Heading on website" hint="Example: TV repair services">
          <Input value={str("heading")} onChange={(e) => onContent("heading", e.target.value)} />
        </Field>
        <Field label="How many cards" hint="Usually 8. Photos come from TV services.">
          <Input
            type="number"
            value={String(c.limit ?? 8)}
            onChange={(e) => onContent("limit", Number(e.target.value) || 8)}
          />
        </Field>
        <p className="md:col-span-2 rounded-xl bg-cream px-3 py-2 text-sm text-muted">
          To change a service photo or name, open <strong>TV services</strong> in the left menu. This block only places those cards on the page.
        </p>
      </>
    );
  }

  if (section.type === "features") {
    const items = Array.isArray(c.items)
      ? (c.items as { title?: string; body?: string; image?: string }[])
      : [];
    return (
      <>
        {common}
        <div className="md:col-span-2 grid gap-4">
          {items.map((item, i) => (
            <div key={i} className="grid gap-3 rounded-2xl border border-line p-4 md:grid-cols-2">
              <Field label={`Item ${i + 1} title`}>
                <Input
                  value={item.title || ""}
                  onChange={(e) =>
                    onContent(
                      "items",
                      items.map((row, j) => (j === i ? { ...row, title: e.target.value } : row)),
                    )
                  }
                />
              </Field>
              <Field label="Text">
                <Textarea
                  value={item.body || ""}
                  onChange={(e) =>
                    onContent(
                      "items",
                      items.map((row, j) => (j === i ? { ...row, body: e.target.value } : row)),
                    )
                  }
                />
              </Field>
              <ImageField
                label="Photo"
                hint="Upload a photo. Change it anytime from the library."
                url={item.image || null}
                onChange={(next) =>
                  onContent(
                    "items",
                    items.map((row, j) => (j === i ? { ...row, image: next?.url || "" } : row)),
                  )
                }
              />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (section.type === "brands" || section.type === "trust_badges") {
    return (
      <Field label="Items (comma separated)">
        <Textarea
          value={Array.isArray(c.items) ? (c.items as string[]).join(", ") : ""}
          onChange={(e) =>
            onContent(
              "items",
              e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
            )
          }
        />
      </Field>
    );
  }

  if (section.type === "gallery") {
    const images = Array.isArray(c.images) ? (c.images as string[]) : [];
    return (
      <>
        {common}
        <GalleryField label="Photos" images={images} onChange={(next) => onContent("images", next)} />
      </>
    );
  }

  return common;
}
