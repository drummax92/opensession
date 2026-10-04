"use client";
import Link from "next/link";
import { useState } from "react";
import type { OpenSessionProject } from "@/types/session";
import { projectHref } from "@/lib/projects";
import { EyeIcon, PencilIcon } from "@/components/session/Icons";
import { useProjectOverrides } from "@/lib/projectOverrides";
import EditProjectDialog from "./EditProjectDialog";
import MiniTimeline from "./MiniTimeline";
import ProjectDetailsDialog from "./ProjectDetailsDialog";
import { detectedSetup, setupChipClass, visibleSetup } from "./setup";
import { tagChipClass } from "./tagColors";

const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-md border border-[var(--os-border)] bg-[var(--os-subtle)] text-[var(--os-muted)] transition hover:border-[var(--os-muted)] hover:text-[var(--os-text)] focus-visible:outline-2 focus-visible:outline-[#2f81f7]";

export default function ProjectCard({ project }: { project: OpenSessionProject }) {
  const { merged, save, reset, hasOverrides } = useProjectOverrides(project);
  const [dialog, setDialog] = useState<"edit" | "details" | null>(null);
  const href = projectHref(project);
  const detected = detectedSetup(project);

  return (
    <div className="group overflow-hidden rounded-md border border-[var(--os-border)] bg-[var(--os-panel)] transition hover:border-[var(--os-muted)]">
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        {merged.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={merged.coverUrl} alt="" className="h-28 w-full border-b border-[var(--os-border)] object-cover" />
        ) : (
          <MiniTimeline project={project} className="h-28 border-b border-[var(--os-border)]" />
        )}
      </Link>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="min-w-0 focus-visible:outline-2 focus-visible:outline-[#2f81f7]">
            <h2 className="truncate text-base font-semibold text-[var(--os-text)] group-hover:text-[#2f81f7]">
              {project.title}
            </h2>
            <p className="truncate text-xs text-[var(--os-muted)]">
              {project.owner} / {project.slug}
            </p>
          </Link>
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={() => setDialog("details")}
              aria-label={`Preview ${project.title}`}
              title="Preview project"
              className={iconBtn}
            >
              <EyeIcon />
            </button>
            <button
              type="button"
              onClick={() => setDialog("edit")}
              aria-label={`Edit ${project.title}`}
              title="Edit project"
              className={iconBtn}
            >
              <PencilIcon />
            </button>
          </div>
        </div>

        {merged.description && (
          <p className="line-clamp-2 text-sm text-[var(--os-muted)]">{merged.description}</p>
        )}

        {merged.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {merged.genres.map((g) => (
              <span key={g} className={tagChipClass(merged.tagColors[g])}>{g}</span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1 border-t border-[var(--os-subtle)] pt-2.5">
          <span className="mr-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--os-faint)]">Setup</span>
          {visibleSetup(detected, merged).map((d) => (
            <span key={d} className={setupChipClass}>{d}</span>
          ))}
        </div>
      </div>

      {dialog === "details" && (
        <ProjectDetailsDialog
          project={project}
          description={merged.description}
          genres={merged.genres}
          tagColors={merged.tagColors}
          setup={visibleSetup(detected, merged)}
          coverUrl={merged.coverUrl}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog === "edit" && (
        <EditProjectDialog
          title={project.title}
          detectedSetup={detected}
          initial={merged}
          canReset={hasOverrides}
          onSave={save}
          onReset={reset}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
