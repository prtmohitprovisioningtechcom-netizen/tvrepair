"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api-client";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { useUiStore } from "@/store/ui";
import type { Menu, MenuItem } from "@/models";

export default function MenusPage() {
  const toast = useUiStore((s) => s.pushToast);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [active, setActive] = useState<Menu | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    apiGet<Menu[]>("/menus").then((data) => {
      setMenus(data);
      if (data[0]) select(data[0]);
    });
  }, []);

  function flatten(list: MenuItem[], parent: number | null = null, acc: MenuItem[] = []): MenuItem[] {
    for (const item of list) {
      acc.push({ ...item, parent_id: parent, children: undefined });
      if (item.children?.length) flatten(item.children, item.id, acc);
    }
    return acc;
  }

  function select(menu: Menu) {
    setActive(menu);
    setItems(flatten(menu.items || []));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!active) return;
    await apiPut(`/menus/${active.id}`, { name: active.name, location: active.location, items });
    toast("success", "Menu saved");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Header & footer</h1>
      <AdminGuide
        changes={[
          "Header menu — links at the top of the website",
          "Footer menu — Explore links at the bottom",
          "Label = words people click. URL = where they go (/about, /contact)",
        ]}
      />
      <div className="flex flex-wrap gap-2">
        {menus.map((menu) => (
          <button key={menu.id} type="button" onClick={() => select(menu)} className={`px-3 py-2 text-sm ${active?.id === menu.id ? "bg-navy text-white" : "bg-white border border-line"}`}>
            {menu.name}
          </button>
        ))}
      </div>
      {active ? (
        <form onSubmit={onSubmit} className="space-y-4 border border-line bg-white p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Menu name" hint="For you in admin."><Input value={active.name} onChange={(e) => setActive({ ...active, name: e.target.value })} /></Field>
            <Field label="Where it shows" hint="header = top bar. footer = bottom."><Input value={active.location} onChange={(e) => setActive({ ...active, location: e.target.value })} /></Field>
          </div>
          {items.map((item, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-5">
              <Input placeholder="Words on website" value={item.label} onChange={(e) => setItems(items.map((it, idx) => idx === i ? { ...it, label: e.target.value } : it))} />
              <Input placeholder="Link e.g. /about" value={item.url} onChange={(e) => setItems(items.map((it, idx) => idx === i ? { ...it, url: e.target.value } : it))} />
              <Select value={item.target} onChange={(e) => setItems(items.map((it, idx) => idx === i ? { ...it, target: e.target.value } : it))}>
                <option value="_self">Same tab</option>
                <option value="_blank">New tab</option>
              </Select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={Boolean(item.is_enabled)} onChange={(e) => setItems(items.map((it, idx) => idx === i ? { ...it, is_enabled: e.target.checked ? 1 : 0 } : it))} /> Enabled
              </label>
              <Button type="button" variant="ghost" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>Remove</Button>
            </div>
          ))}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setItems([...items, { id: Date.now(), menu_id: active.id, parent_id: null, label: "New item", url: "/", target: "_self", sort_order: items.length, is_enabled: 1, created_at: "", updated_at: "" }])}>Add item</Button>
            <Button type="submit">Save menu</Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
