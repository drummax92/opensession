"use client";
import { useCallback } from "react";
import { useStored, writeStored } from "@/components/storage";

const KEY = "opensession:starred";
const EMPTY: string[] = [];

/** Starred project ids (this browser only). */
export function useStarred() {
  const starred = useStored(KEY, EMPTY);
  const toggleStar = useCallback(
    (id: string) => writeStored(KEY, starred.includes(id) ? starred.filter((x) => x !== id) : [...starred, id]),
    [starred],
  );
  return { starred, toggleStar };
}
