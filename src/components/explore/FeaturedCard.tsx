"use client";
import { PlayIcon, PencilIcon, StarIcon } from "@/components/session/Icons";
import { slugify, visibilityOf, type DraftProject } from "./drafts";
import { CardCover, VisibilityBadge, cardHover, iconBtn } from "./SessionCard";
import { setupChipClass } from "./setup";
import { tagChipClass } from "./tagColors";

/** Wide card for a starred session in My sessions. */
export default function FeaturedCard({
  draft,
  ownerName,
  onToggleStar,
  onToggleVisibility,
  onEdit,
}: {
  draft: DraftProject;
  ownerName: string;
  onToggleStar: () => void;
  onToggleVisibility: () => void;
  onEdit: () => void;
}) {
  return (
    <article className={`group overflow-hidden rounded-lg border border-[var(--os-border)] bg-[var(--os-panel)] md:flex ${cardHover} hover:scale-[1.01]`}>
      <div className="shrink-0 md:w-3/5 [&>*]:h-56 [&>*]:md:h-full [&>*]:md:min-h-[15rem] [&>*]:md:border-b-0 [&>*]:md:border-r">
        <CardCover coverUrl={draft.coverDataUrl} className="h-56" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="mb-1 inline-flex items-center gap-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-[#e3b341] [&>svg]:h-3 [&>svg]:w-3">
              <StarIcon filled /> Starred
            </span>
            <h2 className="truncate text-xl font-semibold text-[var(--os-text)]">{draft.title}</h2>
            <p className="truncate text-sm text-[var(--os-muted)]">
              {ownerName} / {slugify(draft.title)}
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button type="button" onClick={onToggleStar} aria-label={`Unstar ${draft.title}`} title="Unstar" className={`${iconBtn} text-[#e3b341]`}>
              <StarIcon filled />
            </button>
            <button type="button" onClick={onEdit} aria-label={`Edit ${draft.title}`} title="Edit" className={iconBtn}>
              <PencilIcon />
            </button>
          </div>
        </div>
        <div>
          <VisibilityBadge visibility={visibilityOf(draft)} onToggle={onToggleVisibility} />
        </div>
        {draft.description && <p className="line-clamp-3 text-sm text-[var(--os-muted)]">{draft.description}</p>}
        {draft.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {draft.genres.map((g) => (
              <span key={g} className={tagChipClass(draft.tagColors[g])}>{g}</span>
            ))}
          </div>
        )}
        {draft.setup.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {draft.setup.map((d) => (
              <span key={d} className={setupChipClass}>{d}</span>
            ))}
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            disabled
            title="Plays once the session package is imported"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-[#238636] px-4 py-2 text-sm font-semibold text-white opacity-60"
          >
            <PlayIcon /> Play session
          </button>
          <span className="text-xs text-[var(--os-muted)]">
            {draft.packageName ? `${draft.packageName} · ${draft.fileCount ?? 0} files` : "No package uploaded yet"}
          </span>
        </div>
      </div>
    </article>
  );
}
