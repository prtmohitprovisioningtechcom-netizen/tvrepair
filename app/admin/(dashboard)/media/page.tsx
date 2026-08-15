"use client";

import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPut } from "@/lib/api-client";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { useUiStore } from "@/store/ui";
import type { Media } from "@/models";
import type { PaginatedResult } from "@/types";

export default function MediaPage() {
  const toast = useUiStore((s) => s.pushToast);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResult<Media> | null>(null);
  async function load() {
    setResult(await apiGet("/media", { q, page, pageSize: 16 }));
  }
  useEffect(() => {
    load();
  }, [page]);
  async function upload(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("title", file.name);
    const res = await fetch("/api/media", { method: "POST", body: form, credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload failed");
    toast("success", "Uploaded");
    load();
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="font-display text-3xl">Photos</h1>
          <p className="mt-1 text-sm text-muted">Upload here, then pick the photo on a page or service.</p>
        </div>
        <label className="btn-primary cursor-pointer">
          Upload
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0]).catch((err) => toast("error", err.message))}
          />
        </label>
      </div>
      <AdminGuide
        changes={[
          "Upload a photo here",
          "Then open Pages or TV services and click Change / Upload to use it",
        ]}
      />
      <div className="flex gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="max-w-xs" />
        <Button type="button" variant="outline" onClick={load}>
          Search
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {result?.data.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-line bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.alt_text || ""} className="h-36 w-full object-cover" />
            <div className="p-3">
              <Input
                defaultValue={item.alt_text || ""}
                placeholder="Alt text"
                onBlur={(e) => apiPut(`/media/${item.id}`, { alt_text: e.target.value, title: item.title })}
              />
              <button
                type="button"
                className="mt-2 text-xs text-danger"
                onClick={async () => {
                  await apiDelete(`/media/${item.id}`);
                  load();
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
      <Pagination page={result?.page || 1} totalPages={result?.totalPages || 1} onPage={setPage} />
    </div>
  );
}
