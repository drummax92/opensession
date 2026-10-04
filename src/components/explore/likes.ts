"use client";
import { useCallback } from "react";
import { useStored, writeStored } from "@/components/storage";

const KEY = "opensession:liked";
const EMPTY: string[] = [];

/** Sessions you liked (this browser only, so counts are 0 or 1 until there's a backend). */
export function useLikes() {
  const liked = useStored(KEY, EMPTY);
  const toggleLike = useCallback(
    (id: string) => writeStored(KEY, liked.includes(id) ? liked.filter((x) => x !== id) : [...liked, id]),
    [liked],
  );
  return { liked, toggleLike };
}
