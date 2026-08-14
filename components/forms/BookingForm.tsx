"use client";

import { FormEvent, useState } from "react";
import { apiPost } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/ui";

const FULL_FIELDS = [
  ["customer_name", "Full name", "text", "Amit Sharma"],
  ["phone", "Phone", "tel", "85109 51545"],
  ["email", "Email", "email", "you@email.com"],
  ["tv_brand", "TV brand", "text", "Samsung, LG, Sony…"],
  ["tv_type", "TV type", "text", "LED, OLED, Smart TV"],
  ["tv_size", "TV size", "text", "43 inch"],
  ["address", "Address", "text", "House / society"],
  ["city", "City", "text", "Noida"],
  ["pincode", "Pincode", "text", "201301"],
  ["preferred_date", "Preferred date", "date", ""],
  ["preferred_time", "Preferred time", "text", "Morning / evening"],
] as const;

const PANEL_FIELDS = [
  ["customer_name", "Full name", "text", "Amit Sharma"],
  ["phone", "Phone", "tel", "85109 51545"],
  ["city", "City", "text", "Noida"],
  ["tv_type", "TV type", "text", "LED, OLED, Smart TV"],
] as const;

export function BookingForm({
  compact = false,
  variant,
  source = "booking-form",
  onSuccess,
}: {
  compact?: boolean;
  variant?: "full" | "panel";
  source?: string;
  onSuccess?: () => void;
}) {
  const toast = useUiStore((s) => s.pushToast);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const mode = variant || (compact ? "panel" : "full");
  const fields = mode === "panel" ? PANEL_FIELDS : FULL_FIELDS;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost("/leads", { ...form, source });
      toast("success", "Request received. Our desk will call you shortly.");
      setForm({});
      onSuccess?.();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2 sm:space-y-4">
      <div className={`grid gap-2 sm:gap-4 ${mode === "panel" ? "grid-cols-2" : "sm:grid-cols-2"}`}>
        {fields.map(([name, label, type, placeholder]) => (
          <label key={name} className="block min-w-0">
            <span className="mb-1 block text-xs font-semibold tracking-wide text-muted">{label}</span>
            <input
              required={name === "customer_name" || name === "phone"}
              type={type}
              placeholder={placeholder}
              className="site-input py-2 sm:py-[0.78rem]"
              value={form[name] || ""}
              onChange={(e) => setForm({ ...form, [name]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <label className={mode === "panel" ? "col-span-2 block" : "block"}>
        <span className="mb-1 block text-xs font-semibold tracking-wide text-muted">What is wrong with the TV?</span>
        <textarea
          className="site-input min-h-16 py-2 sm:min-h-24 sm:py-[0.78rem]"
          placeholder="No picture, no power, lines on screen…"
          value={form.problem || ""}
          onChange={(e) => setForm({ ...form, problem: e.target.value })}
        />
      </label>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending…" : "Request a technician"}
      </Button>
    </form>
  );
}
