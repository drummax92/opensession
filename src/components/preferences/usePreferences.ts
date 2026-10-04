"use client";
import { useCallback, useMemo } from "react";
import { removeStored, useStored, writeStored } from "@/components/storage";
import defaultBackground from "./default-bg.jpg";

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

export type BackgroundMode = "default" | "custom" | "none";

/**
 * Background picture. Nothing saved = the OpenSession default image;
 * "none" = no picture; anything else = your own image (data URL).
 */
export function useBackground() {
  const stored = useStored(BACKGROUND_KEY, NO_BG);
  const mode: BackgroundMode = stored === null ? "default" : stored === "none" ? "none" : "custom";
  const background = mode === "default" ? defaultBackground.src : mode === "none" ? null : stored;

  /** Use your own image. Returns false if it was too large to store. */
  const setBackground = useCallback((dataUrl: string) => {
    const ok = writeStored(BACKGROUND_KEY, dataUrl);
    if (ok) document.documentElement.dataset.bg = "on";
    return ok;
  }, []);
  const resetToDefault = useCallback(() => {
    removeStored(BACKGROUND_KEY);
    document.documentElement.dataset.bg = "on";
  }, []);
  const setNone = useCallback(() => {
    writeStored(BACKGROUND_KEY, "none");
    document.documentElement.dataset.bg = "off";
  }, []);

  return { background, mode, setBackground, resetToDefault, setNone };
}
