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
  "flex h-8 w-8 items-center justify-center rounded-md border border-[#30363d] bg-[#21262d] text-[#8b949e] transition hover:border-[#8b949e] hover:text-[#e6edf3] focus-visible:outline-2 focus-visible:outline-[#2f81f7]";

export default function ProjectCard({ project }: { project: OpenSessionProject }) {
  const { merged, save, reset, hasOverrides } = useProjectOverrides(project);
  const [dialog, setDialog] = useState<"edit" | "details" | null>(null);
  const href = projectHref(project);
  const detected = detectedSetup(project);

  return (
    <div className="group overflow-hidden rounded-md border border-[#30363d] bg-[#161b22] transition hover:border-[#8b949e]">
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        {merged.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={merged.coverUrl} alt="" className="h-28 w-full border-b border-[#30363d] object-cover" />
        ) : (
          <MiniTimeline project={project} className="h-28 border-b border-[#30363d]" />
        )}
      </Link>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="min-w-0 focus-visible:outline-2 focus-visible:outline-[#2f81f7]">
            <h2 className="truncate text-base font-semibold text-[#e6edf3] group-hover:text-[#2f81f7]">
              {project.title}
            </h2>
            <p className="truncate text-xs text-[#8b949e]">
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
          <p className="line-clamp-2 text-sm text-[#8b949e]">{merged.description}</p>
        )}

        {merged.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {merged.genres.map((g) => (
              <span key={g} className={tagChipClass(merged.tagColors[g])}>{g}</span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1 border-t border-[#21262d] pt-2.5">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-[#6e7681]">Setup</span>
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
