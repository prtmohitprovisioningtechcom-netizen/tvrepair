"use client";

import { FormEvent, useState } from "react";
import { apiPost } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const data = await apiPost<{ message?: string }>("/auth/forgot-password", { email });
    setMessage(data.message || "If the account exists, a reset was created.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-8">
        <h1 className="font-display text-3xl">Reset password</h1>
        <p className="mt-2 text-sm text-muted">
          A reset token is generated server-side. In production, connect this to email delivery.
        </p>
        <div className="mt-6 space-y-4">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Button type="submit" className="w-full">
            Send reset
          </Button>
          {message ? <p className="text-sm text-success">{message}</p> : null}
          <a href="/admin/login" className="block text-center text-sm text-muted">
            Back to login
          </a>
        </div>
      </form>
    </div>
  );
}
