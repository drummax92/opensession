"use client";
import type { ReactNode } from "react";
import { SearchIcon } from "@/components/session/Icons";

export type Sort = "newest" | "az" | "tracks";

export interface Sortable {
  title: string;
  tracks: number;
  time: number;
  fields: string[];
}

const SORTERS: Record<Sort, (a: Sortable, b: Sortable) => number> = {
  newest: (a, b) => b.time - a.time,
  az: (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
  tracks: (a, b) => b.tracks - a.tracks || a.title.localeCompare(b.title),
};

export function searchAndSort<T extends Sortable>(items: T[], query: string, sort: Sort): T[] {
  const q = query.trim().toLowerCase();
  return items.filter((it) => !q || it.fields.some((f) => f.toLowerCase().includes(q))).sort(SORTERS[sort]);
}

interface Props {
  query: string;
  onQuery: (q: string) => void;
  sort: Sort;
  onSort: (s: Sort) => void;
  count: number;
  children?: ReactNode;
}

/** Search box + sort dropdown + count, with an optional button slot. */
export default function Toolbar({ query, onQuery, sort, onSort, count, children }: Props) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <label className="relative min-w-[14rem] flex-1 sm:max-w-md">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--os-faint)]">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by title, tag or setup…"
          aria-label="Search sessions"
          className="w-full rounded-md border border-[var(--os-border)] bg-[var(--os-panel)] py-2 pl-9 pr-3 text-sm text-[var(--os-text)] placeholder:text-[var(--os-faint)] focus:border-[#2f81f7] focus:outline-none"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-[var(--os-muted)]">
        Sort
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as Sort)}
          className="rounded-md border border-[var(--os-border)] bg-[var(--os-panel)] px-2.5 py-2 text-sm text-[var(--os-text)] focus:border-[#2f81f7] focus:outline-none"
        >
          <option value="newest">Newest</option>
          <option value="az">A–Z</option>
          <option value="tracks">Most tracks</option>
        </select>
      </label>
      {children}
      <span className="ml-auto text-xs text-[var(--os-faint)]">
        {count} {count === 1 ? "session" : "sessions"}
      </span>
    </div>
  );
}

export function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="mt-6 rounded-md border border-dashed border-[var(--os-border)] p-8 text-center">
      <p className="text-sm text-[var(--os-muted)]">No sessions match “{query.trim()}”.</p>
      <button type="button" onClick={onClear} className="mt-2 text-sm text-[#2f81f7] hover:underline">
        Clear search
      </button>
    </div>
  );
}
