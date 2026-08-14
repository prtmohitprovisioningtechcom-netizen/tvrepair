"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "@/lib/api-client";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { useUiStore } from "@/store/ui";
import type { User } from "@/models";

export default function UsersPage() {
  const toast = useUiStore((s) => s.pushToast);
  const [users, setUsers] = useState<Omit<User, "password_hash">[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" });
  async function load() { setUsers(await apiGet("/users")); }
  useEffect(() => { load().catch((e) => toast("error", e.message)); }, []);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await apiPost("/users", form);
    toast("success", "User created");
    load();
  }
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Staff logins</h1>
      <AdminGuide title="This does not change the website" changes={["Only who can open this admin panel."]} />
      <form onSubmit={onSubmit} className="grid gap-3 border border-line bg-white p-5 md:grid-cols-4">
        <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
        <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
        <Field label="Password"><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></Field>
        <Field label="Role">
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="technician">Technician</option>
          </Select>
        </Field>
        <Button type="submit">Add user</Button>
      </form>
      <AdminTable headers={["Name", "Email", "Role", ""]} empty={!users.length}>
        {users.map((user) => (
          <tr key={user.id}>
            <td className="px-4 py-3">{user.name}</td>
            <td className="px-4 py-3">{user.email}</td>
            <td className="px-4 py-3">{user.role}</td>
            <td className="px-4 py-3 text-right">
              <button type="button" className="text-sm text-danger" onClick={async () => { await apiDelete(`/users/${user.id}`); load(); }}>Delete</button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
