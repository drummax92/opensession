"use client";
import { useCallback, useMemo } from "react";
import { useStored, writeStored } from "@/components/storage";

export type Theme = "dark" | "light";
export type FontSize = "small" | "default" | "large";
export interface Preferences {
  name: string;
  theme: Theme;
  fontSize: FontSize;
}

export const PREFS_KEY = "opensession:prefs"; // also read by the script in app/layout.tsx
const DEFAULTS: Preferences = { name: "", theme: "dark", fontSize: "default" };
const EMPTY: Partial<Preferences> = {};

function apply(p: Preferences) {
  const d = document.documentElement;
  d.dataset.theme = p.theme;
  d.dataset.font = p.fontSize;
}

export function usePreferences() {
  const stored = useStored(PREFS_KEY, EMPTY);
  const prefs = useMemo<Preferences>(() => ({ ...DEFAULTS, ...stored }), [stored]);
  const update = useCallback(
    (patch: Partial<Preferences>) => {
      const next = { ...prefs, ...patch };
      writeStored(PREFS_KEY, next);
      apply(next);
    },
    [prefs],
  );
  return { prefs, update };
}
