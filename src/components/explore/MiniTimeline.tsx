import type { OpenSessionProject } from "@/types/session";
import { trackColor } from "@/components/session/format";

/** The real clip layout, miniaturised. Used as the default cover. */
export default function MiniTimeline({ project, className = "" }: { project: OpenSessionProject; className?: string }) {
  return (
    <div className={`flex flex-col justify-center gap-[3px] bg-[#0d1117] px-3 ${className}`} aria-hidden>
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
  );
}
