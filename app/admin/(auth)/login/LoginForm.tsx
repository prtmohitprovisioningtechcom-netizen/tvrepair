"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("admin@helixtvcare.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiPost("/auth/login", { email, password });
      router.push(params.get("next") || "/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-8 shadow-soft">
        <p className="eyebrow">Admin access</p>
        <h1 className="mt-2 font-display text-3xl">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Manage pages, services, SEO and leads.</p>
        <div className="mt-6 space-y-4">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <a href="/admin/forgot-password" className="block text-center text-sm text-muted">
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  );
}
