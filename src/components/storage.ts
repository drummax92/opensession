"use client";
import { useMemo, useSyncExternalStore } from "react";

/** Tiny localStorage store shared by preferences, drafts, stars (per-browser only). */
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Tell every store reader that something changed. */
export const notifyStored = () => listeners.forEach((l) => l());

/** Returns false if the browser refused to store it (e.g. storage full). */
export function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return false;
  }
  notifyStored();
  return true;
}

export function removeStored(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
  notifyStored();
}

/** `fallback` must be a stable (module-level) value. */
export function useStored<T>(key: string, fallback: T): T {
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null);
  return useMemo(() => {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }, [raw, fallback]);
}

/** Raw values of several keys at once (null where missing). */
export function useStoredRawMany(keys: string[]): (string | null)[] {
  const joined = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(keys.map(read)),
    () => JSON.stringify(keys.map(() => null)),
  );
  return useMemo(() => JSON.parse(joined) as (string | null)[], [joined]);
}
