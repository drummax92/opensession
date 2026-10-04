"use client";
import { useState } from "react";
import { EyeIcon, PencilIcon, StarIcon } from "@/components/session/Icons";
import { slugify, visibilityOf, type DraftProject } from "./drafts";
import SessionCard, { CardCover, LikeShare, VisibilityBadge, iconBtn } from "./SessionCard";
import SessionDetailsDialog from "./SessionDetailsDialog";

interface Props {
  draft: DraftProject;
  ownerName: string;
  /** "explore": public view with likes. "mine": your view with star, edit and visibility. */
  mode: "explore" | "mine";
  starred?: boolean;
  onToggleStar?: () => void;
  onToggleVisibility?: () => void;
  onEdit?: () => void;
}

export default function UserSessionCard({ draft, ownerName, mode, starred, onToggleStar, onToggleVisibility, onEdit }: Props) {
  const [preview, setPreview] = useState(false);
  const owner = `${ownerName} / ${slugify(draft.title)}`;
  const eye = (
    <button type="button" onClick={() => setPreview(true)} aria-label={`Preview ${draft.title}`} title="Preview" className={iconBtn}>
      <EyeIcon />
    </button>
  );

  return (
    <>
      <SessionCard
        cover={<CardCover coverUrl={draft.coverDataUrl} />}
        title={draft.title}
        subtitle={owner}
        description={draft.description}
        tags={draft.genres.map((g) => ({ label: g, color: draft.tagColors[g] }))}
        setup={draft.setup}
        badge={mode === "mine" ? <VisibilityBadge visibility={visibilityOf(draft)} onToggle={onToggleVisibility} /> : undefined}
        actions={
          mode === "mine" ? (
            <>
              <button
                type="button"
                onClick={onToggleStar}
                aria-pressed={starred}
                aria-label={`${starred ? "Unstar" : "Star"} ${draft.title}`}
                title={starred ? "Unstar" : "Star (feature at the top)"}
                className={starred ? `${iconBtn} text-[#e3b341]` : iconBtn}
              >
                <StarIcon filled={starred} />
              </button>
              {eye}
              <button type="button" onClick={onEdit} aria-label={`Edit ${draft.title}`} title="Edit" className={iconBtn}>
                <PencilIcon />
              </button>
            </>
          ) : (
            eye
          )
        }
        footer={
          mode === "explore" ? (
            <LikeShare id={draft.id} title={draft.title} />
          ) : (
            <span className="truncate px-1 py-1 text-xs text-[var(--os-faint)]">
              {draft.packageName ? `Package: ${draft.packageName} · ${draft.fileCount ?? 0} files` : "No package uploaded yet"}
            </span>
          )
        }
      />
      {preview && <SessionDetailsDialog draft={draft} owner={owner} onClose={() => setPreview(false)} />}
    </>
  );
}
