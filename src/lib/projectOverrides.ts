"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { OpenSessionProject } from "@/types/session";
import type { TagColor } from "@/components/explore/tagColors";

/**
 * Local, per-browser edits to a project's display details.
 * Saved in localStorage only — other people (and the deployed demo) still see the original.
 */
export interface ProjectOverrides {
  description?: string;
  genres?: string[];
  tagColors?: Record<string, TagColor>;
  /** Extra setup labels the user adds (gear, software). */
  setup?: string[];
  coverDataUrl?: string;
}

const key = (id: string) => `opensession:overrides:${id}`;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function read(id: string) {
  try {
    return localStorage.getItem(key(id));
  } catch {
    return null;
  }
}

export function useProjectOverrides(project: OpenSessionProject) {
  const raw = useSyncExternalStore(subscribe, () => read(project.id), () => null);

  const overrides = useMemo<ProjectOverrides>(() => {
    if (!raw) return {};
    try {
      return JSON.parse(raw) as ProjectOverrides;
    } catch {
      return {};
    }
  }, [raw]);

  /** Returns false if the browser refused to store it (e.g. image too large). */
  const save = useCallback(
    (next: ProjectOverrides) => {
      try {
        localStorage.setItem(key(project.id), JSON.stringify(next));
      } catch {
        return false;
      }
      listeners.forEach((l) => l());
      return true;
    },
    [project.id],
  );

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(key(project.id));
    } catch {}
    listeners.forEach((l) => l());
  }, [project.id]);

  const merged = {
    description: overrides.description ?? project.description ?? "",
    genres: overrides.genres ?? project.genres,
    tagColors: overrides.tagColors ?? {},
    setup: overrides.setup ?? [],
    coverUrl: overrides.coverDataUrl ?? project.coverUrl,
  };

  return { merged, save, reset, hasOverrides: raw !== null };
}
