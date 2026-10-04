"use client";
import { useState } from "react";
import type { OpenSessionProject } from "@/types/session";
import { EyeIcon } from "@/components/session/Icons";
import { projectHref } from "@/lib/projects";
import { useProjectOverrides } from "@/lib/projectOverrides";
import ProjectDetailsDialog from "./ProjectDetailsDialog";
import SessionCard, { CardCover, LikeShare, iconBtn } from "./SessionCard";
import { detectedSetup, visibleSetup } from "./setup";

/** A bundled public session (e.g. the StormHacks Demo) on Explore. */
export default function ProjectCard({ project }: { project: OpenSessionProject }) {
  const { merged } = useProjectOverrides(project);
  const [preview, setPreview] = useState(false);
  const setup = visibleSetup(detectedSetup(project), merged);

  return (
    <>
      <SessionCard
        href={projectHref(project)}
        cover={<CardCover coverUrl={merged.coverUrl} project={project} />}
        title={project.title}
        subtitle={`${project.owner} / ${project.slug}`}
        description={merged.description}
        tags={merged.genres.map((g) => ({ label: g, color: merged.tagColors[g] }))}
        setup={setup}
        actions={
          <button type="button" onClick={() => setPreview(true)} aria-label={`Preview ${project.title}`} title="Preview" className={iconBtn}>
            <EyeIcon />
          </button>
        }
        footer={<LikeShare id={project.id} title={project.title} />}
      />
      {preview && (
        <ProjectDetailsDialog
          project={project}
          description={merged.description}
          genres={merged.genres}
          tagColors={merged.tagColors}
          setup={setup}
          coverUrl={merged.coverUrl}
          onClose={() => setPreview(false)}
        />
      )}
    </>
  );
}
