"use client";

import { FormEvent, useState } from "react";
import { apiPost } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/ui";

export function ContactForm() {
  const toast = useUiStore((s) => s.pushToast);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ customer_name: "", phone: "", email: "", message: "", city: "" });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost("/leads", { ...form, source: "contact-form" });
      toast("success", "Message sent. We will get back to you.");
      setForm({ customer_name: "", phone: "", email: "", message: "", city: "" });
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <label>
        <span className="mb-1.5 block text-xs font-medium text-muted">Name</span>
        <input className="site-input" placeholder="Your name" required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
      </label>
      <label>
        <span className="mb-1.5 block text-xs font-medium text-muted">Phone</span>
        <input className="site-input" placeholder="Phone number" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </label>
      <label>
        <span className="mb-1.5 block text-xs font-medium text-muted">Email</span>
        <input className="site-input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      <label>
        <span className="mb-1.5 block text-xs font-medium text-muted">City</span>
        <input className="site-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
      </label>
      <label>
        <span className="mb-1.5 block text-xs font-medium text-muted">Message</span>
        <textarea className="site-input min-h-28" placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </label>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending…" : "Send message"}</Button>
    </form>
  );
}
