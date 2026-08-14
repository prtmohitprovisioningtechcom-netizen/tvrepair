import { execute, insertId, query, queryOne } from "@/lib/db/query";
import type { Setting } from "@/models";
import type { SettingsMap } from "@/types";

export async function getSettingsMap(): Promise<SettingsMap> {
  const rows = await query<Setting>("SELECT setting_key, setting_value FROM settings");
  const map: SettingsMap = {};
  for (const row of rows) {
    map[row.setting_key] = row.setting_value || "";
  }
  return map;
}

export async function getSetting(key: string): Promise<string> {
  const row = await queryOne<Setting>(
    "SELECT setting_value FROM settings WHERE setting_key = ?",
    [key],
  );
  return row?.setting_value || "";
}

export async function upsertSettings(values: Record<string, string | null>) {
  for (const [key, value] of Object.entries(values)) {
    const group = key.includes(".") ? key.split(".")[0] : "general";
    const existing = await queryOne<{ id: number }>(
      "SELECT id FROM settings WHERE setting_key = ?",
      [key],
    );
    if (existing) {
      await execute("UPDATE settings SET setting_value = ? WHERE id = ?", [
        value,
        existing.id,
      ]);
    } else {
      await insertId(
        "INSERT INTO settings (setting_key, setting_value, group_name) VALUES (?,?,?)",
        [key, value, group],
      );
    }
  }
}
