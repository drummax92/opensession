"use client";
import { useStored, writeStored } from "@/components/storage";
import type { TagColor } from "./tagColors";

export type Visibility = "public" | "private";

/** A session you created or uploaded. Lives in this browser. */
export interface DraftProject {
  id: string;
  title: string;
  description: string;
  genres: string[];
  tagColors: Record<string, TagColor>;
  setup: string[];
  coverDataUrl?: string;
  createdAt: number;
  /** Public sessions also appear on Explore. Older drafts without it are private. */
  visibility?: Visibility;
  /** Name and size of the picked session package (files themselves aren't stored). */
  packageName?: string;
  fileCount?: number;
}

export interface PackageInfo {
  name: string;
  fileCount: number;
}

const KEY = "opensession:drafts";
const EMPTY: DraftProject[] = [];

export const useDrafts = () => useStored(KEY, EMPTY);
export const visibilityOf = (d: DraftProject): Visibility => d.visibility ?? "private";

export const saveDraft = (d: DraftProject, all: DraftProject[]) =>
  writeStored(KEY, all.some((x) => x.id === d.id) ? all.map((x) => (x.id === d.id ? d : x)) : [...all, d]);

export const deleteDraft = (id: string, all: DraftProject[]) =>
  writeStored(KEY, all.filter((x) => x.id !== id));

export const newDraftId = () => `draft-${Date.now().toString(36)}`;

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled";

/** Folder name (or "Selected files") and count, from a file picker selection. */
export function packageInfo(files: File[]): PackageInfo {
  const first = files[0] as (File & { webkitRelativePath?: string }) | undefined;
  const folder = first?.webkitRelativePath?.split("/")[0];
  return { name: folder || (files.length === 1 ? first!.name : "Selected files"), fileCount: files.length };
}
