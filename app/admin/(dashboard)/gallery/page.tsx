"use client";

import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api-client";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useUiStore } from "@/store/ui";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { GalleryImage, Media } from "@/models";

export default function GalleryPage() {
  const toast = useUiStore((s) => s.pushToast);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function load() {
    try {
      const data = await apiGet<GalleryImage[]>("/gallery");
      setImages(data);
    } catch (err: any) {
      toast("error", err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddMedia(media: Media) {
    try {
      await apiPost("/gallery", { media_id: media.id, sort_order: images.length });
      toast("success", "Image added to gallery");
      load();
    } catch (err: any) {
      toast("error", err.message);
    }
  }

  async function updateImage(id: number, data: Partial<GalleryImage>) {
    try {
      await apiPut(`/gallery/${id}`, data);
      toast("success", "Saved");
      load();
    } catch (err: any) {
      toast("error", err.message);
    }
  }

  async function deleteImage(id: number) {
    try {
      await apiDelete(`/gallery/${id}`);
      toast("success", "Removed from gallery");
      load();
    } catch (err: any) {
      toast("error", err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="font-display text-3xl">Gallery</h1>
          <p className="mt-1 text-sm text-muted">Manage the images displayed on the public gallery page.</p>
        </div>
        <Button onClick={() => setPickerOpen(true)}>Add Photo</Button>
      </div>

      <AdminGuide changes={["Add photos to showcase your work.", "Change the sort order or caption."]} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-line bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image_url!} alt={item.alt_text || ""} className="h-48 w-full object-cover" />
            <div className="p-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Caption</label>
                <Input
                  defaultValue={item.caption || ""}
                  placeholder="Optional caption"
                  onBlur={(e) => {
                    if (e.target.value !== (item.caption || "")) {
                      updateImage(item.id, { ...item, caption: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-muted">Sort Order</label>
                  <Input
                    type="number"
                    defaultValue={item.sort_order}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val !== item.sort_order) {
                        updateImage(item.id, { ...item, sort_order: val });
                      }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-muted">Visible</label>
                  <select
                    className="w-full rounded-xl border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-copper"
                    value={item.is_visible}
                    onChange={(e) => {
                      updateImage(item.id, { ...item, is_visible: Number(e.target.value) });
                    }}
                  >
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                className="mt-2 text-xs text-danger"
                onClick={() => deleteImage(item.id)}
              >
                Remove from Gallery
              </button>
            </div>
          </article>
        ))}
        {images.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted">
            No images in the gallery yet. Click "Add Photo" to start.
          </div>
        )}
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddMedia}
        multiple={true}
      />
    </div>
  );
}
