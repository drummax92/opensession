"use client";
import Logo from "@/components/Logo";
import { visibilityOf, type DraftProject } from "./drafts";
import Modal from "./Modal";
import { setupChipClass } from "./setup";
import { VisibilityBadge } from "./SessionCard";
import { tagChipClass } from "./tagColors";

const heading = "mb-2 text-xs font-semibold text-[var(--os-muted)]";

/** Read-only preview of one of your sessions. */
export default function SessionDetailsDialog({ draft, owner, onClose }: { draft: DraftProject; owner: string; onClose: () => void }) {
  return (
    <Modal wide title={draft.title} subtitle={owner} onClose={onClose}>
      {draft.coverDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={draft.coverDataUrl} alt={`${draft.title} cover`} className="max-h-80 w-full rounded-md border border-[var(--os-border)] bg-[var(--os-bg)] object-contain" />
      ) : (
        <div className="flex h-36 items-center justify-center rounded-md border border-[var(--os-border)] bg-[var(--os-bg)]">
          <Logo className="h-14 w-14 opacity-30" />
        </div>
      )}
      <VisibilityBadge visibility={visibilityOf(draft)} />
      {draft.description && (
        <section>
          <h3 className={heading}>Description</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{draft.description}</p>
        </section>
      )}
      {draft.genres.length > 0 && (
        <section>
          <h3 className={heading}>Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {draft.genres.map((g) => (
              <span key={g} className={tagChipClass(draft.tagColors[g])}>{g}</span>
            ))}
          </div>
        </section>
      )}
      {draft.setup.length > 0 && (
        <section>
          <h3 className={heading}>Setup</h3>
          <div className="flex flex-wrap gap-1.5">
            {draft.setup.map((d) => (
              <span key={d} className={setupChipClass}>{d}</span>
            ))}
          </div>
        </section>
      )}
      <section>
        <h3 className={heading}>Session package</h3>
        <p className="text-sm text-[var(--os-muted)]">
          {draft.packageName
            ? `${draft.packageName} · ${draft.fileCount ?? 0} files. It opens as a session once import is connected.`
            : "No package uploaded yet."}
        </p>
      </section>
    </Modal>
  );
}
