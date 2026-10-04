"use client";
import type { OpenSessionProject } from "@/types/session";
import { formatTime, trackColor } from "./format";

export const RULER_H = "h-8";
export const ROW_H = "h-14";

interface Props {
  project: OpenSessionProject;
  selectedTrackId: string | null;
  isAudible: (trackId: string) => boolean;
  currentTime: number;
  onSelectTrack: (trackId: string) => void;
  onSeek: (t: number) => void;
}

export default function Timeline({
  project,
  selectedTrackId,
  isAudible,
  currentTime,
  onSelectTrack,
  onSeek,
}: Props) {
  const { duration } = project;
  const step = duration > 60 ? 10 : 5;
  const ticks = Array.from({ length: Math.floor(duration / step) + 1 }, (_, i) => i * step);

  return (
    <div className="relative min-w-[560px]">
      {/* ruler — click to seek */}
      <div
        className={`relative ${RULER_H} cursor-pointer border-b border-[#30363d] bg-[#161b22]`}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onSeek(((e.clientX - r.left) / r.width) * duration);
        }}
      >
        {ticks.map((t) => (
          <div
            key={t}
            className="absolute top-0 h-full border-l border-[#30363d] pl-1 font-mono text-[10px] leading-8 text-[#8b949e]"
            style={{ left: `${(t / duration) * 100}%` }}
          >
            {t / duration < 0.95 ? formatTime(t) : null}
          </div>
        ))}
      </div>

      {/* lanes */}
      {project.tracks.map((track, i) => {
        const selected = track.id === selectedTrackId;
        const audible = isAudible(track.id);
        return (
          <div
            key={track.id}
            onClick={() => onSelectTrack(track.id)}
            className={`relative ${ROW_H} cursor-pointer border-b border-[#30363d] ${
              selected ? "bg-[#1c2128]" : "bg-[#0d1117]"
            }`}
          >
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute top-0 h-full border-l border-[#21262d]"
                style={{ left: `${(t / duration) * 100}%` }}
              />
            ))}
            {track.items.map((item) => (
              <div
                key={item.id}
                title={`${item.name ?? track.name} · ${item.start.toFixed(2)}s → ${(item.start + item.length).toFixed(2)}s`}
                className="absolute bottom-2 top-2 overflow-hidden rounded-[3px] border px-1.5 text-[10px] font-medium leading-6 text-[#e6edf3]"
                style={{
                  left: `${(item.start / duration) * 100}%`,
                  width: `${(item.length / duration) * 100}%`,
                  backgroundColor: `${trackColor(i)}${audible ? "40" : "1a"}`,
                  borderColor: trackColor(i),
                  opacity: audible ? 1 : 0.5,
                }}
              >
                <span className="block truncate">{item.name ?? track.name}</span>
              </div>
            ))}
          </div>
        );
      })}

      {/* shared playhead */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-px bg-[#f85149]"
        style={{ left: `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%` }}
      >
        <div className="absolute -left-[4px] top-0 h-0 w-0 border-x-[4.5px] border-t-[7px] border-x-transparent border-t-[#f85149]" />
      </div>
    </div>
  );
}
