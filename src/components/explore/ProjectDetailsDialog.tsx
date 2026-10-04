"use client";
import Link from "next/link";
import type { OpenSessionProject } from "@/types/session";
import { formatTime, trackColor } from "@/components/session/format";
import { projectHref } from "@/lib/projects";
import MiniTimeline from "./MiniTimeline";
import Modal from "./Modal";
import { setupChipClass } from "./setup";
import { tagChipClass, type TagColor } from "./tagColors";

interface Props {
  project: OpenSessionProject;
  description: string;
  genres: string[];
  tagColors: Record<string, TagColor>;
  /** Setup labels exactly as shown on the card. */
  setup: string[];
  coverUrl?: string;
  onClose: () => void;
}

const heading = "mb-2 text-xs font-semibold text-[var(--os-muted)]";

export default function ProjectDetailsDialog({ project, description, genres, tagColors, setup, coverUrl, onClose }: Props) {
  const facts: [string, string][] = [
    ["Length", `${formatTime(project.duration)} (${project.duration.toFixed(2)}s)`],
    ["DAW", project.daw.version ? `${project.daw.name} ${project.daw.version}` : project.daw.name],
    ["Tracks", String(project.tracks.length)],
    ...(project.bpm ? [["BPM", String(project.bpm)] as [string, string]] : []),
    ...(project.key ? [["Key", project.key] as [string, string]] : []),
  ];

  return (
    <Modal
      wide
      title={project.title}
      subtitle={`${project.owner} / ${project.slug}`}
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <Link
            href={projectHref(project)}
            className="rounded-md bg-[#238636] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#2ea043]"
          >
            Open session
          </Link>
        </div>
      }
    >
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt={`${project.title} cover`}
          className="max-h-80 w-full rounded-md border border-[var(--os-border)] bg-[var(--os-bg)] object-contain"
        />
      ) : (
        <MiniTimeline project={project} className="h-36 rounded-md border border-[var(--os-border)] py-4" />
      )}

      {description && (
        <section>
          <h3 className={heading}>Description</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--os-text)]">{description}</p>
        </section>
      )}

      <section>
        <h3 className={heading}>Tags</h3>
        <div className="flex flex-wrap gap-1.5">
          {genres.map((g) => (
            <span key={g} className={tagChipClass(tagColors[g])}>{g}</span>
          ))}
          {genres.length === 0 && <span className="text-xs text-[var(--os-faint)]">No tags</span>}
        </div>
      </section>

      <section>
        <h3 className={heading}>Setup</h3>
        <div className="flex flex-wrap gap-1.5">
          {setup.map((d) => (
            <span key={d} className={setupChipClass}>{d}</span>
          ))}
        </div>
      </section>

      <section>
        <h3 className={heading}>Session</h3>
        <dl className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
          {facts.map(([k, v]) => (
            <div key={k} className="border-b border-[var(--os-subtle)] py-1.5">
              <dt className="text-xs text-[var(--os-muted)]">{k}</dt>
              <dd className="font-mono text-sm tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h3 className={heading}>Tracks</h3>
        <ul className="divide-y divide-[var(--os-subtle)] rounded-md border border-[var(--os-border)]">
          {project.tracks.map((t, i) => {
            const first = Math.min(...t.items.map((it) => it.start));
            const last = Math.max(...t.items.map((it) => it.start + it.length));
            return (
              <li key={t.id} className="flex items-center gap-3 px-3 py-2">
                <span className="h-6 w-1 shrink-0 rounded-full" style={{ backgroundColor: trackColor(i) }} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{t.name}</div>
                  <div className="truncate text-xs text-[var(--os-muted)]">
                    {t.plugins.length ? t.plugins.map((p) => p.name).join(" → ") : "No effects"}
                  </div>
                </div>
                <div className="shrink-0 text-right font-mono text-xs tabular-nums text-[var(--os-muted)]">
                  {t.items.length ? (
                    <>
                      <div>
                        {formatTime(first)}–{formatTime(last)}
                      </div>
                      <div>
                        {t.items.length} clip{t.items.length === 1 ? "" : "s"}
                      </div>
                    </>
                  ) : (
                    "No clips"
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </Modal>
  );
}
