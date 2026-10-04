"use client";
import { useState } from "react";
import { usePreferences } from "@/components/preferences/usePreferences";
import { PlusIcon } from "@/components/session/Icons";
import DraftEditor from "./DraftEditor";
import { saveDraft, useDrafts, visibilityOf, type DraftProject } from "./drafts";
import FeaturedCard from "./FeaturedCard";
import { cardHover } from "./SessionCard";
import { useStarred } from "./starred";
import Toolbar, { NoResults, searchAndSort, type Sort } from "./Toolbar";
import UserSessionCard from "./UserSessionCard";

/** Your sessions (public and private): star, edit, change visibility, create new. */
export default function MySessionsGrid() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [editing, setEditing] = useState<DraftProject | "new" | null>(null);
  const drafts = useDrafts();
  const { starred, toggleStar } = useStarred();
  const { prefs } = usePreferences();
  const ownerName = prefs.name.trim() || "You";

  const toggleVisibility = (d: DraftProject) =>
    saveDraft({ ...d, visibility: visibilityOf(d) === "public" ? "private" : "public" }, drafts);

  const visible = searchAndSort(
    drafts.map((d) => ({ draft: d, title: d.title, tracks: 0, time: d.createdAt, fields: [d.title, ...d.genres, ...d.setup] })),
    query,
    sort,
  );
  const featured = visible.filter((it) => starred.includes(it.draft.id));
  const rest = visible.filter((it) => !starred.includes(it.draft.id));

  return (
    <>
      <Toolbar query={query} onQuery={setQuery} sort={sort} onSort={setSort} count={visible.length} />

      {featured.length > 0 && (
        <div className="mt-6 space-y-4">
          {featured.map(({ draft: d }) => (
            <FeaturedCard
              key={d.id}
              draft={d}
              ownerName={ownerName}
              onToggleStar={() => toggleStar(d.id)}
              onToggleVisibility={() => toggleVisibility(d)}
              onEdit={() => setEditing(d)}
            />
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map(({ draft: d }) => (
          <UserSessionCard
            key={d.id}
            draft={d}
            ownerName={ownerName}
            mode="mine"
            starred={false}
            onToggleStar={() => toggleStar(d.id)}
            onToggleVisibility={() => toggleVisibility(d)}
            onEdit={() => setEditing(d)}
          />
        ))}

        {!query.trim() && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className={`group flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-[var(--os-border)] text-[var(--os-muted)] hover:bg-[var(--os-panel)] hover:text-[var(--os-text)] focus-visible:outline-2 focus-visible:outline-[#2f81f7] ${cardHover}`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--os-border)] bg-[var(--os-subtle)] transition group-hover:border-[var(--os-muted)] [&>svg]:h-6 [&>svg]:w-6">
              <PlusIcon />
            </span>
            <span className="text-sm font-medium">New session</span>
          </button>
        )}
      </div>

      {query.trim() && visible.length === 0 && <NoResults query={query} onClear={() => setQuery("")} />}

      {editing && <DraftEditor drafts={drafts} editing={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
