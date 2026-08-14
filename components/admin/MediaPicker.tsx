"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import type { Media } from "@/models";
import type { PaginatedResult } from "@/types";
import { useUiStore } from "@/store/ui";

export function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (media: Media) => void;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResult<Media> | null>(null);
  const pushToast = useUiStore((s) => s.pushToast);

  async function load() {
    const data = await apiGet<PaginatedResult<Media>>("/media", { q, page, pageSize: 12 });
    setResult(data);
  }

  useEffect(() => {
    if (open) load().catch((e) => pushToast("error", e.message));
  }, [open, page]);

  async function upload(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("title", file.name);
    const res = await fetch("/api/media", { method: "POST", body: form, credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    await load();
    pushToast("success", "Image uploaded");
    onSelect(data as Media);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-navy/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-display text-xl">Choose a photo</h3>
          <Button variant="ghost" type="button" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex gap-3 border-b border-line px-5 py-3">
          <Input
            placeholder="Search images"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <Button type="button" variant="outline" onClick={load}>
            Search
          </Button>
          <label className="btn-navy cursor-pointer px-4 py-2 text-sm">
            Upload
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file).catch((err) => pushToast("error", err.message));
              }}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto p-5 sm:grid-cols-4">
          {result?.data.map((item) => (
            <button
              key={item.id}
              type="button"
              className="overflow-hidden rounded-xl border border-line text-left transition hover:border-copper"
              onClick={() => {
                onSelect(item);
                onClose();
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.alt_text || item.title || ""} className="h-24 w-full object-cover" />
              <p className="truncate px-2 py-2 text-xs text-muted">{item.original_name}</p>
            </button>
          ))}
        </div>
        <div className="px-5 pb-4">
          <Pagination
            page={result?.page || 1}
            totalPages={result?.totalPages || 1}
            onPage={setPage}
          />
        </div>
      </div>
    </div>
  );
}
