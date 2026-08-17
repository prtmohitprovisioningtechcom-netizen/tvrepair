"use client";

import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import type { Media } from "@/models";

export type PickedImage = { id: number; url: string };

export function ImageField({
  label,
  hint,
  url,
  onChange,
  size = "banner",
}: {
  label: string;
  hint?: string;
  url?: string | null;
  onChange: (next: PickedImage | null) => void;
  size?: "banner" | "square";
}) {
  const [open, setOpen] = useState(false);
  const frame = size === "square" ? "h-28 w-28" : "h-44 w-full";

  return (
    <Field label={label} hint={hint}>
      {url ? (
        <div className={`overflow-hidden rounded-2xl border border-line bg-cream ${size === "square" ? "w-fit" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className={`${frame} object-cover`} />
          <div className="flex gap-2 bg-white p-2">
            <Button type="button" variant="outline" className="text-sm" onClick={() => setOpen(true)}>
              Change
            </Button>
            <Button type="button" variant="ghost" className="text-sm text-danger" onClick={() => onChange(null)}>
              <Trash2 size={14} />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`flex ${frame} flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-cream text-sm text-muted transition hover:border-copper hover:text-navy`}
        >
          <ImagePlus size={22} />
          {size === "square" ? "Upload" : "Upload or choose from library"}
        </button>
      )}
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(media: Media) => onChange({ id: media.id, url: media.url })}
      />
    </Field>
  );
}

export function GalleryField({
  label,
  images,
  onChange,
}: {
  label: string;
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:col-span-2">
      <Field label={label} hint="Upload photos of the work. These show on the website.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((imageUrl, itemIndex) => {
            const safeKey = String(imageUrl) + "-idx-" + String(itemIndex);
            return (
              <div key={safeKey} className="relative overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="h-28 w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-xs text-danger"
                  onClick={() => onChange(images.filter((_, filterIndex) => filterIndex !== itemIndex))}
                >
                  Remove
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-28 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-cream text-xs text-muted hover:border-copper"
          >
            <ImagePlus size={18} />
            Add photo
          </button>
        </div>
      </Field>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(media) => onChange([...images, media.url])}
      />
    </div>
  );
}
