"use client";

import { createContext, useContext } from "react";
import type { SettingsMap } from "@/types";

export const SettingsContext = createContext<SettingsMap>({});

export function useSettings() {
  return useContext(SettingsContext);
}

export function setting(map: SettingsMap, key: string, fallback = "") {
  return map[key] || fallback;
}
