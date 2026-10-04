"use client";
import { useCallback, useMemo } from "react";
import { removeStored, useStored, writeStored } from "@/components/storage";

export type Theme = "dark" | "light";
export type FontSize = "small" | "default" | "large";
export interface Preferences {
  name: string;
  theme: Theme;
  fontSize: FontSize;
  /** Background blur in px (0–30). */
  blur: number;
}

export const PREFS_KEY = "opensession:prefs"; // also read by the script in app/layout.tsx
export const BACKGROUND_KEY = "opensession:background"; // image kept separately (it's large)
const DEFAULTS: Preferences = { name: "", theme: "dark", fontSize: "default", blur: 8 };
const EMPTY: Partial<Preferences> = {};
const NO_BG: string | null = null;

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

export function useBackground() {
  const background = useStored(BACKGROUND_KEY, NO_BG);
  /** Returns false if the image was too large to store. */
  const setBackground = useCallback((dataUrl: string | null) => {
    const ok = dataUrl ? writeStored(BACKGROUND_KEY, dataUrl) : (removeStored(BACKGROUND_KEY), true);
    document.documentElement.dataset.bg = dataUrl && ok ? "on" : "off";
    return ok;
  }, []);
  return { background, setBackground };
}
