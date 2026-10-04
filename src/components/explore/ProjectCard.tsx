import Link from "next/link";
import type { OpenSessionProject } from "@/types/session";
import { trackColor } from "@/components/session/format";
import { projectHref } from "@/lib/projects";

export default function ProjectCard({ project }: { project: OpenSessionProject }) {
  const pluginNames = [...new Set(project.tracks.flatMap((t) => t.plugins.map((pl) => pl.name)))];
  const chip = "rounded-full border border-[#30363d] px-2 py-0.5 text-[11px] text-[#8b949e]";

  return (
    <Link
      href={projectHref(project)}
      className="group block overflow-hidden rounded-md border border-[#30363d] bg-[#161b22] transition hover:border-[#8b949e] focus-visible:outline-2 focus-visible:outline-[#2f81f7]"
    >
      {/* thumbnail: the real clip layout, miniaturised */}
      <div className="space-y-[3px] border-b border-[#30363d] bg-[#0d1117] p-3" aria-hidden>
        {project.tracks.map((t, i) => (
          <div key={t.id} className="relative h-2 rounded-sm bg-[#161b22]">
            {t.items.map((item) => (
              <div
                key={item.id}
                className="absolute inset-y-0 rounded-[2px]"
                style={{
                  left: `${(item.start / project.duration) * 100}%`,
                  width: `${(item.length / project.duration) * 100}%`,
                  backgroundColor: trackColor(i),
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="space-y-2 p-4">
        <div>
          <h2 className="text-base font-semibold text-[#e6edf3] group-hover:text-[#2f81f7]">
            {project.title}
          </h2>
          <p className="text-xs text-[#8b949e]">
            {project.owner} / {project.slug}
          </p>
        </div>
        {project.description && (
          <p className="line-clamp-2 text-sm text-[#8b949e]">{project.description}</p>
        )}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.genres.map((g) => (
            <span key={g} className={chip}>{g}</span>
          ))}
          <span className={chip}>{project.daw.name}</span>
          <span className={chip}>{project.tracks.length} tracks</span>
          {pluginNames.map((n) => (
            <span key={n} className={`${chip} border-[#1f6feb]/50 text-[#58a6ff]`}>{n}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
