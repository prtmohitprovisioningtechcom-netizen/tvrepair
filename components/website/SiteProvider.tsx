"use client";

import { SettingsContext } from "@/context/settings";
import type { SettingsMap } from "@/types";

export function SiteProvider({
  settings,
  children,
}: {
  settings: SettingsMap;
  children: React.ReactNode;
}) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}
