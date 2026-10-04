"use client";
import { useStored, writeStored } from "@/components/storage";
import type { TagColor } from "./tagColors";

/** A project started from the "+" tile. Lives in this browser until a session package is imported. */
export interface DraftProject {
  id: string;
  title: string;
  description: string;
  genres: string[];
  tagColors: Record<string, TagColor>;
  setup: string[];
  coverDataUrl?: string;
  createdAt: number;
}

const KEY = "opensession:drafts";
const EMPTY: DraftProject[] = [];

export const useDrafts = () => useStored(KEY, EMPTY);

export const saveDraft = (d: DraftProject, all: DraftProject[]) =>
  writeStored(KEY, all.some((x) => x.id === d.id) ? all.map((x) => (x.id === d.id ? d : x)) : [...all, d]);

export const deleteDraft = (id: string, all: DraftProject[]) =>
  writeStored(KEY, all.filter((x) => x.id !== id));

export const newDraftId = () => `draft-${Date.now().toString(36)}`;
