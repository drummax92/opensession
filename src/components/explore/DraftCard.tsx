"use client";
import Logo from "@/components/Logo";
import { PencilIcon } from "@/components/session/Icons";
import type { DraftProject } from "./drafts";
import { setupChipClass } from "./setup";
import { tagChipClass } from "./tagColors";

export default function DraftCard({ draft, onEdit }: { draft: DraftProject; onEdit: () => void }) {
  return (
    <div className="overflow-hidden rounded-md border border-[var(--os-border)] bg-[var(--os-panel)]">
      {draft.coverDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={draft.coverDataUrl} alt="" className="h-28 w-full border-b border-[var(--os-border)] object-cover" />
      ) : (
        <div className="flex h-28 items-center justify-center border-b border-[var(--os-border)] bg-[var(--os-bg)]">
          <Logo className="h-10 w-10 opacity-30" />
        </div>
      )}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-[var(--os-text)]">{draft.title}</h2>
            <p className="flex items-center gap-1.5 text-xs text-[var(--os-muted)]">
              <span className="rounded border border-[#d29922]/60 px-1.5 text-[0.6875rem] font-medium text-[#d29922]">Draft</span>
              no session uploaded yet
            </p>
          </div>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${draft.title}`}
            title="Edit project"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--os-border)] bg-[var(--os-subtle)] text-[var(--os-muted)] transition hover:border-[var(--os-muted)] hover:text-[var(--os-text)] focus-visible:outline-2 focus-visible:outline-[#2f81f7]"
          >
            <PencilIcon />
          </button>
        </div>
        {draft.description && <p className="line-clamp-2 text-sm text-[var(--os-muted)]">{draft.description}</p>}
        {draft.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {draft.genres.map((g) => (
              <span key={g} className={tagChipClass(draft.tagColors[g])}>{g}</span>
            ))}
          </div>
        )}
        {draft.setup.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 border-t border-[var(--os-subtle)] pt-2.5">
            <span className="mr-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--os-faint)]">Setup</span>
            {draft.setup.map((d) => (
              <span key={d} className={setupChipClass}>{d}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
