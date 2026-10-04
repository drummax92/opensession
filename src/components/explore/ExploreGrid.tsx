"use client";
import { useMemo, useState, type ReactNode } from "react";
import type { OpenSessionProject } from "@/types/session";
import { usePreferences } from "@/components/preferences/usePreferences";
import { UploadIcon } from "@/components/session/Icons";
import { useStoredRawMany } from "@/components/storage";
import { overridesKey, type ProjectOverrides } from "@/lib/projectOverrides";
import { useDrafts, visibilityOf } from "./drafts";
import ProjectCard from "./ProjectCard";
import { detectedSetup, visibleSetup } from "./setup";
import Toolbar, { NoResults, searchAndSort, type Sort, type Sortable } from "./Toolbar";
import UploadSessionDialog from "./UploadSessionDialog";
import UserSessionCard from "./UserSessionCard";

type Item = Sortable & { key: string; node: ReactNode };

const parse = (raw: string | null): ProjectOverrides => {
  try {
    return raw ? (JSON.parse(raw) as ProjectOverrides) : {};
  } catch {
    return {};
  }
};

/** Public Explore: bundled sessions + your sessions marked public. */
export default function ExploreGrid({ projects }: { projects: OpenSessionProject[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [uploading, setUploading] = useState(false);
  const drafts = useDrafts();
  const { prefs } = usePreferences();
  const ownerName = prefs.name.trim() || "You";
  const rawOverrides = useStoredRawMany(projects.map((p) => overridesKey(p.id)));

  const items = useMemo<Item[]>(
    () => [
      ...projects.map((p, i) => {
        const o = parse(rawOverrides[i]);
        const setup = visibleSetup(detectedSetup(p), {
          setup: o.setup ?? [],
          hiddenSetup: o.hiddenSetup ?? [],
          setupNames: o.setupNames ?? {},
        });
        return {
          key: p.id,
          title: p.title,
          tracks: p.tracks.length,
          time: i, // bundled sessions have no date
          fields: [p.title, ...(o.genres ?? p.genres), ...setup],
          node: <ProjectCard key={p.id} project={p} />,
        };
      }),
      ...drafts
        .filter((d) => visibilityOf(d) === "public")
        .map((d) => ({
          key: d.id,
          title: d.title,
          tracks: 0,
          time: d.createdAt,
          fields: [d.title, ...d.genres, ...d.setup],
          node: <UserSessionCard key={d.id} draft={d} ownerName={ownerName} mode="explore" />,
        })),
    ],
    [projects, rawOverrides, drafts, ownerName],
  );

  const visible = searchAndSort(items, query, sort);

  return (
    <>
      <Toolbar query={query} onQuery={setQuery} sort={sort} onSort={setSort} count={visible.length}>
        <button
          type="button"
          onClick={() => setUploading(true)}
          className="inline-flex items-center gap-2 rounded-md bg-[#238636] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2ea043] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2ea043]"
        >
          <UploadIcon /> Upload
        </button>
      </Toolbar>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map((it) => it.node)}</div>
      {query.trim() && visible.length === 0 && <NoResults query={query} onClear={() => setQuery("")} />}

      {uploading && <UploadSessionDialog drafts={drafts} onClose={() => setUploading(false)} />}
    </>
  );
}
